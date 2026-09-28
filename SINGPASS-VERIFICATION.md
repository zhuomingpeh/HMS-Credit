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

## Blocked / remaining before production readiness
- Retry populated Myinfo persona after the UserInfo exp fix. Successful persistence and all
  28 returned field mappings are NOT yet verified end-to-end.
- Portal purpose currently says "application of loan matching"; update to describe direct
  loan applications to HMS Credit before production onboarding.
- Validate cancelled/expired/replayed callbacks end-to-end.
- Review Myinfo display/consent requirements and application review before submission;
  the scaffold currently persists data directly at callback.
- Staff access controls, retention/cleanup of stored Myinfo/session data, notification delivery,
  and production onboarding remain launch requirements. Do not call this fully compliant.
- Test account password is not stored in the repository or environment variables.

Testing references:
- https://partnersupport.singpass.gov.sg/hc/en-sg/articles/33107472981657-Staging-Singpass-App-Installation-Tutorial-Guide
- https://partnersupport.singpass.gov.sg/hc/en-sg/articles/42815214893977-How-to-Enable-or-Disable-Username-Password-Flow-SMS-OTP-on-Singpass-Developer-Portal-SDP
- https://docs.developer.singpass.gov.sg/docs/testing/myinfo-test-personas
