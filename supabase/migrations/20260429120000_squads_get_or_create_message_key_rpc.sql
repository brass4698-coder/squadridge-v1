-- Atomic accessor for the squad message encryption key.
--
-- Replaces the client-side write path in src/lib/squadMessageKey.ts (raw UPDATE) with a
-- SECURITY DEFINER RPC that:
--   * takes a row-level lock on public.squads (FOR UPDATE) so concurrent callers cannot
--     race and produce divergent keys / silent decrypt failures,
--   * authorises the caller as a current squad member or moderator before disclosing the
--     key — without this gate, granting EXECUTE to `authenticated` would convert the RPC
--     into a key-exfiltration primitive for any logged-in user,
--   * generates a fresh 32-byte AES key (extensions.gen_random_bytes(32), base64) only
--     when the row's value is missing — matching the format used by the
--     20260417150000_... default trigger so client AES-256-GCM import paths keep working.
--
-- See docs/security/threat-model.md §"Messages use AES-256-GCM at the application layer".

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.get_or_create_squad_message_key (p_squad_id uuid)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    k text;
    is_member boolean;
    is_moderator boolean;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'not authorized'
            USING ERRCODE = '42501';
    END IF;
    SELECT EXISTS (
        SELECT
            1
        FROM
            public.squad_members sm
        WHERE
            sm.squad_id = p_squad_id
            AND sm.user_id = uid) INTO is_member;
    IF NOT is_member THEN
        SELECT EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = uid) INTO is_moderator;
    END IF;
    IF NOT (is_member OR is_moderator) THEN
        RAISE EXCEPTION 'not authorized'
            USING ERRCODE = '42501';
    END IF;
    -- Serialize concurrent callers on the same squad row.
    SELECT
        message_encryption_key INTO k
    FROM
        public.squads
    WHERE
        id = p_squad_id
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'squad not found'
            USING ERRCODE = 'P0002';
    END IF;
    IF k IS NULL OR btrim(k) = '' THEN
        k := encode(extensions.gen_random_bytes (32), 'base64');
        UPDATE
            public.squads
        SET
            message_encryption_key = k
        WHERE
            id = p_squad_id;
    END IF;
    RETURN k;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_squad_message_key (uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_or_create_squad_message_key (uuid) TO authenticated;

COMMENT ON FUNCTION public.get_or_create_squad_message_key (uuid) IS
'Atomic accessor for squads.message_encryption_key. Locks the row, returns the existing key or generates a new 32-byte AES key (base64) when missing. Authorised for squad members and moderators only — see migration 20260429120000.';
