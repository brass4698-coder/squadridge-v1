-- Phase 3 (key rotation): public.rotate_squad_key RPC.
--
-- Allows a moderator (in public.moderators) to rotate the per-squad message
-- encryption key. The previous epoch row is retired (retired_at + reason);
-- a fresh 32-byte AES key is generated via pgcrypto and inserted as the next
-- epoch_number. squads.current_epoch_id is repointed to the new row, and
-- squads.message_encryption_key is updated as the denormalised fast-path
-- mirror so the existing client / mod-decrypt code continues to work for
-- live messages without a forced upgrade.
--
-- Audit: writes a moderation_audit_log row with action='squad_key_rotated'
-- carrying the old/new epoch ids, the new epoch number, and a truncated
-- reason string. Rotation is a privileged, intentional action — the audit
-- row is the durable record.
--
-- Service-role callers (Track B purge cron, future scheduled rotations)
-- bypass RLS but still go through this RPC so the audit row is uniformly
-- written. When invoked by service role, auth.uid() is NULL and the RPC
-- emits the audit row with actor_user_id = NULL — moderation_audit_log
-- requires actor_user_id NOT NULL, so service-role callers must pass an
-- explicit p_actor or the function raises. We keep the API simple here
-- (moderator-only at this layer) and let future Edge cron callers wrap a
-- service-role + dedicated audit row themselves.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.rotate_squad_key (p_squad_id uuid, p_reason text)
    RETURNS uuid
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    is_moderator boolean := FALSE;
    new_key text;
    new_epoch_number integer;
    new_epoch_id uuid;
    old_epoch_id uuid;
    reason_trunc text;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'not authorized'
            USING ERRCODE = '42501';
    END IF;
    SELECT EXISTS (
        SELECT
            1
        FROM
            public.moderators m
        WHERE
            m.user_id = uid) INTO is_moderator;
    IF NOT is_moderator THEN
        RAISE EXCEPTION 'not authorized'
            USING ERRCODE = '42501';
    END IF;
    reason_trunc := substring(coalesce(trim(p_reason), ''), 1, 256);
    IF length(reason_trunc) < 4 THEN
        RAISE EXCEPTION 'rotation_reason_required';
    END IF;
    -- Lock the squad row so concurrent rotations serialise on the same squad.
    SELECT
        current_epoch_id INTO old_epoch_id
    FROM
        public.squads
    WHERE
        id = p_squad_id
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'squad_not_found'
            USING ERRCODE = 'P0002';
    END IF;
    SELECT
        coalesce(max(epoch_number), 0) + 1 INTO new_epoch_number
    FROM
        public.squad_key_epochs
    WHERE
        squad_id = p_squad_id;
    new_key := encode(extensions.gen_random_bytes (32), 'base64');
    INSERT INTO public.squad_key_epochs (squad_id, epoch_number, encryption_key)
        VALUES (p_squad_id, new_epoch_number, new_key)
    RETURNING
        id INTO new_epoch_id;
    IF old_epoch_id IS NOT NULL THEN
        UPDATE
            public.squad_key_epochs
        SET
            retired_at = timezone('utc'::text, now()),
            retired_reason = reason_trunc
        WHERE
            id = old_epoch_id
            AND retired_at IS NULL;
    END IF;
    UPDATE
        public.squads
    SET
        current_epoch_id = new_epoch_id,
        message_encryption_key = new_key
    WHERE
        id = p_squad_id;
    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (uid, 'squad_key_rotated', 'squad', p_squad_id, jsonb_build_object('old_epoch_id', old_epoch_id, 'new_epoch_id', new_epoch_id, 'new_epoch_number', new_epoch_number, 'reason', reason_trunc));
    RETURN new_epoch_id;
END;
$$;

REVOKE ALL ON FUNCTION public.rotate_squad_key (uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.rotate_squad_key (uuid, text) TO authenticated;

COMMENT ON FUNCTION public.rotate_squad_key (uuid, text) IS
'Rotates the per-squad message encryption key. Caller must be in public.moderators. Generates a new 32-byte AES key, retires the previous epoch, repoints squads.current_epoch_id and message_encryption_key, and writes a moderation_audit_log row (action=squad_key_rotated). Returns the new epoch row id.';
