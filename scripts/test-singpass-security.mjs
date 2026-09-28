import { readFile, writeFile, unlink } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import ts from 'typescript';
import { generateKeyPair, exportJWK, SignJWT, CompactEncrypt, decodeJwt } from 'jose';
const runtime = new URL('./.singpass-test-runtime.mjs', import.meta.url);
const enc = await generateKeyPair('ECDH-ES+A256KW', { extractable: true });
const sig = await generateKeyPair('ES256', { extractable: true });
const pub = { ...await exportJWK(sig.publicKey), kid: 'test', alg: 'ES256' };
process.env.SINGPASS_ENC_PRIVATE_JWK = JSON.stringify(await exportJWK(enc.privateKey));
process.env.SINGPASS_SIG_PRIVATE_JWK = JSON.stringify({ ...await exportJWK(sig.privateKey), kid: 'test' });
let source = await readFile(new URL('../src/lib/singpass/crypto.ts', import.meta.url), 'utf8');
source = source.replace('import "server-only";', '').replace('import { singpassSigPrivateJwk, singpassEncPrivateJwk } from "./config";', 'const singpassSigPrivateJwk = () => JSON.parse(process.env.SINGPASS_SIG_PRIVATE_JWK!); const singpassEncPrivateJwk = () => JSON.parse(process.env.SINGPASS_ENC_PRIVATE_JWK!);');
await writeFile(runtime, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
const server=createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({keys:[pub]}));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try {
 const api=await import(pathToFileURL(runtime.pathname.replace(/^\/(\w:)/,'$1')).href).catch(()=>import(runtime.href));
 const opts={jwksUri:`http://127.0.0.1:${server.address().port}/jwks`,expectedIssuer:'https://issuer.test',expectedAudience:'test-client',expectedNonce:'nonce-test'};
 async function token(overrides={}) {
  const now=Math.floor(Date.now()/1000);
  const jwt=await new SignJWT({iss:opts.expectedIssuer,aud:opts.expectedAudience,sub:'test-sub',iat:now,exp:now+60,nonce:'nonce-test',...overrides}).setProtectedHeader({alg:'ES256',kid:'test'}).sign(sig.privateKey);
  return new CompactEncrypt(new TextEncoder().encode(jwt)).setProtectedHeader({alg:'ECDH-ES+A256KW',enc:'A256GCM'}).encrypt(enc.publicKey);
 }
 assert.equal((await api.decryptAndVerify(await token(),opts)).sub,'test-sub');
 for(const bad of [{nonce:'wrong'},{iss:'wrong'},{aud:'wrong'},{exp:1},{exp:undefined},{sub:''}]) await assert.rejects(()=>token(bad).then(t=>api.decryptAndVerify(t,opts)));
 const assertion=decodeJwt(await api.buildClientAssertion(opts.expectedIssuer,'test-client'));assert.equal(assertion.aud,opts.expectedIssuer);assert.equal(assertion.exp-assertion.iat,120);
 const pair=await api.generateDpopKeypair();const one=decodeJwt(await api.buildDpopProof(pair,'GET','https://issuer.test/userinfo',{ath:'hash'}));const two=decodeJwt(await api.buildDpopProof(pair,'GET','https://issuer.test/userinfo',{ath:'hash'}));assert.notEqual(one.jti,two.jti);assert.equal(one.ath,'hash');
 console.log('PASS: valid encrypted token; rejects wrong nonce/issuer/audience, expired/missing expiry and empty subject; assertion audience/lifetime; fresh DPoP proofs.');
} finally {server.close();await unlink(runtime);}
