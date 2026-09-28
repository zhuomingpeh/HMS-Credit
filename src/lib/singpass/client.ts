import "server-only";
import { bindSingpassBrowser, consumeSingpassBrowser } from "./browserBinding";
import { prisma } from "@/lib/prisma";
import { getSingpassFapiDiscoveryDocument } from "./discovery";
import { singpassClientId, singpassRedirectUri, singpassFapiDiscoveryUrl } from "./config";
import {
  buildClientAssertion,
  buildDpopProof,
  generateDpopKeypair,
  generatePkce,
  generateStateOrNonce,
  accessTokenHash,
  decryptAndVerify,
  type DpopKeypair,
} from "./crypto";
import { mapMyInfoToApplicant, type MyInfoPersonInfo } from "./myinfo";
import { sendNewApplicantAdminEmail } from "@/lib/email";
import { Prisma } from "@/generated/prisma/client";

const CLIENT_ASSERTION_TYPE = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes — the whole authorize -> callback round trip

// Exactly the 28 fields in this project's Singpass app registration justification table — no
// more, no fewer, per Singpass's "don't request what you don't use" principle. Confirmed scope
// names against Singpass's own docs (2026-09-16), matching Loanify's already-approved usage for
// every field the two apps share.
const SCOPES = [
  "openid",
  "uinfin",
  "name",
  "sex",
  "race",
  "dob",
  "residentialstatus",
  "nationality",
  "passtype",
  "passstatus",
  "passexpirydate",
  "mobileno",
  "email",
  "regadd",
  "housingtype",
  "cpfcontributions",
  "noahistory",
  "ownerprivate",
  "employment",
  "occupation",
  "marital",
  "vehicles.vehicleno",
  "hdbownership.noofowners",
  "hdbownership.address",
  "hdbownership.hdbtype",
  "hdbownership.leasecommencementdate",
  "hdbownership.dateofpurchase",
  "hdbownership.outstandingloanbalance",
  "hdbownership.monthlyloaninstalment",
].join(" ");

const RETRYABLE_ERRORS = ["server_error", "upstream_dependency_error", "temporarily_unavailable"];

// Log only documented error codes, never upstream descriptions, tokens or personal data.
const SAFE_UPSTREAM_CODES = new Set([
  ...RETRYABLE_ERRORS, "invalid_request", "invalid_token", "invalid_dpop_proof",
  "invalid_client", "invalid_grant", "invalid_scope", "unauthorized_client",
]);

async function upstreamError(stage: string, res: Response): Promise<Error> {
  const body: unknown = await res.json().catch(() => null);
  const code = body && typeof body === "object" && "error" in body ? body.error : undefined;
  const safeCode = typeof code === "string" && SAFE_UPSTREAM_CODES.has(code) ? code : "unclassified";
  return new Error(`${stage} request failed (${res.status}; ${safeCode})`);
}

/** Retry transient upstream failures up to 3x with backoff before giving up — never leave the
 * applicant stuck mid-flow on a raw error. */
async function withRetry<T>(fn: () => Promise<T>, isRetryable: (err: unknown) => boolean): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryable(err)) throw err;
      await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
    }
  }
  throw lastError;
}

function isRetryableUpstreamError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return RETRYABLE_ERRORS.some((code) => message.includes(code));
}

async function parRequest(
  parUrl: string,
  params: Record<string, string>,
  dpopProof: string,
): Promise<{ request_uri: string }> {
  const res = await fetch(parUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", DPoP: dpopProof },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) {
    throw await upstreamError("PAR", res);
  }
  return res.json();
}

// This app must be registered under Singpass's FAPI 2.0 security profile (confirmed the
// required default for any Myinfo app created today, 2026-09-16) — see discovery.ts and
// config.ts's singpassFapiDiscoveryUrl() for how every endpoint is derived rather than
// hardcoded.
export async function startSingpassAuth(prefill?: { loanAmount?: number; loanType?: string }): Promise<{ redirectUrl: string }> {
  // Abandoned authorization material is no longer usable after the session TTL.
  await prisma.singpassAuthSession.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - SESSION_TTL_MS) } },
  });
  const discovery = await getSingpassFapiDiscoveryDocument(singpassFapiDiscoveryUrl());
  const clientId = singpassClientId();
  const redirectUri = singpassRedirectUri();

  const state = generateStateOrNonce();
  const nonce = generateStateOrNonce();
  const { codeVerifier, codeChallenge } = generatePkce();
  const dpop = await generateDpopKeypair();

  // Client assertion audience is the discovery issuer (Singpass FAPI guide).
  const { request_uri } = await withRetry(
    async () =>
      parRequest(
        discovery.pushed_authorization_request_endpoint,
        {
          response_type: "code",
          client_id: clientId,
          scope: SCOPES,
          state,
          nonce,
          redirect_uri: redirectUri,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
          client_assertion_type: CLIENT_ASSERTION_TYPE,
          client_assertion: await buildClientAssertion(discovery.issuer, clientId),
        },
        await buildDpopProof(dpop, "POST", discovery.pushed_authorization_request_endpoint),
      ),
    isRetryableUpstreamError,
  );

  await prisma.singpassAuthSession.create({
    data: {
      state,
      nonce,
      codeVerifier,
      dpopPrivateJwk: dpop.privateJwk,
      dpopPublicJwk: dpop.publicJwk,
      loanAmount: prefill?.loanAmount,
      loanType: prefill?.loanType,
    },
  });

  await bindSingpassBrowser(state);
  const redirectUrl = `${discovery.authorization_endpoint}?client_id=${encodeURIComponent(clientId)}&request_uri=${encodeURIComponent(request_uri)}`;
  return { redirectUrl };
}

export type CompleteSingpassAuthResult = { applicantId: string } | { error: string };

export async function completeSingpassAuth(code: string, state: string): Promise<CompleteSingpassAuthResult> {
  if (!(await consumeSingpassBrowser(state))) return { error: "Sign-in browser mismatch. Please start again." };
  const session = await prisma.singpassAuthSession.findUnique({ where: { state } });
  if (!session || session.consumedAt || Date.now() - session.createdAt.getTime() > SESSION_TTL_MS) {
    return { error: "This Singpass sign-in has expired or was already used. Please try again." };
  }
  if (!session.dpopPrivateJwk || !session.dpopPublicJwk) {
    return { error: "This Singpass sign-in is invalid. Please try again." };
  }
  const dpop: DpopKeypair = {
    privateJwk: session.dpopPrivateJwk as Record<string, string>,
    publicJwk: session.dpopPublicJwk as Record<string, string>,
  };

  const claimed = await prisma.singpassAuthSession.updateMany({
    where: { id: session.id, consumedAt: null, createdAt: { gt: new Date(Date.now() - SESSION_TTL_MS) } },
    // Keep the already-loaded material only in this request's memory during exchange.
    data: { consumedAt: new Date(), dpopPrivateJwk: Prisma.DbNull, dpopPublicJwk: Prisma.DbNull, codeVerifier: "", nonce: "" },
  });
  if (claimed.count !== 1) return { error: "This sign-in was already used or expired." };

  try {
    const discovery = await getSingpassFapiDiscoveryDocument(singpassFapiDiscoveryUrl());
    const clientId = singpassClientId();
    const redirectUri = singpassRedirectUri();

    const tokenRes = await withRetry(async () => {
      const res = await fetch(discovery.token_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", DPoP: await buildDpopProof(dpop, "POST", discovery.token_endpoint) },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: session.codeVerifier,
          client_assertion_type: CLIENT_ASSERTION_TYPE,
          client_assertion: await buildClientAssertion(discovery.issuer, clientId),
        }).toString(),
      });
      if (!res.ok) {
        throw await upstreamError("Token", res);
      }
      return res.json() as Promise<{ id_token: string; access_token: string }>;
    }, isRetryableUpstreamError);
    if (typeof tokenRes.id_token !== "string" || typeof tokenRes.access_token !== "string") {
      throw new Error("Invalid token response");
    }

    const idTokenClaims = await decryptAndVerify(tokenRes.id_token, {
      tokenUse: "id_token",
      jwksUri: discovery.jwks_uri,
      expectedIssuer: discovery.issuer,
      expectedAudience: clientId,
      expectedNonce: session.nonce,
    });

    const userinfoBody = await withRetry(async () => {
      const res = await fetch(discovery.userinfo_endpoint, {
        headers: { Authorization: `DPoP ${tokenRes.access_token}`, DPoP: await buildDpopProof(dpop, "GET", discovery.userinfo_endpoint, { ath: accessTokenHash(tokenRes.access_token) }) },
      });
      if (!res.ok) {
        throw await upstreamError("Userinfo", res);
      }
      return res.text();
    }, isRetryableUpstreamError);

    const userinfoClaims = await decryptAndVerify(userinfoBody, {
      tokenUse: "userinfo",
      jwksUri: discovery.jwks_uri,
      expectedIssuer: discovery.issuer,
      expectedAudience: clientId,
    });

    if (userinfoClaims.sub !== idTokenClaims.sub) throw new Error("Userinfo subject mismatch");
    if (!userinfoClaims.person_info || typeof userinfoClaims.person_info !== "object" || Array.isArray(userinfoClaims.person_info)) {
      throw new Error("Missing Myinfo person_info");
    }
    const personInfo = userinfoClaims.person_info as MyInfoPersonInfo;
    const singpassSub = idTokenClaims.sub;
    const mapped = mapMyInfoToApplicant(personInfo);

    if (!mapped.nric || !mapped.name || !mapped.residentialStatus) {
      return { error: "Singpass didn't return enough information to complete an application. Please try again or apply manually." };
    }

    // One Applicant per singpassSub — a repeat application from the same identity updates the
    // existing row (fresh MyInfo pull) rather than creating a duplicate for staff to dedupe.
    const applicant = await prisma.applicant.upsert({
      where: { singpassSub },
      create: {
        singpassSub,
        nric: mapped.nric,
        name: mapped.name,
        sex: mapped.sex,
        race: mapped.race,
        dateOfBirth: mapped.dateOfBirth,
        residentialStatus: mapped.residentialStatus,
        nationality: mapped.nationality,
        passType: mapped.passType,
        passStatus: mapped.passStatus,
        passExpiryDate: mapped.passExpiryDate,
        mobileNumber: mapped.mobileNumber,
        email: mapped.email,
        address: mapped.address as Prisma.InputJsonValue,
        housingType: mapped.housingType,
        ownsPrivateProperty: mapped.ownsPrivateProperty,
        employerName: mapped.employerName,
        occupation: mapped.occupation,
        maritalStatus: mapped.maritalStatus,
        vehicleNumbers: mapped.vehicleNumbers,
        hdbOwnership: mapped.hdbOwnership as Prisma.InputJsonValue,
        cpfContributions: mapped.cpfContributions as unknown as Prisma.InputJsonValue,
        noticeOfAssessments: mapped.noticeOfAssessments as unknown as Prisma.InputJsonValue,
        rawMyInfo: personInfo as Prisma.InputJsonValue,
        loanAmount: session.loanAmount,
        loanType: session.loanType,
      },
      update: {
        nric: mapped.nric,
        name: mapped.name,
        sex: mapped.sex,
        race: mapped.race,
        dateOfBirth: mapped.dateOfBirth,
        residentialStatus: mapped.residentialStatus,
        nationality: mapped.nationality,
        passType: mapped.passType,
        passStatus: mapped.passStatus,
        passExpiryDate: mapped.passExpiryDate,
        mobileNumber: mapped.mobileNumber,
        email: mapped.email,
        address: mapped.address as Prisma.InputJsonValue,
        housingType: mapped.housingType,
        ownsPrivateProperty: mapped.ownsPrivateProperty,
        employerName: mapped.employerName,
        occupation: mapped.occupation,
        maritalStatus: mapped.maritalStatus,
        vehicleNumbers: mapped.vehicleNumbers,
        hdbOwnership: mapped.hdbOwnership as Prisma.InputJsonValue,
        cpfContributions: mapped.cpfContributions as unknown as Prisma.InputJsonValue,
        noticeOfAssessments: mapped.noticeOfAssessments as unknown as Prisma.InputJsonValue,
        rawMyInfo: personInfo as Prisma.InputJsonValue,
        loanAmount: session.loanAmount ?? undefined,
        loanType: session.loanType ?? undefined,
      },
    });

    await prisma.singpassAuthSession.update({ where: { id: session.id }, data: { consumedAt: new Date() } });

    await sendNewApplicantAdminEmail({
      name: applicant.name,
      residentialStatus: applicant.residentialStatus,
      loanAmount: applicant.loanAmount ?? undefined,
      loanType: applicant.loanType ?? undefined,
    });

    return { applicantId: applicant.id };
  } catch (err) {
    await prisma.singpassAuthSession.update({ where: { id: session.id }, data: { consumedAt: new Date() } }).catch(() => {});
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[singpass] ${message}`);
    return { error: `Singpass sign-in didn't complete: ${message}` };
  }
}
