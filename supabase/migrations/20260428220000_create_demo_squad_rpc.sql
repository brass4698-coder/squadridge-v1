-- Phase 0.3 (audit remediation): atomic create_demo_squad RPC.
--
-- Replaces the previous two-INSERT client flow (`src/lib/squad.ts` -> squads + squad_members),
-- which left orphaned squads behind whenever the second insert failed (RLS, network, FK).
-- This SECURITY DEFINER function executes both inserts in a single transaction; any failure
-- rolls both back. message_encryption_key is intentionally omitted so the BEFORE INSERT
-- trigger (squads_set_default_message_encryption_key, migration 20260417150000) populates it
-- with pgcrypto.gen_random_bytes(32) — keeping key custody server-side (Phase 0.2).

CREATE OR REPLACE FUNCTION public.create_demo_squad ()
    RETURNS uuid
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    new_squad_id uuid;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'authentication required'
            USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.squads (topic, status, expires_at)
        VALUES (
            'Demo dialogue',
            'active',
            timezone('utc'::text, now()) + interval '1 day'
        )
    RETURNING id INTO new_squad_id;

    INSERT INTO public.squad_members (squad_id, user_id)
        VALUES (new_squad_id, uid);

    RETURN new_squad_id;
END;
$$;

COMMENT ON FUNCTION public.create_demo_squad () IS
    'Atomic create-demo-squad: inserts a squad row (server-generated message_encryption_key) and the caller''s membership row in a single transaction. Replaces the previous client-side two-INSERT flow.';

REVOKE ALL ON FUNCTION public.create_demo_squad () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_demo_squad () TO authenticated;
