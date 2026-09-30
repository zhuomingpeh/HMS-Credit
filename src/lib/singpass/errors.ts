// Authentication logs must not include token payloads, URLs, database errors or PII.
// Preserve only the controlled HTTP status/code messages created by our client.
export function safeSingpassError(error: unknown): string {
  if (error instanceof Error && /^(PAR|Token|Userinfo) request failed \([1-5]\d{2}; (server_error|upstream_dependency_error|temporarily_unavailable|invalid_request|invalid_token|invalid_dpop_proof|invalid_client|invalid_grant|invalid_scope|unauthorized_client|unclassified)\)$/.test(error.message)) return error.message;
  if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) return "Authentication upstream timed out";
  return "Authentication operation failed";
}
