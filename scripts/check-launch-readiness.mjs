import assert from 'node:assert/strict';
const base=process.env.TEST_URL??'https://hmsmoney.com';
const production=process.env.EXPECT_SINGPASS_PRODUCTION==='true';
const results=[];
for(const [path,status] of [['/',200],['/privacy',200],['/apply',200],['/staff',307],['/apply/review',307],['/api/cron/cleanup',401],['/.env',404]]) {
 const r=await fetch(base+path,{redirect:'manual'});assert.equal(r.status,status,path);
 if(path==='/staff'||path==='/apply/review') {assert.match(r.headers.get('cache-control')??'',/no-store/);assert.match(r.headers.get('x-robots-tag')??'',/noindex/);}
 results.push({path,status:r.status});
}
const jwks=await (await fetch(base+'/.well-known/jwks.json')).json();assert.ok(jwks.keys.length>=2);assert.ok(jwks.keys.every(k=>!['d','p','q','dp','dq','qi','k'].some(x=>x in k)));
const apply=await(await fetch(base+'/apply')).text();
if (production) {
 assert.ok(!apply.includes('Singpass applications will be available after production approval'));
 assert.ok(!apply.includes('Testing environment'));
 assert.ok(apply.includes('/api/auth/singpass/start'));
 const start=await fetch(base+'/api/auth/singpass/start',{redirect:'manual'});
 assert.equal(start.status,307);
 const location=new URL(start.headers.get('location'));
 assert.equal(location.origin,'https://id.singpass.gov.sg');
 assert.equal(location.searchParams.get('client_id'),'7KqsxQvu9AqQbV6FFvVL43Ji5C4ZbmGt');
 assert.ok(location.searchParams.has('request_uri'));
 assert.match(start.headers.get('set-cookie')??'',/HttpOnly/i);
} else assert.ok(apply.includes('Singpass applications will be available after production approval'));
for(const host of ['stg-id.singpass.gov.sg','id.singpass.gov.sg']) {
 const d=await(await fetch(`https://${host}/fapi/.well-known/openid-configuration`)).json();assert.ok(d.id_token_encryption_enc_values_supported.includes('A256CBC-HS512'));assert.ok(d.userinfo_encryption_enc_values_supported.includes('A256GCM'));
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),base,results,publicJwks:true,productionAuthenticationStart:production,productionGate:!production,providerEncryptionProfiles:true},null,2));
