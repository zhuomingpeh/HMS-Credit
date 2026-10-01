// Registration preflight only: creates an expiring PAR request, never retrieves personal data.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { createPrivateKey, createPublicKey } from 'node:crypto';
import ts from 'typescript';

const clientId = '7KqsxQvu9AqQbV6FFvVL43Ji5C4ZbmGt';
const redirectUri = 'https://hmsmoney.com/api/auth/singpass/callback';
const runtime = new URL('./.production-preflight-runtime.mjs', import.meta.url);
const jwksResponse = await fetch('https://hmsmoney.com/.well-known/jwks.json', { redirect: 'error' });
assert.equal(jwksResponse.status, 200);
const jwks = await jwksResponse.json();
for (const [variable, use] of [['SINGPASS_SIG_PRIVATE_JWK', 'sig'], ['SINGPASS_ENC_PRIVATE_JWK', 'enc']]) {
  const privateJwk = JSON.parse(process.env[variable]);
  const derived = createPublicKey(createPrivateKey({ key: privateJwk, format: 'jwk' })).export({ format: 'jwk' });
  const published = jwks.keys.find(key => key.kid === privateJwk.kid && key.use === use);
  assert.ok(published, `Published ${use} key missing`);
  for (const key of ['kty', 'crv', 'x', 'y']) assert.equal(derived[key], published[key], `${use} key mismatch`);
  assert.ok(!('d' in published));
}
let source = await readFile(new URL('../src/lib/singpass/crypto.ts', import.meta.url), 'utf8');
source = source.replace('import "server-only";', '').replace('import { singpassSigPrivateJwk, singpassEncPrivateJwk } from "./config";', 'const singpassSigPrivateJwk = () => JSON.parse(process.env.SINGPASS_SIG_PRIVATE_JWK!); const singpassEncPrivateJwk = () => JSON.parse(process.env.SINGPASS_ENC_PRIVATE_JWK!);');
await writeFile(runtime, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
try {
  const api = await import(runtime.href);
  const scopeSource = await readFile(new URL('../src/lib/singpass/reviewFields.ts', import.meta.url), 'utf8');
  const scopeJs = ts.transpileModule(scopeSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  const { MYINFO_SCOPES } = await import('data:text/javascript;base64,' + Buffer.from(scopeJs).toString('base64'));
  assert.equal(MYINFO_SCOPES.length, 28);
  assert.ok(MYINFO_SCOPES.includes('hdbtype') && !MYINFO_SCOPES.includes('housingtype'));
  const discovery = await (await fetch('https://id.singpass.gov.sg/fapi/.well-known/openid-configuration', { redirect: 'error' })).json();
  assert.equal(discovery.issuer, 'https://id.singpass.gov.sg/fapi');
  assert.equal(new URL(discovery.pushed_authorization_request_endpoint).origin, 'https://id.singpass.gov.sg');
  const dpop = await api.generateDpopKeypair();
  const pkce = api.generatePkce();
  const response = await fetch(discovery.pushed_authorization_request_endpoint, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', DPoP: await api.buildDpopProof(dpop, 'POST', discovery.pushed_authorization_request_endpoint) },
    body: new URLSearchParams({ response_type: 'code', client_id: clientId, redirect_uri: redirectUri,
      scope: ['openid', ...MYINFO_SCOPES].join(' '), state: api.generateStateOrNonce(), nonce: api.generateStateOrNonce(),
      code_challenge: pkce.codeChallenge, code_challenge_method: 'S256',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: await api.buildClientAssertion(discovery.issuer, clientId) }),
  });
  const body = await response.json();
  if (response.status !== 201) {
    const allowed = ['invalid_client', 'invalid_scope', 'invalid_request', 'unauthorized_client', 'invalid_dpop_proof'];
    throw new Error(`Production registration rejected: HTTP ${response.status}; ${allowed.includes(body.error) ? body.error : 'unclassified'}`);
  }
  assert.equal(typeof body.request_uri, 'string');
  console.log(JSON.stringify({ clientId, productionParAccepted: true, status: response.status, scopeCount: 29,
    signingAndEncryptionKeysMatch: true, redirectUri, personalDataRetrieved: false, expiresIn: body.expires_in }, null, 2));
} finally { await unlink(runtime); }
