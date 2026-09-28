import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export const draftHash = (token: string) => createHash("sha256").update(token).digest("hex");
function key() {
  const raw = process.env.MYINFO_DRAFT_KEY;
  if (!raw || !/^[a-f0-9]{64}$/i.test(raw)) throw new Error("Myinfo draft encryption is not configured");
  return Buffer.from(raw, "hex");
}
export function encryptDraft(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}
export function decryptDraft(value: string): unknown {
  const bytes = Buffer.from(value, "base64url");
  const cipher = createDecipheriv("aes-256-gcm", key(), bytes.subarray(0, 12));
  cipher.setAuthTag(bytes.subarray(12, 28));
  return JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString("utf8"));
}
