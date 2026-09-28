// Keep staging identities off the public customer domain until production approval.
export function singpassAvailable(host: string) {
  if (process.env.SINGPASS_ENV === "production") return process.env.SINGPASS_PRODUCTION_APPROVED === "true";
  return host === "hms-credit.vercel.app" || (process.env.NODE_ENV !== "production" && /^localhost(:\d+)?$/.test(host));
}
