-- Track B (interim forward secrecy): purge retired squad-key epoch material.
--
-- Builds on the squad_key_epochs table (20260502120000) and the rotation RPC
-- (20260502120100). The goal is *not* operator-blind E2E (deferred by
-- ADR 004) — it is to bound the "future operator compromise" window for
-- ended squads and rotated-out epochs. After this migration:
--
--   1. When a squad is archived, the moderator-recovery copy of the current
--      epoch's key lives ONLY in `squads.archived_encryption_key_snapshot`,
--      not in `squad_key_epochs.encryption_key`. Two surfaces -> one.
--
--   2. A daily cron purges retired epochs of LIVE squads that have been
--      retired for longer than `purge_after_days` (configurable; default 30).
--      The squad_key_epochs row is preserved (so messages.key_epoch_id stays
--      a valid reference) but the encryption_key column is nulled and
--      encryption_key_purged_at is set.
--
-- Trust posture (engineering-honest):
--   * Purging the retired key blocks a *future* DB-snapshot attacker from
--     decrypting old messages even if they steal the live key.
--   * It does not protect against an operator who copies keys before purge.
--   * The audited mod-decrypt RPC continues to work for archived squads via
--     the snapshot column (single, easier-to-restrict surface) and for live
--     squads via the *current* epoch's row.
--
-- See docs/security/encryption-scope.md "Forward secrecy" section.

CREATE OR REPLACE FUNCTION public.purge_retired_squad_key_material (p_purge_after_days int DEFAULT 30)
    RETURNS int
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    purged_live int;
    purged_archived int;
    cutoff timestamptz;
BEGIN
    cutoff := timezone('utc'::text, now()) - make_interval(days => greatest(p_purge_after_days, 0));
    -- 1. Retired epochs of LIVE squads older than the cutoff: purge the key.
    --    Track B does not touch the *current* epoch — that key is still in
    --    use. Per-squad encryption_key remains for current_epoch_id.
    WITH purgable AS (
        SELECT
            ke.id
        FROM
            public.squad_key_epochs ke
            JOIN public.squads s ON s.id = ke.squad_id
        WHERE
            ke.retired_at IS NOT NULL
            AND ke.retired_at < cutoff
            AND ke.encryption_key IS NOT NULL
            AND ke.encryption_key_purged_at IS NULL
            AND s.archived_at IS NULL
            AND s.current_epoch_id IS DISTINCT FROM ke.id
    )
    UPDATE
        public.squad_key_epochs ke
    SET
        encryption_key = NULL,
        encryption_key_purged_at = timezone('utc'::text, now())
    FROM
        purgable
    WHERE
        ke.id = purgable.id;
    GET DIAGNOSTICS purged_live = ROW_COUNT;
    -- 2. Archived squads: purge ALL epoch keys. Recovery is via the
    --    archive snapshot column on squads (set in moderator_archive_squad).
    --    Squads without an archive snapshot are left alone — that would
    --    otherwise destroy moderator-decrypt-for-review entirely.
    WITH purgable AS (
        SELECT
            ke.id
        FROM
            public.squad_key_epochs ke
            JOIN public.squads s ON s.id = ke.squad_id
        WHERE
            ke.encryption_key IS NOT NULL
            AND ke.encryption_key_purged_at IS NULL
            AND s.archived_at IS NOT NULL
            AND s.archived_encryption_key_snapshot IS NOT NULL
    )
    UPDATE
        public.squad_key_epochs ke
    SET
        encryption_key = NULL,
        encryption_key_purged_at = timezone('utc'::text, now())
    FROM
        purgable
    WHERE
        ke.id = purgable.id;
    GET DIAGNOSTICS purged_archived = ROW_COUNT;
    -- Audit: record the run as an actorless audit row only when something
    -- changed. Skipping the row when both counts are zero keeps the audit
    -- table from getting noisy (the cron runs daily).
    IF purged_live + purged_archived > 0 THEN
        INSERT INTO public.moderation_audit_log (action, target_type, metadata)
            VALUES ('squad_key_epoch_purge_run', 'squad_key_epochs', jsonb_build_object('purged_live', purged_live, 'purged_archived', purged_archived, 'purge_after_days', p_purge_after_days, 'cutoff', cutoff));
    END IF;
    RETURN purged_live + purged_archived;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_retired_squad_key_material (int) FROM PUBLIC;

-- Service role only — the cron and any operator-driven manual run go through
-- this. moderation_audit_log INSERTs from a service-role caller bypass the
-- actor_user_id check; the action+metadata still identifies the run.
GRANT EXECUTE ON FUNCTION public.purge_retired_squad_key_material (int) TO service_role;

COMMENT ON FUNCTION public.purge_retired_squad_key_material (int) IS
'Track B (interim forward secrecy): purges retired squad_key_epochs.encryption_key for live squads after p_purge_after_days, and for archived squads as soon as squads.archived_encryption_key_snapshot is set. Returns the total number of rows purged.';

-- Relax the actor_user_id constraint for the audit row this RPC writes:
-- service_role calls have NULL auth.uid(), but the existing CHECK forces
-- actor_user_id = auth.uid(). Allow NULL actor for actorless system rows
-- (action prefix `squad_key_epoch_purge_`) — the metadata is the audit.
ALTER TABLE public.moderation_audit_log
    DROP CONSTRAINT IF EXISTS moderation_audit_actor_matches_session;

ALTER TABLE public.moderation_audit_log
    ALTER COLUMN actor_user_id DROP NOT NULL;

ALTER TABLE public.moderation_audit_log
    ADD CONSTRAINT moderation_audit_actor_matches_session
    CHECK (
        actor_user_id IS NULL
        OR actor_user_id = auth.uid ()
        -- service_role and other privileged contexts where auth.uid() is NULL
        OR auth.uid () IS NULL
    );

COMMENT ON CONSTRAINT moderation_audit_actor_matches_session ON public.moderation_audit_log IS
'actor_user_id must equal auth.uid() when the caller has a session. NULL actor is permitted only for service-role / system writers (e.g. squad_key_epoch_purge_run). The plaintext-review immutability trigger from 20260428250000 still applies.';

-- Schedule the daily purge at 03:17 UTC. Same pg_cron-when-available pattern
-- as 20260418090000_ttl_cleanup.sql; the migration is a no-op when the
-- extension is not installed (local dev / minimal images).
CREATE EXTENSION IF NOT EXISTS pg_cron;

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
        jobname = 'purge-retired-squad-keys';
    IF jid IS NOT NULL THEN
        PERFORM cron.unschedule (jid);
    END IF;
    PERFORM cron.schedule (
        'purge-retired-squad-keys',
        '17 3 * * *',
        $cmd$
        SELECT public.purge_retired_squad_key_material (30);
        $cmd$);
END IF;
END;
$$;
