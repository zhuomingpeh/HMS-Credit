-- Provision the hms_app login with a random password through a secure admin session.
-- Never store its password in this file. Production credentials belong in Vercel secrets.
-- Migration/DDL work continues to use a separate operator account outside the deployed app.
BEGIN;
GRANT USAGE ON SCHEMA public TO hms_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Applicant", public."Lead",
 public."MyinfoDraft", public."SingpassAuthSession", public."StaffLogin",
 public."StaffSession", public."RateLimit" TO hms_app;
GRANT SELECT, INSERT ON public."StaffAudit" TO hms_app;
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['Applicant','Lead','MyinfoDraft','SingpassAuthSession','StaffLogin','StaffSession','RateLimit'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='hms_server_access') THEN
      EXECUTE format('CREATE POLICY hms_server_access ON public.%I FOR ALL TO hms_app USING (true) WITH CHECK (true)',t);
    END IF;
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='StaffAudit' AND policyname='hms_audit_read') THEN
    CREATE POLICY hms_audit_read ON public."StaffAudit" FOR SELECT TO hms_app USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='StaffAudit' AND policyname='hms_audit_write') THEN
    CREATE POLICY hms_audit_write ON public."StaffAudit" FOR INSERT TO hms_app WITH CHECK (true);
  END IF;
END $$;
-- hms_app has NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS.
COMMIT;
