-- Phase 1.1 (audit remediation): require a server-issued consent token before
-- finalize_demo_session_claim merges squad memberships from an anonymous user into a
-- verified account. Replaces the previous one-step `RAISE EXCEPTION`-based flow with:
--
--   1. anon user        -> create_demo_session_claim()         (existing; returns code)
--   2. verified user    -> issue_demo_claim_consent(code)      (NEW; returns consent_token)
--   3. UI shows consent modal; on user confirmation:
--   4. verified user    -> finalize_demo_session_claim(code, consent_token)   (NEW signature)
--
-- All error paths return structured `jsonb_build_object('ok', false, 'error_code', ...)`
-- instead of raising, so the client can render localized, user-facing messages and
-- distinguish recoverable cases (e.g. expired token) from terminal ones.
--
-- Token: 32 bytes from pgcrypto, hex-encoded; bound to (claim_code, verified_user_id).
-- Lifetime: 5 minutes from issue. A new call to issue_demo_claim_consent re-rolls the
-- token (idempotent for the same verified user).

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.demo_session_claims
    ADD COLUMN IF NOT EXISTS consent_token TEXT,
    ADD COLUMN IF NOT EXISTS consent_issued_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS consent_user_id UUID REFERENCES auth.users (id);

COMMENT ON COLUMN public.demo_session_claims.consent_token IS
    'Short-lived (5 min) token issued by issue_demo_claim_consent. Required by finalize_demo_session_claim.';
COMMENT ON COLUMN public.demo_session_claims.consent_issued_at IS
    'When consent_token was issued (UTC). NULL until the verified user calls issue_demo_claim_consent.';
COMMENT ON COLUMN public.demo_session_claims.consent_user_id IS
    'Verified auth.users.id that requested consent. Must match auth.uid() at finalize time.';

CREATE OR REPLACE FUNCTION public.issue_demo_claim_consent (p_claim_code TEXT)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    rec public.demo_session_claims%ROWTYPE;
    new_token text;
    issued timestamptz := timezone('utc'::text, now());
BEGIN
    IF uid IS NULL THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'authentication_required');
    END IF;

    IF p_claim_code IS NULL OR length(trim(p_claim_code)) < 8 THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'invalid_claim');
    END IF;

    SELECT
        * INTO rec
    FROM
        public.demo_session_claims
    WHERE
        claim_code = trim(p_claim_code)
        AND consumed_at IS NULL;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'claim_not_found');
    END IF;

    -- Verified user must be a different auth.users row than the anonymous demo user.
    -- Otherwise the migration would be a no-op and risks accidental self-merge.
    IF rec.anon_user_id = uid THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'self_consent_forbidden');
    END IF;

    new_token := encode(extensions.gen_random_bytes (32), 'hex');

    UPDATE public.demo_session_claims
    SET
        consent_token = new_token,
        consent_issued_at = issued,
        consent_user_id = uid
    WHERE
        claim_code = rec.claim_code;

    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (uid, 'demo_claim_consent_issued', 'user', uid, jsonb_build_object(
            'claim_code_prefix', left(rec.claim_code, 8),
            'expires_at', (issued + interval '5 minutes')::text));

    RETURN jsonb_build_object(
        'ok', TRUE,
        'consent_token', new_token,
        'expires_at', (issued + interval '5 minutes')::text);
END;
$$;

COMMENT ON FUNCTION public.issue_demo_claim_consent (text) IS
    'Verified user obtains a short-lived consent token bound to a demo claim code. Required input to finalize_demo_session_claim.';

REVOKE ALL ON FUNCTION public.issue_demo_claim_consent (text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.issue_demo_claim_consent (text) TO authenticated;

-- Replace the previous one-arg finalize with a two-arg, structured-error version.
-- Drop+create rather than overload: a single canonical signature avoids confusion in
-- generated TypeScript types and in the client wrapper.
DROP FUNCTION IF EXISTS public.finalize_demo_session_claim (text);

CREATE OR REPLACE FUNCTION public.finalize_demo_session_claim (
    p_claim_code TEXT,
    p_consent_token TEXT
)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    rec public.demo_session_claims%ROWTYPE;
    consent_age interval;
    n int := 0;
BEGIN
    IF uid IS NULL THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'authentication_required');
    END IF;

    IF p_claim_code IS NULL OR length(trim(p_claim_code)) < 8 THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'invalid_claim');
    END IF;

    IF p_consent_token IS NULL OR length(trim(p_consent_token)) < 16 THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'consent_token_required');
    END IF;

    SELECT
        * INTO rec
    FROM
        public.demo_session_claims
    WHERE
        claim_code = trim(p_claim_code)
        AND consumed_at IS NULL;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'claim_not_found');
    END IF;

    IF rec.anon_user_id = uid THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'self_finalize_forbidden');
    END IF;

    -- Consent must have been issued, by the same verified user finalizing now,
    -- with the same token, and within the 5-minute lifetime.
    IF rec.consent_token IS NULL
        OR rec.consent_user_id IS NULL
        OR rec.consent_user_id <> uid THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'consent_token_required');
    END IF;

    IF rec.consent_token <> trim(p_consent_token) THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'consent_token_mismatch');
    END IF;

    consent_age := timezone('utc'::text, now()) - rec.consent_issued_at;
    IF consent_age > interval '5 minutes' THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'consent_token_expired');
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
            'from_anon_user_id', rec.anon_user_id,
            'squads_updated', n));

    RETURN jsonb_build_object(
        'ok', TRUE,
        'migrated_memberships', n);
END;
$$;

COMMENT ON FUNCTION public.finalize_demo_session_claim (text, text) IS
    'Verified user merges eligible squad memberships from anonymous demo user, gated by issue_demo_claim_consent token. Returns structured jsonb (ok + error_code on failure).';

REVOKE ALL ON FUNCTION public.finalize_demo_session_claim (text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.finalize_demo_session_claim (text, text) TO authenticated;
