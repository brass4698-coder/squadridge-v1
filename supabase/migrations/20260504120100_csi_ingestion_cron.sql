-- Track C (CSI ingestion): hourly cron that calls the Edge Function.
--
-- We invoke the Edge Function rather than running computation in plpgsql
-- because the canonical CSI math lives in src/lib/csi/conflictSeverityIndex.ts
-- and the Edge function (csi-ingest-snapshot) hosts the deterministic port.
-- Doing the same math twice (TS + plpgsql) would inevitably drift; one source
-- of truth wins.
--
-- Implementation:
--   * The function `private.csi_invoke_ingest()` posts to the project's
--     Edge URL with the service role key, both pulled from a vault secret
--     (`vault.csi_ingest_endpoint`). The vault entry is provisioned by ops
--     during deploy — without it the function logs a NOTICE and returns;
--     this keeps `supabase db reset` clean and keeps test runs from making
--     outbound HTTP calls.
--   * Schedule: hourly at :07 UTC.
--
-- Because we depend on the Supabase platform's `http` extension, the
-- migration is a no-op when it isn't available (e.g. local minimal
-- Postgres). Feature checks mirror 20260418090000_ttl_cleanup.sql.

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- vault.secrets is provisioned in Supabase-hosted projects. Local dev / test
-- environments may not have it; we guard with a feature check.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
        RAISE NOTICE 'csi_ingest_cron: pg_extension http not installed — skipping cron registration. Install via dashboard before relying on automated ingestion.';
        RETURN;
    END IF;
END;
$$;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.csi_invoke_ingest ()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, extensions
    AS $$
DECLARE
    endpoint text;
    service_key text;
BEGIN
    -- Pull endpoint + service role key from the vault. When unset, fail
    -- soft so a brand-new project doesn't error its hourly cron.
    BEGIN
        SELECT decrypted_secret INTO endpoint FROM vault.decrypted_secrets WHERE name = 'csi_ingest_endpoint';
        SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'service_role_key';
    EXCEPTION
        WHEN undefined_table OR insufficient_privilege THEN
            RAISE NOTICE 'csi_invoke_ingest: vault unavailable, skipping';
            RETURN;
    END;
    IF endpoint IS NULL OR service_key IS NULL THEN
        RAISE NOTICE 'csi_invoke_ingest: csi_ingest_endpoint or service_role_key vault entry missing — skipping run';
        RETURN;
    END IF;
    -- http_post returns the response; we discard the body to avoid
    -- accumulating noise in the cron log. Errors propagate as exceptions.
    PERFORM
        extensions.http_post (
            endpoint,
            jsonb_build_object('period_hours', 24)::text,
            'application/json',
            ARRAY[
                ('Authorization', 'Bearer ' || service_key)::extensions.http_header
            ]::extensions.http_header[]
        );
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'csi_invoke_ingest: %', SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION private.csi_invoke_ingest () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.csi_invoke_ingest () TO service_role;

DO $$
DECLARE
    jid bigint;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        SELECT jobid INTO jid FROM cron.job WHERE jobname = 'csi-ingest-snapshot';
        IF jid IS NOT NULL THEN
            PERFORM cron.unschedule (jid);
        END IF;
        PERFORM cron.schedule (
            'csi-ingest-snapshot',
            '7 * * * *',
            $cmd$ SELECT private.csi_invoke_ingest (); $cmd$
        );
    END IF;
END;
$$;
