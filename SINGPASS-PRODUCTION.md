# HMS Credit production handover

Prepared 28 September 2026. Code preparation is not Singpass production approval.

## Portal registration

Organisation: HMS CREDIT PTE. LTD. (UEN 201703408D, moneylender licence 91/2026).

Use case: **Online loan application and borrower verification**.

Suggested description: Applicants use Singpass Myinfo to provide verified identity,
contact, residency, employment, income and financial information to HMS CREDIT PTE.
LTD. for their own loan application. Applicants review the retrieved information and
explicitly submit it for HMS staff to assess eligibility and repayment ability and
contact them. A manual application option is available. Singpass authentication does
not constitute loan approval. HMS does not provide loan matching through this flow.

Replace the staging portal's current loan-matching purpose with a description of
direct application assessment. Confirm each requested field is necessary with the
business owner and GovTech; requested scopes are not proof of approval.

Production callback: `https://hmsmoney.com/api/auth/singpass/callback`

Public JWKS: `https://hmsmoney.com/.well-known/jwks.json`

Website: `https://hmsmoney.com` · Privacy: `https://hmsmoney.com/privacy`

Staging callback remains `https://hms-credit.vercel.app/api/auth/singpass/callback`.

Requested scopes (28 data scopes plus openid):

```text
openid uinfin name sex race dob residentialstatus nationality passtype passstatus passexpirydate mobileno email regadd housingtype cpfcontributions noahistory ownerprivate employment occupation marital vehicles.vehicleno hdbownership.noofowners hdbownership.address hdbownership.hdbtype hdbownership.leasecommencementdate hdbownership.dateofpurchase hdbownership.outstandingloanbalance hdbownership.monthlyloaninstalment
```

## Implemented controls

- FAPI discovery, PAR, PKCE S256, private-key client assertions, DPoP, encrypted/signed
  token verification, nonce/state/browser binding, subject matching and single-use callbacks.
- Official unchanged Apply with Singpass SVG; 44px control and surrounding space.
- Full Myinfo review before submission; government fields protected; principal name
  read-only; user-provided fields editable; all HDB/vehicle/CPF/NOA entries retained.
- Encrypted temporary drafts expire after 15 minutes. Cancel removes them; expired
  drafts are purged on subsequent retrieval/start and daily at 18:00 UTC by protected cron.
- Server-only database access, RLS with browser roles revoked, protected success receipt,
  no-store review/staff responses and no personally identifying URL parameters.
- Staff email allowlist, short-lived one-use codes, attempt limits, session expiry and audits.
- Public domain keeps staging authentication disabled. Manual enquiries remain available.

## Release gates still requiring completion

1. Obtain production app approval and complete the applicable Singpass onboarding and
   agreements. Configure the approved production client ID, keys, callback and JWKS.
   Do not reuse staging credentials as assumed production credentials.
2. Confirm the use case and approved scopes in the portal, and complete required UAT
   evidence. Staging citizen and foreigner retrieval have passed. Repeat the full live
   review/submit journey after deployment, including denial, expiry and callback replay.
3. Email setup is complete: verified hmsmoney.com, domain-scoped sending key and
   `EMAIL_FROM=HMS Credit <noreply@hmsmoney.com>`. Resend confirmed delivery of a staff
   login code and labelled application test to `zhuomingpeh@gmail.com` on 28 September.
   Do not put full Myinfo payloads or NRIC values into notification emails.
4. Business owner must approve retention periods for submitted/abandoned manual
   applications and staff audit logs, privacy/contact wording, access procedures and
   breach response. Current submitted applications do not have automatic deletion.
5. Establish monitored database backups and restore testing, key rotation, error/cron
   monitoring and operational ownership. Supabase was resumed from a paused free
   project; choose a production plan based on uptime/backup needs, not API compatibility.
6. Once approval and validation are complete, set `SINGPASS_ENV=production`,
   `SINGPASS_REDIRECT_URI` to the production callback and
   `SINGPASS_PRODUCTION_APPROVED=true`, then redeploy and verify the approved flow.
   Keep approval false/unset if any registration step is incomplete.

## Domain and mail

Vercel: apex A `216.198.79.1`, www CNAME `cname.vercel-dns.com`.
Both hosts serve the site during propagation to prevent a loop with Squarespace's
cached apex-to-www redirect. After apex DNS has fully propagated, optionally set
`CANONICAL_DOMAIN_REDIRECT=true` and redeploy to redirect www to apex.
Google Workspace root MX records are preserved; do not replace them with Resend MX.
Resend receiving is disabled. Domain-specific DKIM and sending CNAMEs are verified.
Gmail routing has been checked; actual inbound/outbound mailbox delivery is not yet tested.

## Official references

- https://docs.developer.singpass.gov.sg/docs/technical-specifications/integration-guide
- https://docs.developer.singpass.gov.sg/docs/products/singpass-myinfo/key-principles
- https://docs.developer.singpass.gov.sg/docs/products/singpass-myinfo/data-display-guidelines
- https://docs.developer.singpass.gov.sg/docs/getting-started/singpass-button-design-specification

Verification evidence and test scripts are listed in SINGPASS-VERIFICATION.md.

## Security hardening, 28 September evening

The runtime uses a restricted hms_app PostgreSQL role and verifies Supabase's TLS
certificate. RLS blocks browser roles; hms_app cannot create tables or delete audit
records. Database-backed throttles protect code sends, verification, manual enquiries
and Singpass starts. Email-code login is retained at the owner's explicit request;
it is not MFA. Per-response script nonces, private no-store/noindex headers and
bounded form inputs are enforced. No known npm advisories remain after tested
transitive patches. These checks are not an independent penetration-test certification.

The draft user-journey PDF remains a working document until every placeholder is
replaced with current staging screenshots, including the actual Singpass consent
screen. Do not submit a placeholder deck as completed evidence.
