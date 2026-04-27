-- Ledger: optional private outcome details (unresolved, follow-ups, signals) for UI — still published via moderation workflow.
-- Moderators: read ZK/verification triage without broad anon policy changes for end users.

ALTER TABLE public.ledger_proposals
    ADD COLUMN IF NOT EXISTS outcome_extras JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.ledger_proposals.outcome_extras IS
'Optional structured UI fields: e.g. unresolved issues, follow_up list, confidence — not the same as public consensus_items.';

-- Moderator read access for operator verification triage
DROP POLICY IF EXISTS "Zk_select_moderator" ON public.zk_proof_submissions;

CREATE POLICY "Zk_select_moderator" ON public.zk_proof_submissions
    FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ()));

DROP POLICY IF EXISTS "Attrs_select_moderator" ON public.verified_attributes;

CREATE POLICY "Attrs_select_moderator" ON public.verified_attributes
    FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ()));
