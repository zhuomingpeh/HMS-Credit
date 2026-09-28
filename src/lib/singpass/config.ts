import "server-only";

// Central place for every Singpass-related env var + fixed endpoint.
//
// HMS has a tested staging registration. Production remains gated on its own approval,
// credentials and exact callback registration; see SINGPASS-PRODUCTION.md.

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
// else. Staging retains the Vercel callback; approved production uses hmsmoney.com.
export function singpassRedirectUri(): string {
  if (process.env.SINGPASS_ENV === "production") {
    const uri = requireEnv("SINGPASS_REDIRECT_URI");
    if (uri !== "https://hmsmoney.com/api/auth/singpass/callback") throw new Error("Production callback must use the registered HMS domain");
    return uri;
  }
  return process.env.SINGPASS_REDIRECT_URI ?? "https://hms-credit.vercel.app/api/auth/singpass/callback";
}
