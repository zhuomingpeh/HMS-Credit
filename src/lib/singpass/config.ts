import "server-only";

// Central place for every Singpass-related env var + fixed endpoint.
//
// Adapted from Loanify's production-approved Singpass integration (src/lib/singpass/config.ts
// there) — same FAPI 2.0 mechanics, different app registration. None of these env vars are set
// yet: HMS Credit's Singpass app hasn't been registered in the Developer Portal. Every function
// here throws until it is — callers (client.ts's startSingpassAuth) already handle that by
// failing soft back to the manual application form, so an unconfigured deployment stays safe.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function singpassClientId(): string {
  return requireEnv("SINGPASS_CLIENT_ID");
}

export function singpassSigPrivateJwk(): Record<string, unknown> {
  return JSON.parse(requireEnv("SINGPASS_SIG_PRIVATE_JWK"));
}

export function singpassEncPrivateJwk(): Record<string, unknown> {
  return JSON.parse(requireEnv("SINGPASS_ENC_PRIVATE_JWK"));
}

function issuerHostFor(env: string | undefined): string {
  return env === "production" ? "id.singpass.gov.sg" : "stg-id.singpass.gov.sg";
}

// FAPI 2.0 apps (the required profile for any Myinfo app created today — confirmed against
// Singpass's own docs, 2026-09-16) have a separate discovery document from the standard
// `/.well-known/openid-configuration` — every FAPI endpoint (par/auth/token/userinfo, plus the
// `/fapi`-suffixed issuer) is listed here directly. Derive endpoints from this document rather
// than hardcoding them, per Singpass/GovTech's guidance for FAPI relying parties.
export function singpassFapiDiscoveryUrl(): string {
  return `https://${issuerHostFor(process.env.SINGPASS_ENV ?? "staging")}/fapi/.well-known/openid-configuration`;
}

// Must be an exact match to what's registered against the SDP app — Singpass rejects anything
// else. Defaults to the current Vercel deployment URL since hmsmoney.com isn't wired up yet
// (deliberately, per the user — domain cutover waits until Singpass + everything else is
// ready); update SINGPASS_REDIRECT_URI once re-registering the app against the real domain.
export function singpassRedirectUri(): string {
  return process.env.SINGPASS_REDIRECT_URI ?? "https://hms-credit.vercel.app/api/auth/singpass/callback";
}
