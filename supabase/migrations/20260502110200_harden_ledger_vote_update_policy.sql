-- Harden ledger vote updates so a member cannot rebind their own ballot to a
-- proposal in another squad while leaving the row's squad_id authorized.

DROP POLICY IF EXISTS "Ledger_votes_update_self_draft" ON public.ledger_proposal_votes;

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
