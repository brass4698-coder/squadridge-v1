-- Phase 2.4 (audit remediation): out-of-band crisis-alert primitive.
--
-- A crisis alert is a participant-initiated, structured signal that asks a
-- trained facilitator to intervene immediately. It deliberately bypasses the
-- normal message stream (and its redaction pipeline) so the alert reaches
-- on-call ops even if chat is paused, archived, or rate-limited.
--
-- The row is intentionally minimal:
--   - actor_user_id  : who raised the alert (squad member only)
--   - squad_id       : which room
--   - reason_code    : a small, well-known set (no free text — keeps logs PII-free)
--   - created_at     : when
--
-- Free-form context is rejected at the Edge layer; future iterations may add a
-- separate, encrypted-at-rest "facilitator_notes" column gated by a SECURITY
-- DEFINER RPC.

CREATE TABLE IF NOT EXISTS public.crisis_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id   UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    squad_id        UUID NOT NULL REFERENCES public.squads (id) ON DELETE CASCADE,
    reason_code     TEXT NOT NULL CHECK (
        reason_code IN ('immediate_danger', 'request_pause', 'request_facilitator')
    ),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS crisis_alerts_squad_recent_idx
    ON public.crisis_alerts (squad_id, created_at DESC);
CREATE INDEX IF NOT EXISTS crisis_alerts_unacked_idx
    ON public.crisis_alerts (created_at DESC)
    WHERE acknowledged_at IS NULL;

COMMENT ON TABLE public.crisis_alerts IS
    'Out-of-band participant-initiated alerts for facilitator intervention. Rows must be inserted via the crisis-alert Edge Function (service_role); RLS denies direct client INSERTs.';

ALTER TABLE public.crisis_alerts ENABLE ROW LEVEL SECURITY;

-- Direct INSERTs are forbidden — the Edge function uses service_role to write.
CREATE POLICY "Crisis_alerts_insert_edge_only" ON public.crisis_alerts
    FOR INSERT TO authenticated
    WITH CHECK (FALSE);

COMMENT ON POLICY "Crisis_alerts_insert_edge_only" ON public.crisis_alerts IS
    'Direct client inserts disabled; use the crisis-alert Edge Function (service_role bypass).';

-- The author can read back their own alerts for confirmation UI.
CREATE POLICY "Crisis_alerts_select_own" ON public.crisis_alerts
    FOR SELECT TO authenticated
    USING (actor_user_id = auth.uid ());

-- Moderators see every alert.
CREATE POLICY "Crisis_alerts_select_moderator" ON public.crisis_alerts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
    );

-- Acknowledgement is moderator-only and only flips the ack columns.
CREATE POLICY "Crisis_alerts_ack_moderator" ON public.crisis_alerts
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
    )
    WITH CHECK (
        acknowledged_by = auth.uid ()
    );
