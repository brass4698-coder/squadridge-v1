-- TTL cleanup hardening:
--   * Named purge helpers for messages, zk_proof_submissions (no zk_pool table),
--     match_queue, and squads
--   * Log action = 'ttl_purge' to moderation_audit_log BEFORE each delete
--   * SECURITY DEFINER + search_path = public, pg_catalog
--   * Re-schedule hourly cleanup-expired-data cron
--
-- Note: proof expiry uses public.zk_proof_submissions.expires_at (90 days),
-- not a table named zk_pool.

-- Allow system TTL rows (cron has no auth.uid()).
ALTER TABLE public.moderation_audit_log
    ALTER COLUMN actor_user_id DROP NOT NULL;

ALTER TABLE public.moderation_audit_log
    DROP CONSTRAINT IF EXISTS moderation_audit_actor_matches_session;

ALTER TABLE public.moderation_audit_log
    ADD CONSTRAINT moderation_audit_actor_matches_session CHECK (
        action = 'ttl_purge'
        OR actor_user_id = auth.uid ()
    );

-- Metrics: track ZK proof purges alongside existing counters.
ALTER TABLE public.retention_cleanup_runs
    ADD COLUMN IF NOT EXISTS zk_proofs_deleted int NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- ZK proof TTL (sensitive verification artifacts)
-- ---------------------------------------------------------------------------
ALTER TABLE public.zk_proof_submissions
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE public.zk_proof_submissions
SET
    expires_at = created_at + INTERVAL '90 days'
WHERE
    expires_at IS NULL;

ALTER TABLE public.zk_proof_submissions
    ALTER COLUMN expires_at SET NOT NULL;

CREATE OR REPLACE FUNCTION public.set_zk_proof_ttl ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
BEGIN
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at := timezone('utc'::text, now()) + INTERVAL '90 days';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_zk_proof_ttl ON public.zk_proof_submissions;

CREATE TRIGGER trigger_set_zk_proof_ttl
    BEFORE INSERT ON public.zk_proof_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_zk_proof_ttl ();

CREATE INDEX IF NOT EXISTS idx_zk_proof_submissions_expires_at
    ON public.zk_proof_submissions (expires_at);

REVOKE ALL ON FUNCTION public.set_zk_proof_ttl () FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- Shared audit helper (must run before deletes)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_ttl_purge (
    p_target_type text,
    p_deleted_count integer,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
BEGIN
    IF coalesce(p_deleted_count, 0) <= 0 THEN
        RETURN;
    END IF;
    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (
            NULL,
            'ttl_purge',
            p_target_type,
            NULL,
            coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
                'deleted_count', p_deleted_count,
                'purged_at', timezone('utc'::text, now())
            ));
END;
$$;

REVOKE ALL ON FUNCTION public.log_ttl_purge (text, integer, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.log_ttl_purge (text, integer, jsonb) TO service_role;

-- ---------------------------------------------------------------------------
-- Per-table cleanup functions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_expired_messages ()
    RETURNS integer
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
DECLARE
    ids uuid[];
    deleted int := 0;
BEGIN
    SELECT
        coalesce(array_agg(id), ARRAY[]::uuid[]) INTO ids
    FROM
        public.messages
    WHERE
        expires_at IS NOT NULL
        AND expires_at < timezone('utc'::text, now());

    deleted := coalesce(array_length(ids, 1), 0);
    IF deleted > 0 THEN
        PERFORM
            public.log_ttl_purge ('message', deleted, jsonb_build_object('ids_sample', to_jsonb(ids[1:least(deleted, 20)])));
        DELETE FROM public.messages
        WHERE id = ANY (ids);
    END IF;
    RETURN deleted;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_zk_proofs ()
    RETURNS integer
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
DECLARE
    ids uuid[];
    deleted int := 0;
BEGIN
    SELECT
        coalesce(array_agg(id), ARRAY[]::uuid[]) INTO ids
    FROM
        public.zk_proof_submissions
    WHERE
        expires_at < timezone('utc'::text, now());

    deleted := coalesce(array_length(ids, 1), 0);
    IF deleted > 0 THEN
        PERFORM
            public.log_ttl_purge ('zk_proof_submission', deleted, '{}'::jsonb);
        DELETE FROM public.zk_proof_submissions
        WHERE id = ANY (ids);
    END IF;
    RETURN deleted;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_squads ()
    RETURNS integer
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
DECLARE
    ids uuid[];
    deleted int := 0;
BEGIN
    SELECT
        coalesce(array_agg(id), ARRAY[]::uuid[]) INTO ids
    FROM
        public.squads
    WHERE
        expires_at < timezone('utc'::text, now());

    deleted := coalesce(array_length(ids, 1), 0);
    IF deleted > 0 THEN
        PERFORM
            public.log_ttl_purge ('squad', deleted, '{}'::jsonb);
        DELETE FROM public.squads
        WHERE id = ANY (ids);
    END IF;
    RETURN deleted;
END;
$$;

CREATE OR REPLACE FUNCTION public.sweep_matchmaking_queue ()
    RETURNS integer
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
DECLARE
    ids uuid[];
    deleted int := 0;
BEGIN
    SELECT
        coalesce(array_agg(id), ARRAY[]::uuid[]) INTO ids
    FROM
        public.match_queue
    WHERE
        expires_at IS NOT NULL
        AND expires_at < timezone('utc'::text, now());

    deleted := coalesce(array_length(ids, 1), 0);
    IF deleted > 0 THEN
        PERFORM
            public.log_ttl_purge ('match_queue', deleted, '{}'::jsonb);
        DELETE FROM public.match_queue
        WHERE id = ANY (ids);
    END IF;
    RETURN deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_expired_messages () FROM PUBLIC;

REVOKE ALL ON FUNCTION public.cleanup_expired_zk_proofs () FROM PUBLIC;

REVOKE ALL ON FUNCTION public.cleanup_expired_squads () FROM PUBLIC;

REVOKE ALL ON FUNCTION public.sweep_matchmaking_queue () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.cleanup_expired_messages () TO service_role;

GRANT EXECUTE ON FUNCTION public.cleanup_expired_zk_proofs () TO service_role;

GRANT EXECUTE ON FUNCTION public.cleanup_expired_squads () TO service_role;

GRANT EXECUTE ON FUNCTION public.sweep_matchmaking_queue () TO service_role;

-- Orchestrator used by hourly pg_cron job.
CREATE OR REPLACE FUNCTION public.run_expired_data_cleanup ()
    RETURNS public.retention_cleanup_runs
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
DECLARE
    started_at timestamptz := clock_timestamp();
    msgs int := 0;
    queue_rows int := 0;
    squad_rows int := 0;
    zk_rows int := 0;
    run_row public.retention_cleanup_runs;
BEGIN
    msgs := public.cleanup_expired_messages ();
    queue_rows := public.sweep_matchmaking_queue ();
    squad_rows := public.cleanup_expired_squads ();
    zk_rows := public.cleanup_expired_zk_proofs ();

    INSERT INTO public.retention_cleanup_runs (
        messages_deleted,
        match_queue_deleted,
        squads_deleted,
        zk_proofs_deleted,
        duration_ms)
    VALUES (
        msgs,
        queue_rows,
        squad_rows,
        zk_rows,
        GREATEST(
            0,
            (EXTRACT(epoch FROM (clock_timestamp() - started_at)) * 1000)::int))
RETURNING
    * INTO run_row;

    RETURN run_row;
END;
$$;

REVOKE ALL ON FUNCTION public.run_expired_data_cleanup () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.run_expired_data_cleanup () TO service_role;

COMMENT ON FUNCTION public.run_expired_data_cleanup () IS
    'Hourly TTL purge: messages, match_queue, squads, zk_proof_submissions. Logs ttl_purge to moderation_audit_log before each delete batch.';

-- Harden BEFORE INSERT TTL triggers (messages / match_queue).
CREATE OR REPLACE FUNCTION public.set_message_ttl ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
BEGIN
    NEW.expires_at := timezone('utc'::text, now()) + INTERVAL '7 days';
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_match_queue_ttl ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
BEGIN
    NEW.expires_at := timezone('utc'::text, now()) + INTERVAL '7 days';
    RETURN NEW;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
DECLARE
    jid bigint;
BEGIN
    GRANT USAGE ON SCHEMA cron TO postgres;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
    WHEN insufficient_privilege THEN
        NULL;
END;
$$;

DO $$
DECLARE
    jid bigint;
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_extension
        WHERE
            extname = 'pg_cron') THEN
    SELECT
        jobid INTO jid
    FROM
        cron.job
    WHERE
        jobname = 'cleanup-expired-data';
    IF jid IS NOT NULL THEN
        PERFORM
            cron.unschedule (jid);
    END IF;
    PERFORM
        cron.schedule (
            'cleanup-expired-data',
            '0 * * * *',
            $cmd$
            SELECT
                public.run_expired_data_cleanup ();

$cmd$);
END IF;
END;
$$;
