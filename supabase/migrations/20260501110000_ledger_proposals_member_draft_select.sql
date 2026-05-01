-- Allow the in-room consensus workflow to read the draft rows it creates.
--
-- The previous member-draft migration opened INSERT on squad-scoped draft
-- proposals, but `ledger_proposals` still only allowed SELECT for published
-- rows. Supabase/PostgREST requires SELECT visibility for `insert().select()`
-- and the session panel must read the active draft before members can vote.

DROP POLICY IF EXISTS "ledger_proposals_select_draft_squad_or_moderator" ON public.ledger_proposals;

CREATE POLICY "ledger_proposals_select_draft_squad_or_moderator" ON public.ledger_proposals FOR
SELECT TO authenticated
    USING (
        status = 'draft'
        AND squad_id IS NOT NULL
        AND (
            public.auth_user_is_squad_member (squad_id)
            OR EXISTS (
                SELECT
                    1
                FROM
                    public.moderators m
                WHERE
                    m.user_id = auth.uid ()
            )
        )
    );
