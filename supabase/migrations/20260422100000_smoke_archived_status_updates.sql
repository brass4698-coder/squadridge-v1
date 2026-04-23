-- Migration smoke: ensure status = 'archived' updates succeed (squads + ledger_proposals).
-- Fails the migration chain if a future change drops 'archived' from CHECK constraints or blocks updates.
DO $$
DECLARE
    v_squad uuid;
    v_slug text := '_smoke_archived_' || replace(gen_random_uuid()::text, '-', '');
BEGIN
    INSERT INTO public.squads (topic, status, expires_at)
        VALUES ('migration smoke (squads)', 'active', timezone('utc'::text, now()) + interval '1 day')
    RETURNING
        id INTO v_squad;
    UPDATE public.squads
    SET status = 'archived',
        archived_at = timezone('utc'::text, now())
    WHERE
        id = v_squad;
    IF NOT EXISTS (
        SELECT
            1
        FROM
            public.squads
        WHERE
            id = v_squad
            AND status = 'archived'
            AND archived_at IS NOT NULL) THEN
        RAISE EXCEPTION 'squads: UPDATE to status archived failed';
    END IF;
    DELETE FROM public.squads
    WHERE id = v_squad;
    INSERT INTO public.ledger_proposals (slug, title, summary, status)
        VALUES (v_slug, 'smoke', 'smoke', 'draft');
    UPDATE public.ledger_proposals
    SET status = 'archived'
    WHERE
        slug = v_slug;
    IF NOT EXISTS (
        SELECT
            1
        FROM
            public.ledger_proposals
        WHERE
            slug = v_slug
            AND status = 'archived') THEN
        RAISE EXCEPTION 'ledger_proposals: UPDATE to status archived failed';
    END IF;
    DELETE FROM public.ledger_proposals
    WHERE slug = v_slug;
END $$;
