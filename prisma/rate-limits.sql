BEGIN;
CREATE TABLE IF NOT EXISTS public."RateLimit" (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "RateLimit_expiresAt_idx" ON public."RateLimit" ("expiresAt");
ALTER TABLE public."RateLimit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."RateLimit" FROM anon, authenticated;
COMMIT;
