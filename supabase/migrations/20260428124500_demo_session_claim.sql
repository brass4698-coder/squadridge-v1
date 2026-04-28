-- Optional anonymous → verified cohort hand-off: anon user obtains a claim code; verified session finalizes migration.

CREATE TABLE IF NOT EXISTS public.demo_session_claims (
    claim_code TEXT PRIMARY KEY,
    anon_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    consumed_at TIMESTAMPTZ,
    verified_user_id UUID REFERENCES auth.users (id)
);

COMMENT ON TABLE public.demo_session_claims IS
'Eph token linking anonymous demo user to a post-verify account; finalized via finalize_demo_session_claim.';

ALTER TABLE public.demo_session_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_claims_none_client" ON public.demo_session_claims FOR ALL TO authenticated
    USING (FALSE)
    WITH CHECK (FALSE);

COMMENT ON POLICY "demo_claims_none_client" ON public.demo_session_claims IS
'Secrets managed only via SECURITY DEFINER functions; no direct client access.';

CREATE OR REPLACE FUNCTION public.create_demo_session_claim ()
    RETURNS TEXT
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    code text := md5(gen_random_uuid()::text || clock_timestamp()::text);
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'authentication required';
    END IF;
    INSERT INTO public.demo_session_claims (claim_code, anon_user_id)
        VALUES (code, uid);
    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (uid, 'demo_claim_created', 'user', uid, jsonb_build_object('claim_code_prefix', left(code, 8)));
    RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_demo_session_claim (p_claim_code TEXT)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    rec public.demo_session_claims%ROWTYPE;
    n int := 0;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'authentication required';
    END IF;
    IF p_claim_code IS NULL OR length(trim(p_claim_code)) < 8 THEN
        RAISE EXCEPTION 'invalid claim';
    END IF;
    SELECT
        * INTO rec
    FROM
        public.demo_session_claims
    WHERE
        claim_code = trim(p_claim_code)
        AND consumed_at IS NULL;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'claim not found or already used';
    END IF;
    IF rec.anon_user_id = uid THEN
        RAISE EXCEPTION 'cannot finalize your own anonymous session — sign in as verified first';
    END IF;
    UPDATE
        public.squad_members AS sm
    SET
        user_id = uid
    WHERE
        sm.user_id = rec.anon_user_id
        AND NOT EXISTS (
            SELECT
                1
            FROM
                public.squad_members AS existing
            WHERE
                existing.squad_id = sm.squad_id
                AND existing.user_id = uid);
    GET DIAGNOSTICS n = ROW_COUNT;
    UPDATE
        public.demo_session_claims
    SET
        consumed_at = timezone('utc'::text, now()),
        verified_user_id = uid
    WHERE
        claim_code = rec.claim_code;
    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (uid, 'demo_claim_finalized', 'user', uid, jsonb_build_object(
            'from_anon_user_id',
            rec.anon_user_id,
            'squads_updated',
            n));
    RETURN jsonb_build_object('ok', TRUE, 'migrated_memberships', n);
END;
$$;

REVOKE ALL ON FUNCTION public.create_demo_session_claim () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_demo_session_claim () TO authenticated;

REVOKE ALL ON FUNCTION public.finalize_demo_session_claim (text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.finalize_demo_session_claim (text) TO authenticated;

COMMENT ON FUNCTION public.create_demo_session_claim IS 'Authenticated user (typically anonymous/demo) obtains a transfer code for squad membership handoff.';
COMMENT ON FUNCTION public.finalize_demo_session_claim IS 'Verified user merges eligible squad memberships from anon id linked to claim.';
