-- Incident Dialogue Ledger Room — structured, trauma-informed dialogue for
-- high-sensitivity, document-heavy situations. Append-only migration.
--
-- NOTE (replay fix): RLS helper functions that reference incident_* tables are
-- defined AFTER those tables below. Postgres validates SQL function bodies at
-- CREATE time when check_function_bodies is on, so helpers cannot precede tables.

-- ── Contact-info helpers (no table dependencies) ────────────────────────────

-- Reject phone numbers, email addresses, and street-style home addresses in free text.
CREATE OR REPLACE FUNCTION public.incident_text_contains_contact_info(p_text text)
    RETURNS boolean
    LANGUAGE plpgsql
    IMMUTABLE
    AS $$
DECLARE
    t text := coalesce(p_text, '');
    digits text;
BEGIN
    IF btrim(t) = '' THEN
        RETURN FALSE;
    END IF;

    IF t ~* '\m[a-z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+\M' THEN
        RETURN TRUE;
    END IF;

    IF t ~ '\m(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}\M' THEN
        digits := regexp_replace(
            (regexp_match(
                t,
                '\m(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}\M'
            ))[1],
            '\D',
            '',
            'g'
        );
        IF length(digits) BETWEEN 10 AND 15 THEN
            RETURN TRUE;
        END IF;
    END IF;

    IF t ~* '\m\d{1,5}\s+[a-z]+(?:\s+[a-z]+){0,2}\s+(?:street|st\.|road|rd\.|avenue|ave\.|boulevard|blvd\.|drive|dr\.|lane|ln\.|court|ct\.)\M' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.incident_reject_contact_info()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF public.incident_text_contains_contact_info(NEW.body) THEN
        RAISE EXCEPTION 'contact_info_not_allowed'
            USING HINT = 'Remove phone numbers, email addresses, and street addresses before posting.';
    END IF;
    RETURN NEW;
END;
$$;

-- ── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.incident_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'paused', 'archived', 'closed')
    ),
    severity_tier text NOT NULL DEFAULT 'monitoring' CHECK (
        severity_tier IN ('monitoring', 'escalating', 'critical', 'de-escalating')
    ),
    facilitator_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    closed_at timestamptz
);

CREATE INDEX IF NOT EXISTS incident_rooms_status_idx
    ON public.incident_rooms (status, severity_tier, updated_at DESC);

COMMENT ON TABLE public.incident_rooms IS
    'Structured incident dialogue rooms for high-sensitivity, evidence-tiered facilitator-led dialogue.';

CREATE TABLE IF NOT EXISTS public.incident_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES public.incident_rooms (id) ON DELETE CASCADE,
    lane text NOT NULL CHECK (
        lane IN (
            'verified_evidence',
            'disputed_claims',
            'unverified_leads',
            'community_impact',
            'official_responses'
        )
    ),
    verification_status text NOT NULL DEFAULT 'pending_review' CHECK (
        verification_status IN (
            'pending_review',
            'corroborated',
            'disputed',
            'unverified',
            'retracted'
        )
    ),
    moderation_state text NOT NULL DEFAULT 'pending' CHECK (
        moderation_state IN ('pending', 'approved', 'flagged', 'removed')
    ),
    title text NOT NULL,
    body text NOT NULL,
    source_url text,
    source_type text NOT NULL DEFAULT 'other' CHECK (
        source_type IN ('document', 'statement', 'news', 'social', 'official', 'other')
    ),
    content_warning text,
    author_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    moderator_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
    moderation_note text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS incident_items_room_created_idx
    ON public.incident_items (room_id, created_at DESC);

CREATE INDEX IF NOT EXISTS incident_items_room_lane_idx
    ON public.incident_items (room_id, lane, moderation_state);

CREATE TABLE IF NOT EXISTS public.incident_threads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES public.incident_rooms (id) ON DELETE CASCADE,
    item_id uuid REFERENCES public.incident_items (id) ON DELETE SET NULL,
    topic text NOT NULL,
    status text NOT NULL DEFAULT 'open' CHECK (
        status IN ('open', 'paused', 'resolved')
    ),
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS incident_threads_room_idx
    ON public.incident_threads (room_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.incident_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES public.incident_threads (id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    body text NOT NULL,
    moderation_state text NOT NULL DEFAULT 'pending' CHECK (
        moderation_state IN ('pending', 'approved', 'flagged', 'removed')
    ),
    is_facilitator boolean NOT NULL DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS incident_messages_thread_created_idx
    ON public.incident_messages (thread_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.incident_room_participants (
    room_id uuid NOT NULL REFERENCES public.incident_rooms (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'participant' CHECK (
        role IN ('participant', 'facilitator', 'moderator', 'observer')
    ),
    joined_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS incident_room_participants_user_idx
    ON public.incident_room_participants (user_id, room_id);

-- ── RLS helpers (after tables — required for check_function_bodies) ─────────

CREATE OR REPLACE FUNCTION public.auth_user_is_incident_room_participant(p_room_id uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.incident_room_participants p
        WHERE p.room_id = p_room_id
          AND p.user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.auth_user_is_incident_room_staff(p_room_id uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.incident_room_participants p
        WHERE p.room_id = p_room_id
          AND p.user_id = auth.uid()
          AND p.role IN ('facilitator', 'moderator')
    );
$$;

CREATE OR REPLACE FUNCTION public.auth_user_is_incident_room_moderator(p_room_id uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.incident_room_participants p
        WHERE p.room_id = p_room_id
          AND p.user_id = auth.uid()
          AND p.role = 'moderator'
    );
$$;

CREATE OR REPLACE FUNCTION public.auth_user_is_platform_moderator()
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.moderators m
        WHERE m.user_id = auth.uid()
    );
$$;

-- ── updated_at triggers ─────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_incident_rooms_updated_at ON public.incident_rooms;
CREATE TRIGGER trg_incident_rooms_updated_at
    BEFORE UPDATE ON public.incident_rooms
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS trg_incident_items_updated_at ON public.incident_items;
CREATE TRIGGER trg_incident_items_updated_at
    BEFORE UPDATE ON public.incident_items
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS trg_incident_threads_updated_at ON public.incident_threads;
CREATE TRIGGER trg_incident_threads_updated_at
    BEFORE UPDATE ON public.incident_threads
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_updated_at();

-- ── doxxing prevention triggers ─────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_incident_items_reject_contact_info ON public.incident_items;
CREATE TRIGGER trg_incident_items_reject_contact_info
    BEFORE INSERT OR UPDATE OF body ON public.incident_items
    FOR EACH ROW
    EXECUTE FUNCTION public.incident_reject_contact_info();

DROP TRIGGER IF EXISTS trg_incident_messages_reject_contact_info ON public.incident_messages;
CREATE TRIGGER trg_incident_messages_reject_contact_info
    BEFORE INSERT OR UPDATE OF body ON public.incident_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.incident_reject_contact_info();

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE public.incident_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_room_participants ENABLE ROW LEVEL SECURITY;

-- incident_rooms
DROP POLICY IF EXISTS "incident_rooms_select_participant" ON public.incident_rooms;
CREATE POLICY "incident_rooms_select_participant" ON public.incident_rooms
    FOR SELECT TO authenticated
    USING (public.auth_user_is_incident_room_participant(id));

DROP POLICY IF EXISTS "incident_rooms_insert_moderator" ON public.incident_rooms;
CREATE POLICY "incident_rooms_insert_moderator" ON public.incident_rooms
    FOR INSERT TO authenticated
    WITH CHECK (public.auth_user_is_platform_moderator());

DROP POLICY IF EXISTS "incident_rooms_update_staff" ON public.incident_rooms;
CREATE POLICY "incident_rooms_update_staff" ON public.incident_rooms
    FOR UPDATE TO authenticated
    USING (
        public.auth_user_is_incident_room_staff(id)
        OR facilitator_id = auth.uid()
        OR public.auth_user_is_platform_moderator()
    )
    WITH CHECK (
        public.auth_user_is_incident_room_staff(id)
        OR facilitator_id = auth.uid()
        OR public.auth_user_is_platform_moderator()
    );

-- incident_room_participants
CREATE POLICY "incident_room_participants_select_participant" ON public.incident_room_participants
    FOR SELECT TO authenticated
    USING (public.auth_user_is_incident_room_participant(room_id));

CREATE POLICY "incident_room_participants_insert_staff" ON public.incident_room_participants
    FOR INSERT TO authenticated
    WITH CHECK (
        public.auth_user_is_incident_room_staff(room_id)
        OR public.auth_user_is_platform_moderator()
    );

CREATE POLICY "incident_room_participants_update_staff" ON public.incident_room_participants
    FOR UPDATE TO authenticated
    USING (
        public.auth_user_is_incident_room_staff(room_id)
        OR public.auth_user_is_platform_moderator()
    )
    WITH CHECK (
        public.auth_user_is_incident_room_staff(room_id)
        OR public.auth_user_is_platform_moderator()
    );

-- incident_items
CREATE POLICY "incident_items_select_participant" ON public.incident_items
    FOR SELECT TO authenticated
    USING (
        public.auth_user_is_incident_room_participant(room_id)
        AND moderation_state <> 'removed'
    );

CREATE POLICY "incident_items_select_moderator_removed" ON public.incident_items
    FOR SELECT TO authenticated
    USING (
        public.auth_user_is_incident_room_moderator(room_id)
        OR public.auth_user_is_platform_moderator()
    );

CREATE POLICY "incident_items_insert_staff" ON public.incident_items
    FOR INSERT TO authenticated
    WITH CHECK (
        public.auth_user_is_incident_room_staff(room_id)
        AND author_id = auth.uid()
    );

CREATE POLICY "incident_items_update_staff" ON public.incident_items
    FOR UPDATE TO authenticated
    USING (public.auth_user_is_incident_room_staff(room_id))
    WITH CHECK (public.auth_user_is_incident_room_staff(room_id));

CREATE POLICY "incident_items_moderate_moderator" ON public.incident_items
    FOR UPDATE TO authenticated
    USING (
        public.auth_user_is_incident_room_moderator(room_id)
        OR public.auth_user_is_platform_moderator()
    )
    WITH CHECK (
        public.auth_user_is_incident_room_moderator(room_id)
        OR public.auth_user_is_platform_moderator()
    );

-- incident_threads
CREATE POLICY "incident_threads_select_participant" ON public.incident_threads
    FOR SELECT TO authenticated
    USING (public.auth_user_is_incident_room_participant(room_id));

CREATE POLICY "incident_threads_insert_staff" ON public.incident_threads
    FOR INSERT TO authenticated
    WITH CHECK (public.auth_user_is_incident_room_staff(room_id));

CREATE POLICY "incident_threads_update_staff" ON public.incident_threads
    FOR UPDATE TO authenticated
    USING (public.auth_user_is_incident_room_staff(room_id))
    WITH CHECK (public.auth_user_is_incident_room_staff(room_id));

-- incident_messages
CREATE POLICY "incident_messages_select_participant" ON public.incident_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.incident_threads t
            WHERE t.id = incident_messages.thread_id
              AND public.auth_user_is_incident_room_participant(t.room_id)
        )
        AND moderation_state <> 'removed'
    );

CREATE POLICY "incident_messages_select_moderator_removed" ON public.incident_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.incident_threads t
            WHERE t.id = incident_messages.thread_id
              AND (
                  public.auth_user_is_incident_room_moderator(t.room_id)
                  OR public.auth_user_is_platform_moderator()
              )
        )
    );

CREATE POLICY "incident_messages_insert_staff" ON public.incident_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.incident_threads t
            WHERE t.id = incident_messages.thread_id
              AND public.auth_user_is_incident_room_staff(t.room_id)
        )
        AND author_id = auth.uid()
    );

CREATE POLICY "incident_messages_update_staff" ON public.incident_messages
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.incident_threads t
            WHERE t.id = incident_messages.thread_id
              AND public.auth_user_is_incident_room_staff(t.room_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.incident_threads t
            WHERE t.id = incident_messages.thread_id
              AND public.auth_user_is_incident_room_staff(t.room_id)
        )
    );

CREATE POLICY "incident_messages_moderate_moderator" ON public.incident_messages
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.incident_threads t
            WHERE t.id = incident_messages.thread_id
              AND (
                  public.auth_user_is_incident_room_moderator(t.room_id)
                  OR public.auth_user_is_platform_moderator()
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.incident_threads t
            WHERE t.id = incident_messages.thread_id
              AND (
                  public.auth_user_is_incident_room_moderator(t.room_id)
                  OR public.auth_user_is_platform_moderator()
              )
        )
    );
