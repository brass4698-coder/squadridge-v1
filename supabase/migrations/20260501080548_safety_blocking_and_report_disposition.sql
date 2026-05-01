-- Participant blocking + explicit moderator disposition workflow.
--
-- This migration extends the report queue from durable intake to operational
-- triage, and adds participant-controlled blocking for sensitive rooms.

CREATE TABLE public.participant_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    blocker_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    squad_id UUID NOT NULL REFERENCES public.squads (id) ON DELETE CASCADE,
    reason_code TEXT NOT NULL DEFAULT 'self_protection' CHECK (
        reason_code IN ('self_protection', 'harassment', 'threat', 'doxxing', 'spam', 'other')
    ),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT participant_blocks_not_self CHECK (blocker_user_id <> blocked_user_id),
    UNIQUE (blocker_user_id, blocked_user_id, squad_id)
);

COMMENT ON TABLE public.participant_blocks IS
'Participant-controlled blocklist scoped to a squad. Used by clients to suppress blocked participant content and by moderators to see repeat-abuse patterns via service role / SQL.';

CREATE INDEX participant_blocks_blocker_active_idx
    ON public.participant_blocks (blocker_user_id, squad_id, active);

CREATE INDEX participant_blocks_blocked_active_idx
    ON public.participant_blocks (blocked_user_id, squad_id, active);

CREATE OR REPLACE FUNCTION public.participant_blocks_touch ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.participant_blocks_touch () FROM PUBLIC;

CREATE TRIGGER participant_blocks_touch_updated_at
    BEFORE UPDATE ON public.participant_blocks
    FOR EACH ROW
    EXECUTE FUNCTION public.participant_blocks_touch ();

ALTER TABLE public.participant_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participant_blocks_select_own" ON public.participant_blocks
    FOR SELECT TO authenticated
    USING (blocker_user_id = auth.uid ());

CREATE POLICY "Participant_blocks_insert_self_member" ON public.participant_blocks
    FOR INSERT TO authenticated
    WITH CHECK (
        blocker_user_id = auth.uid ()
        AND blocker_user_id <> blocked_user_id
        AND public.auth_user_is_squad_member (squad_id)
        AND EXISTS (
            SELECT 1
            FROM public.squad_members sm
            WHERE sm.squad_id = participant_blocks.squad_id
                AND sm.user_id = participant_blocks.blocked_user_id
        )
    );

CREATE POLICY "Participant_blocks_update_self" ON public.participant_blocks
    FOR UPDATE TO authenticated
    USING (blocker_user_id = auth.uid ())
    WITH CHECK (
        blocker_user_id = auth.uid ()
        AND blocker_user_id <> blocked_user_id
        AND public.auth_user_is_squad_member (squad_id)
    );

GRANT SELECT, INSERT, UPDATE ON public.participant_blocks TO authenticated;
GRANT ALL ON public.participant_blocks TO service_role;

CREATE OR REPLACE FUNCTION public.moderator_update_participant_report (
    p_report_id uuid,
    p_status text,
    p_moderator_note text DEFAULT NULL
)
    RETURNS public.participant_reports
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    v_uid uuid := auth.uid ();
    v_note text := NULLIF(left(trim(coalesce(p_moderator_note, '')), 1200), '');
    v_row public.participant_reports;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.moderators m WHERE m.user_id = v_uid) THEN
        RAISE EXCEPTION 'Moderator required' USING ERRCODE = '42501';
    END IF;

    IF p_status NOT IN ('open', 'reviewing', 'resolved', 'dismissed') THEN
        RAISE EXCEPTION 'Invalid report status' USING ERRCODE = '22023';
    END IF;

    UPDATE public.participant_reports
    SET status = p_status,
        reviewed_at = CASE
            WHEN p_status IN ('resolved', 'dismissed') THEN timezone('utc'::text, now())
            ELSE reviewed_at
        END,
        reviewed_by = CASE
            WHEN p_status IN ('reviewing', 'resolved', 'dismissed') THEN v_uid
            ELSE reviewed_by
        END,
        moderator_note = coalesce(v_note, moderator_note)
    WHERE id = p_report_id
    RETURNING * INTO v_row;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Report not found' USING ERRCODE = 'P0002';
    END IF;

    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
    VALUES (
        v_uid,
        'participant_report_' || p_status,
        'participant_report',
        p_report_id,
        jsonb_build_object('status', p_status, 'has_note', v_note IS NOT NULL)
    );

    RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.moderator_update_participant_report (uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.moderator_update_participant_report (uuid, text, text) TO authenticated;
