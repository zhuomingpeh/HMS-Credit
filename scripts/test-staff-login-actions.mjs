import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const nativeRequire = createRequire(import.meta.url);
const source = ts.transpileModule(readFileSync('src/app/staff/login/actions.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let row, session, sent, rejected, rateCalls, auditFails;
let jar, audits;
const prisma = {
 staffLogin: {
  findUnique: async () => row,
  create: async ({data}) => { row=data; return row; },
  updateMany: async ({where,data}) => {
   if (!row || (where.codeHash && where.codeHash !== row.codeHash) || (where.sentAt && row.sentAt >= where.sentAt.lt) || (where.attempts && row.attempts >= where.attempts.lt)) return {count:0};
   row={...row,...data,attempts:data.attempts?.increment ? row.attempts+1 : data.attempts}; return {count:1};
  },
  deleteMany: async ({where}) => { if(row?.codeHash !== where.codeHash) return {count:0}; row=null; return {count:1}; },
 },
 staffSession: {create:async ({data})=>{session=data;}},
 staffAudit: {create:async ({data})=>{if(auditFails) throw Error('audit outage');audits.push(data.action);}},
};
const modules = {
 'next/headers':{cookies:async()=>({get:key=>jar.has(key)?{value:jar.get(key)}:undefined,set:(key,value)=>jar.set(key,value)})},
 'next/navigation':{redirect:url=>{throw Object.assign(Error('redirect'),{url});}},
 '@/lib/prisma':{prisma},
 '@/lib/staff':{allowedStaff:email=>email==='staff@example.test',otpHash:(email,code)=>`${email}:${code}`,STAFF_COOKIE:'session',staffHash:x=>x,staffSession:async()=>session},
 '@/lib/rateLimit':{allowRequest:async()=>{rateCalls++;return true;}},
 resend:{Resend:class {emails={send:async()=>{sent++;return {error:rejected?{message:'failure'}:null};}};}},
};
const context={exports:{},require:key=>modules[key]??nativeRequire(key),process:{env:{RESEND_API_KEY:'fake',EMAIL_FROM:'sender@example.test'}},console:{error(){}},Buffer,Date};
vm.runInNewContext(source,context);
function reset(){row=null;session=null;sent=0;rejected=false;rateCalls=0;auditFails=false;jar=new Map();audits=[];}
function form(code){const data=new FormData();data.set('email','staff@example.test');if(code)data.set('code',code);return data;}
async function call(action,data){try{await context.exports[action](data);assert.fail('Expected redirect');}catch(e){if(!e.url)throw e;return e.url;}}
reset(); await call('requestStaffCode',form()); assert.equal(sent,1);const firstHash=row.codeHash;
await call('requestStaffCode',form());assert.equal(sent,1);assert.equal(row.codeHash,firstHash);assert.equal(rateCalls,1,'Cooldown does not burn rate-limit attempts');
jar.clear();await call('requestStaffCode',form());assert.equal(sent,1,'Database cooldown holds across browsers');assert.equal(row.codeHash,firstHash);
reset();rejected=true;await call('requestStaffCode',form());assert.equal(row,null);assert(audits.includes('CODE_EMAIL_FAILED'));
reset();auditFails=true;await call('requestStaffCode',form());assert(row,'Audit failure must not invalidate a delivered code');
reset();row={email:'staff@example.test',codeHash:'staff@example.test:12345678',attempts:0,expiresAt:new Date(Date.now()+600000)};
assert.equal(await call('verifyStaffCode',form('87654321')),'/staff/login?error=1');
assert.equal(await call('verifyStaffCode',form('12345678')),'/staff');assert.equal(row,null);assert(jar.has('session'));
assert.equal(await call('verifyStaffCode',form('12345678')),'/staff','Repeated submission keeps authenticated staff signed in');
session=null;assert.equal(await call('verifyStaffCode',form('12345678')),'/staff/login?error=1','Consumed code cannot create another session');
console.log('PASS: cooldown, concurrent-browser resend, delivery failure, audit outage, invalid OTP, successful OTP, repeat submission and single-use enforcement.');
