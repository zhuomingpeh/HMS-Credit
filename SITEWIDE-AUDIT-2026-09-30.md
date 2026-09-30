# HMS Credit sitewide audit - 30 September 2026

## Scope and outcome

Public website, loan catalogue and all five loan detail pages, contact/about/FAQ/calculator/legal pages, application UI, staff authentication, Singpass security controls, dependency inventory, database access posture and Google Search Console. This is an implementation audit with automated and visual checks, not an independent penetration test or production Singpass approval.

## Improvements implemented

| Area | Finding | Resolution |
| --- | --- | --- |
| Loan catalogue | Five visually identical cards; no clear planning path | Original lightweight SVG icons, five restrained colour treatments, descriptive links and a sixth repayment-calculator card. Shared with homepage and related loans. |
| Mobile navigation | Links wrapped into a crowded header | Compact menu with expanded-state announcement, active-page styling and Escape-to-close. |
| Public pages | Sparse About/Contact; inconsistent page structure | Clear headings, contact tiles, company facts, real storefront photos, directions link and a consistent office panel. |
| Accessibility | Low-contrast green actions; missing skip target and residency group semantics | Darker green controls, skip link/main landmarks, visible keyboard focus, fieldset/legend, announced form status/errors, reduced-motion rules and larger mobile inputs. |
| Search migration | Search Console still indexes old Squarespace paths | Seven permanent redirects to equivalent new pages. Public www URLs consolidate to the apex; staff/application/API flows preserve their existing host. |
| SEO | Missing breadcrumbs and service context | Visible breadcrumbs with matching JSON-LD, catalogue ItemList, individual Service data, concise page metadata and stronger internal links. |
| Content clarity | FAQ implied calculator establishes borrowing eligibility | Clarified that it estimates repayment only. Existing user-requested rate-cap paragraph remains removed. |
| AI discoverability | Public reference file omitted individual product URLs | Updated llms.txt with established year and five loan links; all material details are also visible in HTML. No special AI-ranking or citation guarantee is implied. |
| Security | Arbitrary authentication/provider error text could enter logs | Retained only explicitly approved diagnostic codes; unexpected errors are generic. Mail failures no longer log provider error text. |
| Manual enquiries | Storage/rate-limit failures could surface an unhelpful error page | Friendly failure response without exposing internals; unsupported loan types rejected. Saved applications remain successful if notifications fail. |
| Image endpoint | Local optimization was not limited to intended image paths | Allowlisted public images only, query strings rejected, redirect-following disabled. |

## Verification completed

- Production build and ESLint passed.
- All 13 public sitemap URLs: HTTP 200, unique canonical URL, title/description, one H1/main landmark, parseable structured data. Breadcrumbs checked on every non-home public page; Service data checked on all loan detail pages.
- Mobile visual checks at 390px for loans, home, business loan, contact, FAQ, calculator and staff login. Desktop catalogue visually inspected. Menu expanded/collapsed and Escape key tested; FAQ opened correctly.
- Reducing-balance reference calculations and principal balances passed.
- Myinfo: 28 fields, CPF/NOA, multiple HDB records, zero balances, editable MSF marital status and protected identity-field tampering tests passed.
- Singpass: encryption profile, issuer/audience/nonce, expiry/issued-at constraints, DPoP and client assertions passed local tests.
- Full local review submission test: explicit consent, save, protected fields, cancellation, one-use drafts and replay rejection passed. Existing staging persona fixture was used; no live Singpass authentication or email delivery was performed in this audit.
- Staff test used an isolated audit email on the local server: wrong OTP rejected, correct OTP accepted, code reuse rejected, expired session rejected. No email was sent and no real staff login was overwritten.
- CSP: fresh nonce per response, no unsafe-inline script allowance; private pages no-store/noindex; unauthenticated staff/review routes blocked; cron rejects unauthenticated access; cross-origin Server Action rejected.
- Image optimization tests reject private/API paths, arbitrary remote URLs and unexpected query strings; storefront optimization succeeds.
- Logging regression tests demonstrate that identifiers, tokens and arbitrary error text are not returned by the log sanitizer.
- Manual-form tests simulate storage, rate-limit and email failure without creating real leads or sending mail.
- Full and production-only npm audits: zero known dependency advisories at audit time.
- Live database metadata check: all eight public tables have RLS enabled, anon/authenticated roles have no SELECT privilege; hms_app has no superuser, bypass-RLS or role-creation privilege. Operator audit connection uses TLS 1.3 with certificate validation. No borrower records were included in audit output.
- Public DNS verified through 1.1.1.1 and 8.8.8.8 before canonical consolidation.
- Google Search Console domain ownership verified earlier today; current sitemap reports Success and 13 discovered URLs. Discovery does not mean every URL is indexed.

## Migration follow-up

Search Console's report was last updated 21 September 2026 and describes the old site. It showed 30 indexed URLs and 13 excluded URLs. Those are not measurements of this new deployment.

The following clear equivalents now redirect: /hms-credit-personal-loan, /hms-credit-wedding-loan, /hms-credit-repayment-calculator, /aboutus, /contactus, /hms-credit-faq-singapore and /get-in-touch-hms-credit-money-lender-singapore-vcf-download.

Old content under /moneylending-made-easy-sg (articles, categories and tags) has not been recovered or republished. /loan-qualification-calculator-hms-credit, /hms-credit-taxi-phv-driver-loan and /new-page-1 also have no confirmed equivalent. Recover the source content from Squarespace, then restore valuable pages or make a deliberate retirement decision. Do not send all removed URLs to the homepage or call a repayment calculator a qualification calculator.

## Remaining launch and operational work

1. Singpass production approval and final portal/journey reconciliation remain necessary. Production authentication stays gated. Complete a fresh staging authentication and updated consent screenshot before resubmission; code-level tests do not replace this.
2. Establish a documented database backup schedule and perform a restore test. Previous project review found the free tier; this audit did not purchase a plan or verify a successful restore.
3. Rotate owner/account credentials previously shared in conversation and confirm the incident/retention owner. Existing deployment secrets were not printed or changed here.
4. Staff access remains email-code based, as requested. Stronger MFA is deferred by the owner.
5. Application notification delivery still lacks a durable retry/outbox. The enquiry is saved before notification and remains visible in the staff portal if email fails.
6. Submitted-record retention remains a business/legal policy decision; only expired transient authentication/review data is cleaned automatically.
7. Google Business Profile/Bing ownership and generative-AI Search Console controls were not changed. No analytics or tracking scripts were added without a defined consent/measurement plan.
8. No real-user Core Web Vitals or independent penetration-test results were available; this audit does not claim a Lighthouse score, guaranteed rankings, or complete security certification.

## References

- Google: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Ministry of Law borrower guidance: https://rom.mlaw.gov.sg/information-for-borrowers/guide-to-borrowing-from-licensed-moneylenders-english/
- Singpass family data/editability: https://docs.developer.singpass.gov.sg/docs/data-catalog-myinfo/catalog/family
- Local Next.js 16.3.5 documentation: CSS, metadata, data security and Image localPatterns.

Google's guidance prioritises useful content, crawlability, clear site structure and accurate business information. llms.txt is supplementary for systems that use it; Google states that it does not use it for Search ranking. Schema here describes visible content and does not promise special AI placement.
