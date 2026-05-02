-- Track A (key rotation): seed epoch 1 for every new squad.
--
-- The 20260417150000 BEFORE INSERT trigger fills squads.message_encryption_key
-- with a fresh AES key when missing. This trigger runs AFTER INSERT and:
--   1. inserts a matching epoch_number=1 row into squad_key_epochs,
--   2. sets squads.current_epoch_id to it.
--
-- Without this, squads created post-migration (matchmaking, demo seed, ledger
-- proposals) would land with current_epoch_id NULL and every message would
-- carry NULL key_epoch_id (legacy fallback). Functionally that still works
-- via the squads.message_encryption_key mirror, but losing the epoch trail
-- defeats the rotation audit story.

CREATE OR REPLACE FUNCTION public.squads_seed_epoch_one ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    v_epoch_id uuid;
BEGIN
    IF NEW.message_encryption_key IS NULL OR btrim(NEW.message_encryption_key) = '' THEN
        RETURN NEW;
    END IF;
    IF NEW.current_epoch_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    INSERT INTO public.squad_key_epochs (squad_id, epoch_number, encryption_key, created_at)
        VALUES (NEW.id, 1, NEW.message_encryption_key, NEW.created_at)
    ON CONFLICT (squad_id, epoch_number)
        DO NOTHING
    RETURNING
        id INTO v_epoch_id;
    -- ON CONFLICT DO NOTHING returns no row when the conflict path runs;
    -- pull the existing id in that case so the squads.current_epoch_id is
    -- always set after this trigger.
    IF v_epoch_id IS NULL THEN
        SELECT
            id INTO v_epoch_id
        FROM
            public.squad_key_epochs
        WHERE
            squad_id = NEW.id
            AND epoch_number = 1;
    END IF;
    UPDATE
        public.squads
    SET
        current_epoch_id = v_epoch_id
    WHERE
        id = NEW.id
        AND current_epoch_id IS NULL;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.squads_seed_epoch_one () FROM PUBLIC;

DROP TRIGGER IF EXISTS squads_seed_epoch_one ON public.squads;

CREATE TRIGGER squads_seed_epoch_one
    AFTER INSERT ON public.squads
    FOR EACH ROW
    EXECUTE FUNCTION public.squads_seed_epoch_one ();

COMMENT ON FUNCTION public.squads_seed_epoch_one () IS
'AFTER INSERT trigger on squads: seeds epoch_number=1 in squad_key_epochs and sets squads.current_epoch_id. Companion to the 20260417150000 BEFORE INSERT default-key trigger.';
