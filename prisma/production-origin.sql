-- Additive deployment prerequisite. Existing applications came from staging.
-- Old application deployments remain compatible; do not drop this on code rollback.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public."Applicant"
  ADD COLUMN IF NOT EXISTS "sourceEnvironment" TEXT NOT NULL DEFAULT 'staging';
COMMIT;
