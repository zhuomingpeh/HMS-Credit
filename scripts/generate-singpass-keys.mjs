import { generateKeyPair, exportJWK } from "jose";
import { randomUUID } from "crypto";

async function makeKey(use, alg) {
  const { publicKey, privateKey } = await generateKeyPair(alg, { crv: "P-256", extractable: true });
  const pubJwk = await exportJWK(publicKey);
  const privJwk = await exportJWK(privateKey);
  const kid = `hms-credit-${use}-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8)}`;
  pubJwk.kid = kid;
  pubJwk.use = use;
  pubJwk.alg = alg;
  privJwk.kid = kid;
  privJwk.use = use;
  privJwk.alg = alg;
  return { pubJwk, privJwk };
}

const sig = await makeKey("sig", "ES256");
const enc = await makeKey("enc", "ECDH-ES+A256KW");

console.log("=== PUBLIC JWKS (for src/lib/singpass/jwks.ts) ===");
console.log(JSON.stringify({ keys: [sig.pubJwk, enc.pubJwk] }, null, 2));

console.log("\n=== PRIVATE SIG JWK (env: SINGPASS_SIG_PRIVATE_JWK) ===");
console.log(JSON.stringify(sig.privJwk));

console.log("\n=== PRIVATE ENC JWK (env: SINGPASS_ENC_PRIVATE_JWK) ===");
console.log(JSON.stringify(enc.privJwk));
