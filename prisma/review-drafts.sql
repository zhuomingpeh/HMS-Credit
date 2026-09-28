BEGIN;
CREATE TABLE IF NOT EXISTS public."MyinfoDraft" (
  "tokenHash" TEXT PRIMARY KEY,
  "encrypted" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "MyinfoDraft_expiresAt_idx" ON public."MyinfoDraft" ("expiresAt");
ALTER TABLE public."MyinfoDraft" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."MyinfoDraft" FROM anon, authenticated;
COMMIT;
