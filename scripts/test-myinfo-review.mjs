import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';
async function module(path) {
  const src = await readFile(new URL(path, import.meta.url), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}
const crypto = await module('../src/lib/singpass/draftCrypto.ts');
const { reviewFields, applyUserEdits, reviewSections, MYINFO_SCOPES } = await module('../src/lib/singpass/reviewFields.ts');
process.env.MYINFO_DRAFT_KEY = randomBytes(32).toString('hex');
const data = { name: { value: 'TEST PERSON', source: '1' }, email: { value: 'old@example.test', source: '2' },
  cpfcontributions: { source: '1', history: [{ date: { value: '2025-12-01' } }, { date: { value: '2025-01-01' } }] },
  noahistory: { source: '1', noas: [{ category: { value: 'ORIGINAL' }, taxclearance: { value: 'Y' } }] } };
const encrypted = crypto.encryptDraft(data);
assert.deepEqual(crypto.decryptDraft(encrypted), data);
assert.notEqual(encrypted, crypto.encryptDraft(data));
const bytes = Buffer.from(encrypted, 'base64url'); bytes[30] ^= 1;
assert.throws(() => crypto.decryptDraft(bytes.toString('base64url')));
const form = new FormData(); form.set('myinfo:name.value', 'TAMPERED'); form.set('myinfo:email.value', 'new@example.test');
const edited = applyUserEdits(data, form);
assert.equal(edited.name.value, 'TEST PERSON'); assert.equal(edited.email.value, 'new@example.test');
assert.equal(data.email.value, 'old@example.test');
const fields = reviewFields(data);
assert.equal(fields.find(f => f.path.startsWith('cpfcontributions')).path, 'cpfcontributions.history.1.date.value');
assert.ok(fields.find(f => f.path.endsWith('category.value')).label.includes('Clearance'));
assert.equal(fields.filter(f => f.editable).length, 1);
assert.equal(reviewFields({ name: { value: 'TEST', source: '2' } })[0].editable, false);
const boolForm = new FormData(); boolForm.set('myinfo:flag.value', 'false');
assert.equal(applyUserEdits({ flag: { value: true, source: '2' } }, boolForm).flag.value, false);
console.log('PASS: authenticated draft encryption/tamper rejection; protected fields cannot be edited; CPF ordering preserves original paths; NOA clearance displayed.');

assert.equal(MYINFO_SCOPES.length, 28);
assert.equal(reviewSections({}).flatMap(s => s.fields).length, 28);
const missingProperty = reviewSections({ hdbownership: [{ address: { value: "TEST" } }] }).find(s => s.key === "hdbownership");
assert.ok(missingProperty.fields.some(f => f.path === "hdbownership.monthlyloaninstalment" && !f.editable));
assert.equal(reviewSections({ email: { value: "a@example.test", source: "2" } }).find(s => s.key === "email").fields[0].editable, true);
console.log("PASS: all 28 requested scopes remain visible with absent data, including partial property records.");
const maritalInfo = { name: { value: 'TEST PERSON', source: '1' }, marital: { code: '1', desc: 'SINGLE', source: '1' } };
assert.equal(reviewSections(maritalInfo).find(s=>s.key==='marital').fields[0].editable,true);
const changedMarital = new FormData(); changedMarital.set('myinfo:marital.desc','MARRIED'); changedMarital.set('myinfo:name.value','TAMPERED');
const corrected = applyUserEdits(maritalInfo,changedMarital);
assert.deepEqual(corrected.marital,{value:'MARRIED',desc:'MARRIED',source:'2'});
assert.equal(corrected.name.value,'TEST PERSON');assert.equal(maritalInfo.marital.desc,'SINGLE');
changedMarital.set('myinfo:marital.desc','SINGLE');assert.deepEqual(applyUserEdits(maritalInfo,changedMarital),maritalInfo);
changedMarital.set('myinfo:marital.desc','INVALID');assert.throws(()=>applyUserEdits(maritalInfo,changedMarital));
changedMarital.set('myinfo:marital.desc','');assert.throws(()=>applyUserEdits(maritalInfo,changedMarital));
assert.equal(reviewSections({}).find(s=>s.key==='marital').fields[0].editable,true);
changedMarital.set('myinfo:marital.desc','DIVORCED');assert.equal(applyUserEdits({},changedMarital).marital.desc,'DIVORCED');
console.log('PASS: MSF marital status editable, unchanged payload preserved, valid correction saved, stale code removed, invalid values rejected, identity protected.');
