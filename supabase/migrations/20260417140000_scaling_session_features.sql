-- Pagination helpers, squad message encryption key, archiving, moderator read access.

-- Message list scans (newest-first windows + cursor for infinite scroll)
CREATE INDEX IF NOT EXISTS messages_squad_sent_at_id_idx ON public.messages (squad_id, sent_at DESC, id DESC);

-- Shared AES-256 key for app-level encryption (members read via squads SELECT; stored ciphertext in messages)
ALTER TABLE public.squads
    ADD COLUMN IF NOT EXISTS message_encryption_key TEXT;

COMMENT ON COLUMN public.squads.message_encryption_key IS
'Base64url-encoded 32-byte AES-256-GCM key; readable by squad members for client-side encrypt/decrypt.';

ALTER TABLE public.squads
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

COMMENT ON COLUMN public.squads.archived_at IS
'When set, squad is read-only for messaging; members may still export transcripts.';

ALTER TABLE public.squads DROP CONSTRAINT IF EXISTS squads_status_check;

ALTER TABLE public.squads ADD CONSTRAINT squads_status_check CHECK (
    status IN ('forming', 'active', 'completed', 'flagged', 'archived')
);

-- Window: latest N messages for a squad, chronological (ascending) within the window.
CREATE OR REPLACE FUNCTION public.messages_latest_window (p_squad_id uuid, p_limit int)
    RETURNS SETOF public.messages
    LANGUAGE sql
    STABLE
    SECURITY INVOKER
    SET search_path = public
    AS $$
    SELECT
        *
    FROM (
        SELECT
            m.*
        FROM
            public.messages m
        WHERE
            m.squad_id = p_squad_id
        ORDER BY
            m.sent_at DESC,
            m.id DESC
        LIMIT LEAST(GREATEST(p_limit, 1), 100)) t
ORDER BY
    t.sent_at ASC,
    t.id ASC;
$$;

-- Older messages strictly before (p_sent_at, p_id), chronological within the page.
CREATE OR REPLACE FUNCTION public.messages_older_than (p_squad_id uuid, p_sent_at timestamptz, p_id uuid, p_limit int)
    RETURNS SETOF public.messages
    LANGUAGE sql
    STABLE
    SECURITY INVOKER
    SET search_path = public
    AS $$
    SELECT
        *
    FROM (
        SELECT
            m.*
        FROM
            public.messages m
        WHERE
            m.squad_id = p_squad_id
            AND (m.sent_at, m.id) < (p_sent_at, p_id)
        ORDER BY
            m.sent_at DESC,
            m.id DESC
        LIMIT LEAST(GREATEST(p_limit, 1), 100)) t
ORDER BY
    t.sent_at ASC,
    t.id ASC;
$$;

GRANT EXECUTE ON FUNCTION public.messages_latest_window (uuid, int) TO authenticated;

GRANT EXECUTE ON FUNCTION public.messages_older_than (uuid, timestamptz, uuid, int) TO authenticated;

-- Block new messages into archived squads
DROP POLICY IF EXISTS "Messages_insert_squad" ON public.messages;

CREATE POLICY "Messages_insert_squad" ON public.messages
    FOR INSERT
        WITH CHECK (EXISTS (
            SELECT
                1
            FROM
                public.squad_members m
            WHERE
                m.squad_id = messages.squad_id
                AND m.user_id = auth.uid ())
        AND sender_id = auth.uid ()
        AND EXISTS (
            SELECT
                1
            FROM
                public.squads s
            WHERE
                s.id = messages.squad_id
                AND s.archived_at IS NULL));

-- Moderators: read squads and membership for triage (roster is provisioned via SQL / service role)
DROP POLICY IF EXISTS "Squads_select_moderator" ON public.squads;

CREATE POLICY "Squads_select_moderator" ON public.squads
    FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                public.moderators mo
            WHERE
                mo.user_id = auth.uid ()));

DROP POLICY IF EXISTS "Squad_members_select_moderator" ON public.squad_members;

CREATE POLICY "Squad_members_select_moderator" ON public.squad_members
    FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                public.moderators mo
            WHERE
                mo.user_id = auth.uid ()));

DROP POLICY IF EXISTS "Messages_select_moderator" ON public.messages;

CREATE POLICY "Messages_select_moderator" ON public.messages
    FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                public.moderators mo
            WHERE
                mo.user_id = auth.uid ()));
