import "server-only";

// FAPI 2.0 apps have their own discovery document, distinct from the standard
// `/.well-known/openid-configuration` — every endpoint this integration needs (par/auth/token/
// userinfo, plus the `/fapi`-suffixed issuer) is listed here directly.
export type SingpassFapiDiscoveryDocument = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  pushed_authorization_request_endpoint: string;
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cache: { doc: SingpassFapiDiscoveryDocument; fetchedAt: number; url: string } | null = null;

/** Module-level cache — best-effort within one warm serverless instance, not a guarantee across
 * cold starts. A cold start pays one extra fetch; a warm instance never re-fetches within the TTL. */
export async function getSingpassFapiDiscoveryDocument(discoveryUrl: string): Promise<SingpassFapiDiscoveryDocument> {
  if (cache && cache.url === discoveryUrl && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.doc;
  }

  const source = new URL(discoveryUrl);
  if (source.protocol !== "https:" || !["id.singpass.gov.sg", "stg-id.singpass.gov.sg"].includes(source.hostname)) throw new Error("Invalid discovery host");
  const res = await fetch(discoveryUrl, { signal: AbortSignal.timeout(10000), redirect: "error" });
  if (!res.ok) {
    throw new Error(`Singpass FAPI discovery fetch failed: ${res.status}`);
  }
  const doc = (await res.json()) as SingpassFapiDiscoveryDocument;
  if (doc.issuer !== `${source.origin}/fapi`) throw new Error("Invalid discovery issuer");
  for (const value of [doc.authorization_endpoint, doc.token_endpoint, doc.userinfo_endpoint, doc.jwks_uri, doc.pushed_authorization_request_endpoint]) {
    const endpoint = new URL(value);
    if (endpoint.origin !== source.origin || endpoint.username || endpoint.password) throw new Error("Invalid discovery endpoint");
  }
  cache = { doc, fetchedAt: Date.now(), url: discoveryUrl };
  return doc;
}
