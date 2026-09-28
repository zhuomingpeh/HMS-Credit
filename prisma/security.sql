-- This application uses its server-side PostgreSQL connection, never browser Data API access.
-- Apply to Supabase after creating the Prisma tables; safe to run repeatedly.
BEGIN;
ALTER TABLE public."Applicant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SingpassAuthSession" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."Applicant", public."Lead", public."SingpassAuthSession" FROM anon, authenticated;
COMMIT;
