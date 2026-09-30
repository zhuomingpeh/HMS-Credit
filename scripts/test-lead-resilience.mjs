import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const transpile = source => ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const load = source => import('data:text/javascript;base64,'+Buffer.from(transpile(source)).toString('base64'));
const loans = await load(await readFile('src/lib/loans.ts','utf8'));
let source=await readFile('src/lib/actions/lead.ts','utf8');
source=source.replace(/^import .*;\r?\n/gm,'');
source=`const LOAN_TYPES=${JSON.stringify(loans.LOAN_TYPES)};
let saved=0,sent=0,dbFailure=false,limitFailure=false,mailFailure=false;
const prisma={lead:{create:async ({data})=>{if(dbFailure)throw new Error('secret connection');saved++;return data;}}};
const allowRequest=async()=>{if(limitFailure)throw new Error('secret counter');return true;};
const sendNewLeadAdminEmail=async()=>{sent++;if(mailFailure)throw new Error('private email details');};
export function mode(values={}){saved=0;sent=0;dbFailure=!!values.db;limitFailure=!!values.limit;mailFailure=!!values.mail;}
export function counts(){return {saved,sent};}
`+source;
const api=await load(source);
const form=()=>{const f=new FormData();for(const [k,v]of Object.entries({name:'AUDIT TEST',phone:'91234567',email:'audit@example.test',residency:'SG_PR',loanAmount:'1000',loanType:'Personal Loan'}))f.set(k,v);return f;};
api.mode();assert.deepEqual(await api.submitLead({ok:false},form()),{ok:true});assert.deepEqual(api.counts(),{saved:1,sent:1});
api.mode();const invalid=form();invalid.set('loanType','unrecognised product');assert.equal((await api.submitLead({ok:false},invalid)).ok,false);assert.deepEqual(api.counts(),{saved:0,sent:0});
for(const failure of ['db','limit']){api.mode({[failure]:true});const result=await api.submitLead({ok:false},form());assert.equal(result.ok,false);assert.ok(!JSON.stringify(result).includes('secret'));assert.deepEqual(api.counts(),{saved:0,sent:0});}
api.mode({mail:true});assert.equal((await api.submitLead({ok:false},form())).ok,true);assert.deepEqual(api.counts(),{saved:1,sent:1});
console.log('PASS: manual form validates loan type, handles storage/rate-limit failure, sends after saving only, and preserves success if email fails. No live emails or leads created.');
