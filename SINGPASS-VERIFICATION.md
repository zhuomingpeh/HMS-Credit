# Singpass staging verification — 28 September 2026

Reference: https://docs.developer.singpass.gov.sg/docs/technical-specifications/integration-guide

App ID configured in local/Vercel environments. SINGPASS_ENV remains staging.
Registered callback currently used: https://hms-credit.vercel.app/api/auth/singpass/callback

## Reviewed and corrected
- PAR, PKCE S256, private_key_jwt, ephemeral DPoP key reused per flow.
- Assertion audience now uses discovery issuer, per official client assertion guide.
- Fresh assertions and DPoP proofs per attempted request.
- Required JWT issuer, audience, subject and issue time. ID tokens require expiry/nonce;
  UserInfo follows the documented schema without mandatory expiry, with a 5-minute iat
  freshness limit and validation of expiry if supplied.
- UserInfo subject must match ID-token subject; person_info must be present.
- No decoded claims in validation errors.
- Atomic single-use callback session claim.
- Success page requires signed short-lived browser receipt; no applicant lookup by URL ID.
- Start route canonicalizes to callback origin before setting browser-binding cookie.
- Local environment files excluded from CLI uploads with .vercelignore.

## Verified
- Production build/typecheck passes.
- scripts/test-singpass-security.mjs exercises encrypted/signed token acceptance and rejection,
  issuer/audience/nonce/expiry/subject validation, assertion audience/lifetime, and fresh DPoP jti.
- Supabase project restored from its paused state on 28 September 2026. A direct pooled
  database connection and SELECT 1 succeeded; no paid plan change was needed.
- Deployed Apply with Singpass now completes PAR/session creation and reaches the official
  staging login page for HMS Application. Portal now allows 1FA password authentication.
- Supplied staging account signs in and reaches all 28 requested consent fields. Its
  UserInfo request returned HTTP 400; no field mapping was reached for this account.
- Official populated Myinfo persona successfully reached token exchange and encrypted
  UserInfo response verification. This exposed an incorrect mandatory exp requirement;
  corrected with a regression test using the documented UserInfo claim shape.
- End-to-end foreigner and citizen test applications now saved successfully in Supabase.
- Citizen profile returned 15 CPF rows, two NOA rows, two HDB records and two vehicles.
  Fixed mapping to retain both HDB records and detailed NOA income components; remapped
  the two known test records from their existing raw payloads, without another login.
- Mapping tests cover multiple properties, zero balances, unavailable/malformed collections
  and the distinction between absent and blank foreigner residential status.
- Enabled RLS and revoked anon/authenticated table privileges on Applicant, Lead and
  SingpassAuthSession using prisma/security.sql. Verified server connectivity remains valid.
- Removed expired authorization sessions. New flows clean expired sessions and clear
  consumed PKCE/DPoP material from the database immediately after atomic session claim.

## Blocked / remaining before production readiness
- Portal purpose currently says "application of loan matching"; update to describe direct
  loan applications to HMS Credit before production onboarding.
- Validate cancelled/expired/replayed callbacks end-to-end.
- Myinfo callback now creates an encrypted 15-minute draft. Applicants review all returned
  fields, edit only user-provided fields (principal name always read-only), then explicitly
  consent and submit. Cancel deletes the draft; expiry blocks access and daily cleanup purges it.
- Added official Singpass button artwork, CPF ordering and NOA clearance labels.
- Staff portal restricts access to the configured allowlist with eight-digit email codes,
  five attempts per code, single-use verification, one-hour sessions and access audit logs.
- Local review integration passed: full property display, protected-field tampering ignored,
  atomic submission, draft replay rejection, unauthenticated access and cron authentication.
- Local staff integration passed: incorrect/expired codes or sessions denied, correct code
  accepted once and replay rejected. Live email delivery remains untested.
- Applicant-data retention, notification delivery, and production
  onboarding remain launch requirements. No RESEND_API_KEY is currently configured in
  Vercel production, so application notification emails are not yet sent.
- A final production-domain redirect registration and production app approval are still
  needed. The deployed integration intentionally remains connected to Singpass staging.
- Test account password is not stored in the repository or environment variables.
- hmsmoney.com now routes to Vercel over HTTPS; www redirects to the apex. Existing Google
  Workspace MX records are unchanged. Sender authentication awaits Squarespace reauthentication.
- See SINGPASS-PRODUCTION.md for the handover settings and release gates.

Testing references:
- https://partnersupport.singpass.gov.sg/hc/en-sg/articles/33107472981657-Staging-Singpass-App-Installation-Tutorial-Guide
- https://partnersupport.singpass.gov.sg/hc/en-sg/articles/42815214893977-How-to-Enable-or-Disable-Username-Password-Flow-SMS-OTP-on-Singpass-Developer-Portal-SDP
- https://docs.developer.singpass.gov.sg/docs/testing/myinfo-test-personas
