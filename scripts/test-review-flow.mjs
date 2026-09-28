// Local-only integration test against the built application and the known staging persona.
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';
import ts from 'typescript';
const base = 'http://localhost:3015';
async function load(path) {
 const source = await readFile(new URL(path, import.meta.url), 'utf8');
 return import('data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64'));
}
const { encryptDraft, draftHash } = await load('../src/lib/singpass/draftCrypto.ts');
const { reviewFields } = await load('../src/lib/singpass/reviewFields.ts');
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
let tokenHash;
try {
 await db.connect();
 const { rows } = await db.query('SELECT "rawMyInfo", "singpassSub" FROM "Applicant" WHERE nric=$1', ['S7790709B']);
 assert.equal(rows.length, 1, 'Known staging fixture must exist');
 const token = randomBytes(32).toString('base64url'); tokenHash = draftHash(token);
 await db.query('INSERT INTO "MyinfoDraft" ("tokenHash", encrypted, "expiresAt") VALUES ($1,$2,$3)', [tokenHash, encryptDraft({ personInfo: rows[0].rawMyInfo, singpassSub: rows[0].singpassSub }), new Date(Date.now() + 900000).toISOString()]);
 const cookie = `hms_myinfo_review=${token}`;
 const html = await (await fetch(base + '/apply/review', { headers: { cookie } })).text();
 assert.ok(html.includes('Review your application'));
 assert.ok(html.includes('PEARL GARDEN') && html.includes('SPADE BUILDING'), 'All HDB records shown');
 assert.ok(html.includes('Income') || html.includes('income'));
 const action = html.match(/name="(\$ACTION_ID_[^"]+)"/);
 assert.ok(action, 'Server action must be rendered');
 const form = new FormData(); form.set(action[1], ''); form.set('loanAmount', '1000'); form.set('consent', 'yes');
 for (const field of reviewFields(rows[0].rawMyInfo).filter(f => f.editable)) form.set(`myinfo:${field.path}`, field.value);
 form.set('myinfo:name.value', 'TAMPERED');
 const response = await fetch(base + '/apply/review', { method: 'POST', headers: { cookie, origin: base }, body: form, redirect: 'manual' });
 assert.equal(response.status, 303);
 assert.ok(response.headers.get('location').endsWith('/apply/success'));
 assert.equal((await db.query('SELECT count(*)::int AS count FROM "MyinfoDraft" WHERE "tokenHash"=$1', [tokenHash])).rows[0].count, 0);
 const applicant = (await db.query('SELECT name, "hdbOwnership" FROM "Applicant" WHERE "singpassSub"=$1', [rows[0].singpassSub])).rows[0];
 assert.notEqual(applicant.name, 'TAMPERED'); assert.equal(applicant.hdbOwnership.length, 2);
 const replay = await fetch(base + '/apply/review', { method: 'POST', headers: { cookie, origin: base }, body: form, redirect: 'manual' });
 assert.ok(replay.headers.get('location').includes('singpassError'));
 const noCookie = await fetch(base + '/apply/review', { redirect: 'manual' }); assert.equal(noCookie.status, 307);
 // Recreate only the known fixture draft to exercise the cancel action.
 await db.query('INSERT INTO "MyinfoDraft" ("tokenHash", encrypted, "expiresAt") VALUES ($1,$2,$3)', [tokenHash, encryptDraft({ personInfo: rows[0].rawMyInfo, singpassSub: rows[0].singpassSub }), new Date(Date.now() + 900000).toISOString()]);
 const cancelHtml = await (await fetch(base + '/apply/review', { headers: { cookie } })).text();
 const actions = [...cancelHtml.matchAll(/name="(\$ACTION_ID_[^"]+)"/g)];
 assert.equal(actions.length, 2);
 const cancelForm = new FormData(); cancelForm.set(actions[1][1], '');
 const cancelled = await fetch(base + '/apply/review', { method: 'POST', headers: { cookie, origin: base }, body: cancelForm, redirect: 'manual' });
 assert.equal(cancelled.status, 303);
 assert.ok(cancelled.headers.get('location').endsWith('/apply'));
 assert.equal((await db.query('SELECT count(*)::int AS count FROM "MyinfoDraft" WHERE "tokenHash"=$1', [tokenHash])).rows[0].count, 0);
 console.log('PASS: cancellation deletes the draft and returns to manual application.');
 const cron = await fetch(base + '/api/cron/cleanup'); assert.equal(cron.status, 401);
 console.log('PASS: protected review, full property display, explicit submission, protected-field tampering ignored, draft consumed once, replay rejected, cleanup requires authorization.');
} finally {
 if (tokenHash) await db.query('DELETE FROM "MyinfoDraft" WHERE "tokenHash"=$1', [tokenHash]);
 await db.end();
}
