import assert from 'node:assert/strict';
const base=process.env.TEST_URL??'http://localhost:3035';
const mappings={'/hms-credit-personal-loan':'/loans/personal-loan','/hms-credit-wedding-loan':'/loans/wedding-loan','/hms-credit-repayment-calculator':'/loan-calculator','/aboutus':'/about','/contactus':'/contact','/hms-credit-faq-singapore':'/faq','/get-in-touch-hms-credit-money-lender-singapore-vcf-download':'/contact'};
for(const [old,destination] of Object.entries(mappings)){
 const r=await fetch(base+old+'?utm_source=audit',{redirect:'manual'});assert.equal(r.status,308);
 const target=new URL(r.headers.get('location'),base);assert.equal(target.pathname,destination);assert.equal(target.search,'?utm_source=audit');
}
for(const url of ['/staff','/api/cron/cleanup','https://127.0.0.1/private','/photos/storefront-visit.jpg?unapproved=1']) {
 const r=await fetch(base+'/_next/image?url='+encodeURIComponent(url)+'&w=640&q=75');assert.equal(r.status,400,url);
}
const image=await fetch(base+'/_next/image?url=%2Fphotos%2Fstorefront-visit.jpg&w=640&q=75');assert.equal(image.status,200);assert.ok(image.headers.get('content-type').startsWith('image/'));
console.log('PASS: seven legacy permanent redirects with query preservation; private/remote image sources rejected; approved image loads.');
