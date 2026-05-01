-- First-class participant report queue.
--
-- This closes the MVP gap where in-room report actions produced only local
-- toasts. Reports are intentionally structured and low-PII: the participant
-- can pick a report type / reason and add a short context note, while the
-- moderator queue receives durable rows with squad and actor references.

CREATE TABLE public.participant_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    reporter_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    squad_id UUID NOT NULL REFERENCES public.squads (id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    target_message_id UUID REFERENCES public.messages (id) ON DELETE SET NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('room', 'participant', 'message')),
    reason_code TEXT NOT NULL CHECK (
        reason_code IN (
            'harassment',
            'threat',
            'doxxing',
            'spam',
            'facilitator_help',
            'other'
        )
    ),
    context_note TEXT CHECK (context_note IS NULL OR char_length(context_note) <= 1200),
    status TEXT NOT NULL DEFAULT 'open' CHECK (
        status IN ('open', 'reviewing', 'resolved', 'dismissed')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    moderator_note TEXT CHECK (moderator_note IS NULL OR char_length(moderator_note) <= 1200),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT participant_reports_target_not_self CHECK (
        target_user_id IS NULL OR target_user_id <> reporter_user_id
    )
);

COMMENT ON TABLE public.participant_reports IS
'Participant-submitted room, participant, and message reports. Reporters can create and read their own rows; moderators can triage all rows.';

CREATE INDEX participant_reports_squad_created_idx
    ON public.participant_reports (squad_id, created_at DESC);

CREATE INDEX participant_reports_open_created_idx
    ON public.participant_reports (created_at DESC)
    WHERE status IN ('open', 'reviewing');

CREATE INDEX participant_reports_reporter_created_idx
    ON public.participant_reports (reporter_user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.participant_reports_prevent_evidence_rewrite ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.id <> OLD.id
        OR NEW.reporter_user_id <> OLD.reporter_user_id
        OR NEW.squad_id <> OLD.squad_id
        OR NEW.target_user_id IS DISTINCT FROM OLD.target_user_id
        OR NEW.target_message_id IS DISTINCT FROM OLD.target_message_id
        OR NEW.report_type <> OLD.report_type
        OR NEW.reason_code <> OLD.reason_code
        OR NEW.context_note IS DISTINCT FROM OLD.context_note
        OR NEW.created_at <> OLD.created_at
        OR NEW.metadata IS DISTINCT FROM OLD.metadata THEN
        RAISE EXCEPTION 'participant report evidence fields are immutable';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.participant_reports_prevent_evidence_rewrite () FROM PUBLIC;

CREATE TRIGGER participant_reports_prevent_evidence_rewrite
    BEFORE UPDATE ON public.participant_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.participant_reports_prevent_evidence_rewrite ();

ALTER TABLE public.participant_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participant_reports_insert_member" ON public.participant_reports
    FOR INSERT TO authenticated
    WITH CHECK (
        reporter_user_id = auth.uid ()
        AND public.auth_user_is_squad_member (squad_id)
        AND (
            target_user_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.squad_members sm
                WHERE sm.squad_id = participant_reports.squad_id
                    AND sm.user_id = participant_reports.target_user_id
            )
        )
        AND (
            target_message_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.messages msg
                WHERE msg.id = participant_reports.target_message_id
                    AND msg.squad_id = participant_reports.squad_id
            )
        )
        AND status = 'open'
        AND reviewed_at IS NULL
        AND reviewed_by IS NULL
        AND moderator_note IS NULL
    );

CREATE POLICY "Participant_reports_select_own" ON public.participant_reports
    FOR SELECT TO authenticated
    USING (reporter_user_id = auth.uid ());

CREATE POLICY "Participant_reports_select_moderator" ON public.participant_reports
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
    );

CREATE POLICY "Participant_reports_update_moderator" ON public.participant_reports
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
        AND (
            reviewed_by IS NULL
            OR reviewed_by = auth.uid ()
        )
    );

GRANT SELECT, INSERT, UPDATE ON public.participant_reports TO authenticated;

GRANT ALL ON public.participant_reports TO service_role;
