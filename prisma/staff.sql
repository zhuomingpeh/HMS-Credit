BEGIN;
CREATE TABLE IF NOT EXISTS public."StaffLogin" (
  email TEXT PRIMARY KEY, "codeHash" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0, "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS public."StaffSession" (
  "tokenHash" TEXT PRIMARY KEY, email TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "StaffSession_expiresAt_idx" ON public."StaffSession" ("expiresAt");
CREATE TABLE IF NOT EXISTS public."StaffAudit" (
  id TEXT PRIMARY KEY, email TEXT NOT NULL, action TEXT NOT NULL, "recordId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public."StaffLogin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StaffSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StaffAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."StaffLogin", public."StaffSession", public."StaffAudit" FROM anon, authenticated;
COMMIT;
