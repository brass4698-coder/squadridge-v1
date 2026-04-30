-- Ledger proposal voting: squad members vote on draft proposals; moderators (or
-- a future facilitator role) decide when to publish. The publish transition
-- itself remains gated by the `publish-ledger-proposal` Edge Function so the
-- threshold check is enforced server-side with a service-role connection.
--
-- This migration:
--   1. Creates `public.ledger_proposal_votes` with member-scoped RLS.
--   2. Creates a `ledger_proposal_vote_summary` view for UI tallies (security
--      invoker — readers only see rows for proposals they have access to).
--   3. Extends the existing INSERT policy on `public.ledger_proposals` so a
--      squad member can draft a proposal scoped to their own squad. Moderators
--      retain INSERT and UPDATE; service role still bypasses RLS for the
--      Edge-mediated publish flow.

CREATE TABLE public.ledger_proposal_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    proposal_id UUID NOT NULL REFERENCES public.ledger_proposals (id) ON DELETE CASCADE,
    squad_id UUID NOT NULL REFERENCES public.squads (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    vote TEXT NOT NULL,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT ledger_proposal_votes_vote_check CHECK (
        vote IN ('approve', 'reject', 'abstain')
    ),
    CONSTRAINT ledger_proposal_votes_unique_user UNIQUE (proposal_id, user_id)
);

COMMENT ON TABLE public.ledger_proposal_votes IS
'Per-member approve/reject/abstain ballots on a draft ledger proposal. Threshold logic lives in publish-ledger-proposal Edge Function.';

CREATE INDEX ledger_proposal_votes_proposal_idx ON public.ledger_proposal_votes (proposal_id);

CREATE INDEX ledger_proposal_votes_squad_idx ON public.ledger_proposal_votes (squad_id);

ALTER TABLE public.ledger_proposal_votes ENABLE ROW LEVEL SECURITY;

-- Squad members can read their squad's votes; moderators read all.
CREATE POLICY "Ledger_votes_select_squad_or_moderator" ON public.ledger_proposal_votes FOR
SELECT TO authenticated
    USING (
        public.auth_user_is_squad_member (squad_id)
        OR EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ()
        )
    );

-- A user can insert exactly one vote for themselves on a proposal scoped to a
-- squad they belong to. Server-side `UNIQUE(proposal_id, user_id)` enforces the
-- one-vote-per-user invariant; the WITH CHECK below keeps cross-squad ballots out.
CREATE POLICY "Ledger_votes_insert_self_member" ON public.ledger_proposal_votes FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid ()
        AND public.auth_user_is_squad_member (squad_id)
        AND EXISTS (
            SELECT
                1
            FROM
                public.ledger_proposals p
            WHERE
                p.id = proposal_id
                AND p.squad_id = ledger_proposal_votes.squad_id
                AND p.status = 'draft'
        )
    );

-- A user can change their own vote while the proposal is still a draft.
CREATE POLICY "Ledger_votes_update_self_draft" ON public.ledger_proposal_votes FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid ()
        AND EXISTS (
            SELECT
                1
            FROM
                public.ledger_proposals p
            WHERE
                p.id = proposal_id
                AND p.status = 'draft'
        )
    )
    WITH CHECK (
        user_id = auth.uid ()
        AND public.auth_user_is_squad_member (squad_id)
    );

GRANT SELECT, INSERT, UPDATE ON TABLE public.ledger_proposal_votes TO authenticated;

GRANT ALL ON TABLE public.ledger_proposal_votes TO service_role;

-- Vote summary view (security invoker — readers only see proposals their RLS allows).
CREATE OR REPLACE VIEW public.ledger_proposal_vote_summary
WITH (security_invoker = TRUE) AS
SELECT
    p.id AS proposal_id,
    p.squad_id,
    p.status,
    COALESCE(v.approve_count, 0) AS approve_count,
    COALESCE(v.reject_count, 0) AS reject_count,
    COALESCE(v.abstain_count, 0) AS abstain_count,
    COALESCE(m.total_eligible, 0) AS total_eligible
FROM
    public.ledger_proposals p
    LEFT JOIN (
        SELECT
            proposal_id,
            count(*) FILTER (WHERE vote = 'approve') AS approve_count,
            count(*) FILTER (WHERE vote = 'reject') AS reject_count,
            count(*) FILTER (WHERE vote = 'abstain') AS abstain_count
        FROM
            public.ledger_proposal_votes
        GROUP BY
            proposal_id
    ) v ON v.proposal_id = p.id
    LEFT JOIN (
        SELECT
            squad_id,
            count(*) AS total_eligible
        FROM
            public.squad_members
        GROUP BY
            squad_id
    ) m ON m.squad_id = p.squad_id;

COMMENT ON VIEW public.ledger_proposal_vote_summary IS
'Per-proposal vote tallies. security_invoker so RLS on underlying tables decides visibility.';

GRANT SELECT ON public.ledger_proposal_vote_summary TO authenticated;

-- Extend ledger_proposals insert policy: a squad member may draft a proposal
-- whose `squad_id` is their own squad and whose `status` is 'draft'. The
-- existing moderator-insert policy is preserved as a parallel ANY branch.
DROP POLICY IF EXISTS "ledger_proposals_member_draft_insert" ON public.ledger_proposals;

CREATE POLICY "ledger_proposals_member_draft_insert" ON public.ledger_proposals FOR INSERT TO authenticated
    WITH CHECK (
        squad_id IS NOT NULL
        AND status = 'draft'
        AND public.auth_user_is_squad_member (squad_id)
    );
