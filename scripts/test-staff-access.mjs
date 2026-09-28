import 'dotenv/config';
import assert from 'node:assert/strict';
import { createHmac, createHash, randomInt } from 'node:crypto';
import pg from 'pg';
const base = process.env.STAFF_TEST_URL ?? 'http://localhost:3016';
const email = process.env.STAFF_EMAILS?.split(',')[0]?.trim();
assert.ok(email && process.env.STAFF_AUTH_SECRET);
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
let sessionHash;
try {
 await db.connect();
 const unauth = await fetch(base + '/staff', { redirect: 'manual' }); assert.equal(unauth.status, 307);
 assert.ok(unauth.headers.get('location').includes('/staff/login'));
 const initial = await (await fetch(base + '/staff/login')).text();
 assert.equal((initial.match(/type="email"/g) ?? []).length, 1);
 const page = await (await fetch(base + '/staff/login', { headers: {cookie: `hms_staff_pending_email=${encodeURIComponent(email)}`} })).text();
 assert.equal((page.match(/type="email"/g) ?? []).length, 0);
 assert.ok(page.includes('Use a different email'));
 const actions = [...page.matchAll(/name="(\$ACTION_ID_[^"]+)"/g)].map(x => x[1]);
 assert.equal(actions.length, 3);
 const code = String(randomInt(10000000,100000000));
 const hash = createHmac('sha256',process.env.STAFF_AUTH_SECRET).update(`${email}:${code}`).digest('hex');
 await db.query('INSERT INTO "StaffLogin" (email,"codeHash","expiresAt",attempts) VALUES ($1,$2,$3,0) ON CONFLICT(email) DO UPDATE SET "codeHash"=$2,"expiresAt"=$3,attempts=0', [email,hash,new Date(Date.now()+600000).toISOString()]);
 async function verify(value) { const form = new FormData(); form.set(actions[0],'');form.set('email',email);form.set('code',value); return fetch(base+'/staff/login',{method:'POST',headers:{origin:base},body:form,redirect:'manual'}); }
 const wrong = await verify('00000000'); assert.ok(wrong.headers.get('location').includes('error=1'));
 const valid = await verify(code); assert.equal(valid.status,303); assert.equal(valid.headers.get('location'),'/staff');
 const cookie = valid.headers.get('set-cookie').match(/hms_staff_session=([^;]+)/)[0];
 sessionHash = createHash('sha256').update(cookie.split('=')[1]).digest('hex');
 const list = await fetch(base+'/staff',{headers:{cookie}}); assert.equal(list.status,200); assert.ok((await list.text()).includes('Applications'));
 const reused = await verify(code); assert.ok(reused.headers.get('location').includes('error=1'));
 await db.query('UPDATE "StaffSession" SET "expiresAt"=$1 WHERE "tokenHash"=$2',[new Date(Date.now()-1000).toISOString(),sessionHash]);
 const expired = await fetch(base+'/staff',{headers:{cookie},redirect:'manual'});
 const expiredHtml = await expired.text();
 assert.ok(expired.status === 307 || (expiredHtml.includes('NEXT_REDIRECT') && expiredHtml.includes('/staff/login')));
 assert.ok(!expiredHtml.includes('Showing the 50 most recent records'), 'Expired session must never receive applicant data');
 console.log('PASS: staff pages require authentication; wrong code rejected; correct code creates session; OTP single-use; expired session rejected.');
} finally {
 await db.query('DELETE FROM "StaffLogin" WHERE email=$1',[email]);
 if(sessionHash) await db.query('DELETE FROM "StaffSession" WHERE "tokenHash"=$1',[sessionHash]);
 await db.end();
}
