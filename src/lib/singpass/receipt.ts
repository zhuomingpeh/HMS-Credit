import "server-only";
import { SignJWT, importJWK, jwtVerify } from "jose";
import { singpassSigPrivateJwk } from "./config";
export const RECEIPT_COOKIE = "hms_application_receipt";
export async function createReceipt(): Promise<string> {
  const key = await importJWK(singpassSigPrivateJwk(), "ES256");
  return new SignJWT({ received: true }).setProtectedHeader({ alg: "ES256" })
    .setIssuer("hms-credit").setAudience("application-receipt").setIssuedAt().setExpirationTime("5m").sign(key);
}
export async function verifyReceipt(token: string): Promise<boolean> {
  try {
    const { d: _private, ...publicKey } = singpassSigPrivateJwk();
    void _private;
    const { payload } = await jwtVerify(token, await importJWK(publicKey, "ES256"), {
      issuer: "hms-credit", audience: "application-receipt", algorithms: ["ES256"], requiredClaims: ["exp", "iat"],
    });
    return payload.received === true;
  } catch { return false; }
}
