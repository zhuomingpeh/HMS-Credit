import "server-only";
import { randomBytes, createHash, randomUUID } from "crypto";
import { SignJWT, importJWK, compactDecrypt, jwtVerify, createRemoteJWKSet } from "jose";
import { singpassSigPrivateJwk, singpassEncPrivateJwk } from "./config";

// Cryptographic primitives for the FAPI 2.0 flow: client assertion, DPoP, PKCE, and the shared
// JWE-decrypt-then-JWS-verify step used for both the ID token and the userinfo response.
// Ported from Loanify's production-approved implementation — same mechanics apply to any FAPI
// 2.0 Singpass app, only the key material (config.ts) differs per registration.

function base64url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const CLIENT_ASSERTION_TTL_SECONDS = 120; // Singpass requires exp <= iat + 2min

/** Signed JWT proving we hold the private half of our published `sig` key — required on every
 * PAR and token request (`private_key_jwt` client authentication). */
export async function buildClientAssertion(audience: string, clientId: string): Promise<string> {
  const jwk = singpassSigPrivateJwk();
  const key = await importJWK(jwk, "ES256");

  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", typ: "JWT", kid: jwk.kid as string })
    .setSubject(clientId)
    .setIssuer(clientId)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${CLIENT_ASSERTION_TTL_SECONDS}s`)
    .setJti(randomUUID())
    .sign(key);
}

export type DpopKeypair = { privateJwk: Record<string, string>; publicJwk: Record<string, string> };

/** One ephemeral EC P-256 keypair per login attempt (not per request) — reused across
 * PAR → token → userinfo for a single session, never across sessions. */
export async function generateDpopKeypair(): Promise<DpopKeypair> {
  const { generateKeyPair, exportJWK } = await import("jose");
  const { publicKey, privateKey } = await generateKeyPair("ES256", { extractable: true });
  const publicJwk = (await exportJWK(publicKey)) as unknown as Record<string, string>;
  const privateJwk = (await exportJWK(privateKey)) as unknown as Record<string, string>;
  return { privateJwk, publicJwk };
}

const DPOP_TTL_SECONDS = 120; // Singpass requires exp <= iat + 2min

/** DPoP proof JWT for one HTTP request. `ath` is required on the userinfo call only
 * (base64url(SHA-256(access_token))) — omit for PAR/token requests. */
export async function buildDpopProof(
  keypair: DpopKeypair,
  htm: string,
  htu: string,
  opts?: { ath?: string },
): Promise<string> {
  const key = await importJWK(keypair.privateJwk, "ES256");

  return new SignJWT({ htm, htu, ...(opts?.ath ? { ath: opts.ath } : {}) })
    .setProtectedHeader({ alg: "ES256", typ: "dpop+jwt", jwk: keypair.publicJwk })
    .setIssuedAt()
    .setExpirationTime(`${DPOP_TTL_SECONDS}s`)
    .setJti(randomUUID())
    .sign(key);
}

/** base64url(SHA-256(accessToken)) — the `ath` claim on a userinfo DPoP proof. */
export function accessTokenHash(accessToken: string): string {
  return base64url(createHash("sha256").update(accessToken).digest());
}

export type PkcePair = { codeVerifier: string; codeChallenge: string };

/** Fresh PKCE pair per authorization attempt. codeVerifier: 43-128 char, unreserved charset —
 * 64 random bytes base64url-encoded comfortably lands in that range. */
export function generatePkce(): PkcePair {
  const codeVerifier = base64url(randomBytes(64));
  const codeChallenge = base64url(createHash("sha256").update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

/** CSPRNG state/nonce values — Singpass requires >= 30 chars, persisted server-side. */
export function generateStateOrNonce(): string {
  return base64url(randomBytes(32));
}

export type VerifiedClaims = Record<string, string> & { iss: string; aud: string | string[]; sub: string };

/** Shared decrypt-then-verify step for both the ID token and the (also JWE-then-JWS) userinfo
 * response: JWE decrypt with our `enc` private key, then JWS verify against Singpass's own
 * published JWKS, then validate iss/aud/exp (jose already enforces exp) and, when supplied,
 * nonce. */
export async function decryptAndVerify(
  token: string,
  opts: { jwksUri: string; expectedIssuer: string; expectedAudience: string; expectedNonce?: string },
): Promise<VerifiedClaims> {
  const encKey = await importJWK(singpassEncPrivateJwk(), "ECDH-ES+A256KW");
  const { plaintext } = await compactDecrypt(token, encKey);
  const innerJwt = new TextDecoder().decode(plaintext);

  const jwks = createRemoteJWKSet(new URL(opts.jwksUri));
  let payload;
  try {
    ({ payload } = await jwtVerify(innerJwt, jwks, {
      issuer: opts.expectedIssuer,
      audience: opts.expectedAudience,
    }));
  } catch (err) {
    const [, payloadB64] = innerJwt.split(".");
    let actualClaims = "<unparseable>";
    try {
      actualClaims = Buffer.from(payloadB64, "base64url").toString("utf8");
    } catch {
      // leave as <unparseable>
    }
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`${reason} — expected iss=${opts.expectedIssuer} aud=${opts.expectedAudience} — actual claims: ${actualClaims}`);
  }

  if (opts.expectedNonce && payload.nonce !== opts.expectedNonce) {
    throw new Error("Singpass response nonce mismatch");
  }

  return payload as VerifiedClaims;
}
