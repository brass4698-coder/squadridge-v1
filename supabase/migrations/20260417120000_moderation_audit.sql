-- Moderator roster + immutable audit trail for human moderation actions (distinct from AI `interventions`).
-- Moderators are provisioned via SQL/dashboard (service role); clients only append audit rows when listed in `moderators`.

CREATE TABLE public.moderators (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.moderators IS
'Users allowed to write to moderation_audit_log. Rows are inserted by admins via SQL or service role; not self-service.';

CREATE TABLE public.moderation_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    actor_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT DEFAULT auth.uid (),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT moderation_audit_actor_matches_session CHECK (actor_user_id = auth.uid ())
);

COMMENT ON TABLE public.moderation_audit_log IS
'Append-only audit of moderation actions. actor_user_id must match the current session (no spoofing via API).';

CREATE INDEX moderation_audit_log_created_at_idx ON public.moderation_audit_log (created_at DESC);

CREATE INDEX moderation_audit_log_target_idx ON public.moderation_audit_log (target_type, target_id)
WHERE
    target_type IS NOT NULL
    AND target_id IS NOT NULL;

ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.moderation_audit_log ENABLE ROW LEVEL SECURITY;

-- Moderators can see their own roster row (e.g. feature gating in a future admin UI).
CREATE POLICY "Moderators_select_self" ON public.moderators FOR
SELECT USING (user_id = auth.uid ());

CREATE POLICY "Moderators_insert_audit" ON public.moderation_audit_log FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ())
            AND actor_user_id = auth.uid ());

CREATE POLICY "Moderators_select_audit" ON public.moderation_audit_log FOR
SELECT TO authenticated USING (
    EXISTS (
        SELECT
            1
        FROM
            public.moderators m
        WHERE
            m.user_id = auth.uid ()));
