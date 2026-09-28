import 'dotenv/config';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import pg from 'pg';
import { databaseConfig } from './database-config.mjs';
import { randomBytes } from 'node:crypto';
const base=process.env.TEST_URL || 'http://localhost:3021';
const source=await readFile('src/lib/calculator.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {calculateRepayment}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
assert.equal(calculateRepayment(1200,12,0).installment,100);
assert.ok(Math.abs(calculateRepayment(1000,1,4).installment-1040)<1e-8);
const r=calculateRepayment(3000,12,4);
assert.ok(Math.abs(r.installment-319.656518)<0.001);
assert.equal(r.schedule.at(-1).balance,0);
assert.ok(r.schedule[0].interest>r.schedule[1].interest);
assert.ok(Math.abs(r.schedule.reduce((n,x)=>n+x.principal,0)-3000)<1e-8);
assert.throws(()=>calculateRepayment(NaN,12,4));
const home=await fetch(base);const html=await home.text();
assert.equal(home.status,200);
const csp=home.headers.get('content-security-policy');
assert.ok(csp.includes("'strict-dynamic'"));
assert.ok(!csp.split('script-src')[1].split(';')[0].includes('unsafe-inline'));
const nonce=csp.match(/'nonce-([^']+)'/)[1];
const scripts=[...html.matchAll(/<script\b([^>]*)>/g)];
assert.ok(scripts.length>1);
for(const [,attrs] of scripts) assert.ok(attrs.includes(`nonce="${nonce}"`),'Every rendered script must carry the request nonce');
const second=await fetch(base);assert.notEqual(second.headers.get('content-security-policy'),csp);
for(const path of ['/staff','/staff/lead/not-real','/apply/review','/api/cron/cleanup']) {
 const res=await fetch(base+path,{redirect:'manual'});const text=await res.text();
 assert.ok(res.headers.get('cache-control').includes('no-store'));
 assert.ok(res.headers.get('x-robots-tag').includes('noindex'));
 assert.ok(!text.includes('rawMyInfo'));
 if(path.includes('cleanup')) assert.equal(res.status,401);
 else assert.ok(res.status===307 || text.includes('NEXT_REDIRECT'));
}
// Counter SQL is tested with simultaneous connections, never with real staff identities.
const db=new pg.Pool({...databaseConfig,max:12});
const key='security-test-'+randomBytes(16).toString('hex');
const sql=`INSERT INTO "RateLimit" (key,count,"expiresAt") VALUES ($1,1,NOW()+INTERVAL '15 minutes') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN "RateLimit"."expiresAt"<=NOW() THEN 1 ELSE LEAST("RateLimit".count+1,6) END,"expiresAt"=CASE WHEN "RateLimit"."expiresAt"<=NOW() THEN NOW()+INTERVAL '15 minutes' ELSE "RateLimit"."expiresAt" END RETURNING count`;
try {
 const counts=await Promise.all(Array.from({length:12},()=>db.query(sql,[key]).then(r=>r.rows[0].count)));
 assert.equal(counts.filter(x=>x<=5).length,5,'Concurrency must not bypass the allowance');
 await db.query('UPDATE "RateLimit" SET "expiresAt"=NOW()-INTERVAL \'1 second\' WHERE key=$1',[key]);
 assert.equal((await db.query(sql,[key])).rows[0].count,1);
}finally {await db.query('DELETE FROM "RateLimit" WHERE key=$1',[key]);await db.end();}
console.log('PASS: amortisation reference values and balances; per-response script nonces; private no-store/noindex; unauthenticated routes; atomic rate-limit concurrency and expiry.');
