# HMS Myinfo production activation — 1 October 2026

This status supersedes the pre-approval gates in the September handover and checklist. Production Myinfo is enabled on hmsmoney.com. A full real-user authentication, consent and submission remains to be completed by an authorised tester; this document does not certify that it has passed.

## Completed

- Owner supplied approval in principle and a Production / Active portal screenshot for HMS Application, category Money Lender, FAPI 2.0, assurance level 2.
- Configured approved Client ID `7KqsxQvu9AqQbV6FFvVL43Ji5C4ZbmGt`, production environment, exact callback `https://hmsmoney.com/api/auth/singpass/callback`, and production approval flag in Vercel.
- Replaced unapproved `housingtype` with approved `hdbtype` in the requested scopes, review display and applicant mapping. The separate ownership field `hdbownership.hdbtype` remains unchanged. `noahistory` covers the approved detailed last-two-years NOA scope.
- Derived both public keys from the private keys and checked them against the live public JWKS. Production PAR accepted the client, signature, callback and all 29 scopes (28 data scopes plus OpenID), HTTP 201. No personal data was retrieved by that preflight.
- Production build, ESLint, Myinfo mapping/review tests, encryption/token checks and safe logging tests passed.
- Completed isolated application submission, contact/marital edits, protected-field tampering rejection, cancellation, single-use draft/replay and staff OTP/session tests against a restored local database. Tests cannot target a remote database now. No test email was sent during these tests.
- Added `Applicant.sourceEnvironment`, default staging, with a compatible additive SQL change. Five existing Myinfo applications remain tagged as staging. Newly submitted production records are tagged production; the staff list and detail views retain test labels on old records.
- Commit `4eade17` deployed successfully. Deployment `dpl_DysvPMFurW1biFQLuaMqN6BSD3wu` / `https://hms-credit-kc1czmyfs-loanify.vercel.app` serves both HMS hosts.
- Live readiness check: public/apply pages return 200; unauthenticated staff and review redirect; cron returns 401 without credentials; /.env returns 404; JWKS contains public keys only.
- Browser check reached `https://login.id.singpass.gov.sg/main`, showing HMS Application, purpose “application of loan” and a production QR code. Returned the browser to /apply so the owner can start a fresh session.
- Production notification recipient is `support@hmsmoney.com`; sender is `HMS Credit <noreply@hmsmoney.com>`. Resend confirms delivery of the earlier labelled manual-application notification on 29 September, 16:10 SGT. Fresh production Myinfo notification delivery remains part of the owner's end-to-end test.

## Backup and restore evidence

Created a consistent PostgreSQL public-schema snapshot before the additive change. Restored schema, data, indexes, RLS policies and grants to isolated PostgreSQL 17 on loopback. All eight tables matched the original snapshot's row counts and content hashes. Source PostgreSQL version 17.6; restore tools 17.10.

The retained backup is encrypted with Windows DPAPI CurrentUser and restricted by filesystem permissions. It requires this Windows user profile to decrypt; it is not an independently recoverable off-site backup. Supabase platform schemas, role passwords, environment secrets and uploaded storage objects are outside this application snapshot.

Backup: `output/private-backups/2026-10-01-production-final/hms-public.dump.dpapi`.

Verification: `output/private-backups/2026-10-01-production-final/verification.json`.

The local restore server is stopped. Automatic approval review rejected recursive deletion of temporary restore folders without a detailed reason. Owner cleanup required for these task-created paths only:

- `output/private-backups/2026-10-01-production/`
- `output/private-backups/2026-10-01-production-verified/`
- `output/private-backups/2026-10-01-production-final/restore-data/`
- `output/private-backups/2026-10-01-production-final/local-test.env`

Keep the final encrypted `.dpapi` backup and `verification.json`. The folders contain restricted local test copies; they are ignored by Git and Vercel uploads.

## Owner actions

1. Reply-all to acknowledge the approval conditions, if not already sent. No email has been sent by the agent.
2. Complete one authorised production journey at https://hmsmoney.com/apply with a real Singpass account. Consent retrieves real personal information; Submit stores the application. Check phone/email prefill, editable marital status, NOA history and the registered-address HDB type. Check success, one saved production record in /staff and notification delivery to support@hmsmoney.com. Identify any launch test clearly to staff so it is not processed as a genuine borrowing request.
3. After this test passes, submit the Go Live notification through https://partnersupport.singpass.gov.sg/ and select Go Live. No support request has been submitted by the agent.
4. Establish recurring, independently recoverable backups and a retention owner. This turn completed a one-time snapshot/restore test, not a recurring managed backup service or purchase.
5. Rotate previously shared owner/account credentials and approve submitted-record retention and incident procedures. Existing runtime credentials were not disclosed. Password changes and any paid plan purchases remain with the owner.
6. Obtain clearance at least two weeks before releasing marketing materials that reference Singpass/Myinfo, as required in the approval email. Cooperate with Singpass's independent testing. Approval is valid for up to six months; activation is now within that period.

## Go Live request draft — send after the owner test passes

Subject: Go Live notification — HMS Application — HMS CREDIT PTE. LTD.

Dear Singpass Partner Support Team,

HMS CREDIT PTE. LTD. (UEN 201703408D) would like to notify you that HMS Application is live with Myinfo at https://hmsmoney.com/apply.

Approved Client ID: 7KqsxQvu9AqQbV6FFvVL43Ji5C4ZbmGt

Production activation date: 1 October 2026

Use case: Loan application and borrower identity verification.

The integration follows the approved data scopes and user journey, including editable email, mobile number and MSF marital status. We are ready to coordinate your independent testing. Please let us know if any further information is required.

Best regards,
HMS CREDIT PTE. LTD.

## Rollback

If production sign-in or submission fails, set `SINGPASS_PRODUCTION_APPROVED=false` for the Vercel production environment and redeploy to restore the manual-only flow. Keep the new origin column and existing records. Reverting code or restoring a database should not erase applications received after this snapshot.

## References

- Approved registration and conditions supplied by the owner on 1 October 2026.
- https://docs.developer.singpass.gov.sg/docs/data-catalog-myinfo/catalog/personal
- https://docs.developer.singpass.gov.sg/docs/technical-specifications/integration-guide
- https://docs.developer.singpass.gov.sg/docs/products/singpass-myinfo/key-principles
