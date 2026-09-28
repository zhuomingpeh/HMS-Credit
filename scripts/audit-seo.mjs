import assert from 'node:assert/strict';
const base=process.env.TEST_URL || 'http://localhost:3022';
const sitemap=await (await fetch(base+'/sitemap.xml')).text();
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,13);
const findings=[];
for(const canonical of urls){
 const path=new URL(canonical).pathname;
 const res=await fetch(base+path);const html=await res.text();
 assert.equal(res.status,200,path);
 assert.ok(html.includes(`rel="canonical" href="${canonical}"`),`Canonical: ${path}`);
 assert.ok(/<title>[^<]+<\/title>/.test(html),`Title: ${path}`);
 assert.ok(/name="description" content="[^"]+"/.test(html),`Description: ${path}`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`One primary heading: ${path}`);
 assert.ok(!/name="robots" content="[^"]*noindex/.test(html),`Indexable: ${path}`);
 const blocks=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
 assert.ok(blocks.length>0);for(const [,data] of blocks)JSON.parse(data);
 findings.push({path,status:res.status,canonical:true,description:true,jsonLd:true});
}
const robots=await (await fetch(base+'/robots.txt')).text();
assert.ok(robots.includes('Disallow: /staff'));
assert.ok(robots.includes('Disallow: /api/'));
assert.ok(robots.includes('Allow: /'));
assert.equal((await fetch(base+'/loans/not-a-real-product')).status,404);
assert.equal((await fetch(base+'/llms.txt')).status,200);
console.log(JSON.stringify(findings));
console.log('PASS: 13 public sitemap URLs; unique route canonicals; titles/descriptions/H1; parseable structured data; private crawler exclusions; true 404; public AI reference file.');
