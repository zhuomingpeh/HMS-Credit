# Singpass staging verification — 28 September 2026

Reference: https://docs.developer.singpass.gov.sg/docs/technical-specifications/integration-guide

App ID configured in local/Vercel environments. SINGPASS_ENV remains staging.
Registered callback currently used: https://hms-credit.vercel.app/api/auth/singpass/callback

## Reviewed and corrected
- PAR, PKCE S256, private_key_jwt, ephemeral DPoP key reused per flow.
- Assertion audience now uses discovery issuer, per official client assertion guide.
- Fresh assertions and DPoP proofs per attempted request.
- Required JWT issuer, audience, subject, issue time and expiry; nonce checked for ID token.
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

## Blocked / remaining before production readiness
- Supabase transaction AND session poolers report tenant/user not found for project
  xbbifpruletrsytvypfv. Check whether paused; resume or obtain current Connect host.
- Full staging account login, consent, token exchange and all 28 returned field mappings are
  NOT yet verified. Initial PAR passed before database session creation failed.
- Validate cancelled/expired/replayed callbacks end-to-end once DB is restored.
- Review Myinfo display/consent requirements and application review before submission;
  the scaffold currently persists data directly at callback.
- Staff access controls, retention/cleanup of stored Myinfo/session data, notification delivery,
  and production onboarding remain launch requirements. Do not call this fully compliant.
- Test account password is not stored in the repository or environment variables.
