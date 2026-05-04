-- Harden ledger proposal publishing/vote RLS.
--
-- Publishing a proposal makes it globally readable via
-- ledger_proposals_select_published, so authenticated clients must not be able
-- to perform that transition with a raw UPDATE. The publish-ledger-proposal Edge
-- Function uses the service-role key and remains the only path that can promote
-- a draft after validating vote thresholds.

DROP POLICY IF EXISTS "ledger_proposals_moderator_update" ON public.ledger_proposals;

CREATE POLICY "ledger_proposals_moderator_update" ON public.ledger_proposals FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ()
        )
    )
    WITH CHECK (
        status <> 'published'
        AND EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Ledger_votes_update_self_draft" ON public.ledger_proposal_votes;

CREATE POLICY "Ledger_votes_update_self_draft" ON public.ledger_proposal_votes FOR UPDATE TO authenticated
    USING (
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
    )
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
