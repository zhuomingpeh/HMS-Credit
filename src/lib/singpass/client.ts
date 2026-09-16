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
import type { Prisma } from "@/generated/prisma/client";

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
    const body = await res.text().catch(() => "");
    throw new Error(`PAR request failed (${res.status}): ${body}`);
  }
  return res.json();
}

// This app must be registered under Singpass's FAPI 2.0 security profile (confirmed the
// required default for any Myinfo app created today, 2026-09-16) — see discovery.ts and
// config.ts's singpassFapiDiscoveryUrl() for how every endpoint is derived rather than
// hardcoded.
export async function startSingpassAuth(prefill?: { loanAmount?: number; loanType?: string }): Promise<{ redirectUrl: string }> {
  const discovery = await getSingpassFapiDiscoveryDocument(singpassFapiDiscoveryUrl());
  const clientId = singpassClientId();
  const redirectUri = singpassRedirectUri();

  const state = generateStateOrNonce();
  const nonce = generateStateOrNonce();
  const { codeVerifier, codeChallenge } = generatePkce();
  const dpop = await generateDpopKeypair();

  // Client assertion `aud` must be the exact endpoint being called (the PAR endpoint here), not
  // the bare issuer — this is FAPI's private_key_jwt convention (RFC 7523 §3).
  const clientAssertion = await buildClientAssertion(discovery.pushed_authorization_request_endpoint, clientId);
  const dpopProof = await buildDpopProof(dpop, "POST", discovery.pushed_authorization_request_endpoint);

  const { request_uri } = await withRetry(
    () =>
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
          client_assertion: clientAssertion,
        },
        dpopProof,
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

  try {
    const discovery = await getSingpassFapiDiscoveryDocument(singpassFapiDiscoveryUrl());
    const clientId = singpassClientId();
    const redirectUri = singpassRedirectUri();

    const clientAssertion = await buildClientAssertion(discovery.token_endpoint, clientId);
    const tokenDpopProof = await buildDpopProof(dpop, "POST", discovery.token_endpoint);

    const tokenRes = await withRetry(async () => {
      const res = await fetch(discovery.token_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", DPoP: tokenDpopProof },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: session.codeVerifier,
          client_assertion_type: CLIENT_ASSERTION_TYPE,
          client_assertion: clientAssertion,
        }).toString(),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Token request failed (${res.status}): ${body}`);
      }
      return res.json() as Promise<{ id_token: string; access_token: string }>;
    }, isRetryableUpstreamError);

    const idTokenClaims = await decryptAndVerify(tokenRes.id_token, {
      jwksUri: discovery.jwks_uri,
      expectedIssuer: discovery.issuer,
      expectedAudience: clientId,
      expectedNonce: session.nonce,
    });

    const userinfoDpopProof = await buildDpopProof(dpop, "GET", discovery.userinfo_endpoint, {
      ath: accessTokenHash(tokenRes.access_token),
    });

    const userinfoBody = await withRetry(async () => {
      const res = await fetch(discovery.userinfo_endpoint, {
        headers: { Authorization: `DPoP ${tokenRes.access_token}`, DPoP: userinfoDpopProof },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Userinfo request failed (${res.status}): ${body}`);
      }
      return res.text();
    }, isRetryableUpstreamError);

    const userinfoClaims = await decryptAndVerify(userinfoBody, {
      jwksUri: discovery.jwks_uri,
      expectedIssuer: discovery.issuer,
      expectedAudience: clientId,
    });

    const personInfo = ((userinfoClaims as Record<string, unknown>).person_info ?? userinfoClaims) as MyInfoPersonInfo;
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
