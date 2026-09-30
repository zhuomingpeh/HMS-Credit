import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile('src/lib/singpass/errors.ts','utf8');
const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {safeSingpassError} = await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
for (const detail of ['nric=S1234567A token=secret','https://example.test?code=private','password=bad','Token request failed (401; invalid_client)\nuserinfo=secret']) {
 assert.equal(safeSingpassError(new Error(detail)),'Authentication operation failed');
}
assert.equal(safeSingpassError(new Error('Token request failed (401; invalid_client)')),'Token request failed (401; invalid_client)');
assert.equal(safeSingpassError(new DOMException('secret-url','TimeoutError')),'Authentication upstream timed out');
console.log('PASS: authentication logs retain approved status codes and redact arbitrary errors, payloads and URLs.');
