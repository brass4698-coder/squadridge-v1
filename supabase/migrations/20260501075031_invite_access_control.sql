-- Real invite/access-control primitives for pilot entry.
--
-- Codes are stored as SHA-256 hashes, not plaintext. Participants redeem a
-- code once they have an authenticated Supabase session; matchmaking enqueue
-- refuses users who do not have an active redemption.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    code_hash TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    cohort_key TEXT,
    max_redemptions INTEGER NOT NULL DEFAULT 1 CHECK (max_redemptions > 0),
    redeemed_count INTEGER NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0),
    expires_at TIMESTAMPTZ,
    disabled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT invite_codes_redeemed_lte_max CHECK (redeemed_count <= max_redemptions)
);

COMMENT ON TABLE public.invite_codes IS
'Pilot invite codes stored as SHA-256 hashes. Provision via SQL/service role; clients redeem through redeem_invite_code().';

CREATE TABLE public.invite_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    invite_id UUID NOT NULL REFERENCES public.invite_codes (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE (invite_id, user_id)
);

COMMENT ON TABLE public.invite_redemptions IS
'Audit trail of invite-code redemptions. Users can see their own redemption; moderators can inspect all.';

CREATE INDEX invite_codes_active_idx
    ON public.invite_codes (expires_at, disabled_at)
    WHERE disabled_at IS NULL;

CREATE INDEX invite_redemptions_user_recent_idx
    ON public.invite_redemptions (user_id, redeemed_at DESC);

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_redemptions ENABLE ROW LEVEL SECURITY;

-- Do not expose invite-code rows directly. Provision with service_role / SQL.
CREATE POLICY "Invite_codes_no_client_access" ON public.invite_codes
    FOR ALL TO authenticated, anon
    USING (FALSE)
    WITH CHECK (FALSE);

CREATE POLICY "Invite_redemptions_select_own" ON public.invite_redemptions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid ());

CREATE POLICY "Invite_redemptions_select_moderator" ON public.invite_redemptions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
    );

CREATE POLICY "Invite_redemptions_no_client_mutation" ON public.invite_redemptions
    FOR INSERT TO authenticated
    WITH CHECK (FALSE);

CREATE OR REPLACE FUNCTION private.invite_code_hash (p_code text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE
    SET search_path = public, extensions
    AS $$
    SELECT encode(extensions.digest(lower(trim(coalesce(p_code, ''))), 'sha256'), 'hex');
$$;

REVOKE ALL ON FUNCTION private.invite_code_hash (text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION private.auth_user_has_active_invite ()
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.invite_redemptions r
        JOIN public.invite_codes c ON c.id = r.invite_id
        WHERE r.user_id = auth.uid ()
            AND c.disabled_at IS NULL
            AND (c.expires_at IS NULL OR c.expires_at > timezone('utc'::text, now()))
    );
$$;

REVOKE ALL ON FUNCTION private.auth_user_has_active_invite () FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.get_my_active_invite ()
    RETURNS jsonb
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT coalesce(
        (
            SELECT jsonb_build_object(
                'ok', TRUE,
                'invite_id', c.id,
                'label', c.label,
                'cohort_key', c.cohort_key,
                'redeemed_at', r.redeemed_at,
                'expires_at', c.expires_at
            )
            FROM public.invite_redemptions r
            JOIN public.invite_codes c ON c.id = r.invite_id
            WHERE r.user_id = auth.uid ()
                AND c.disabled_at IS NULL
                AND (c.expires_at IS NULL OR c.expires_at > timezone('utc'::text, now()))
            ORDER BY r.redeemed_at DESC
            LIMIT 1
        ),
        jsonb_build_object('ok', FALSE, 'error_code', 'invite_required')
    );
$$;

CREATE OR REPLACE FUNCTION public.redeem_invite_code (p_code text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_uid uuid := auth.uid ();
    v_code text := lower(trim(coalesce(p_code, '')));
    v_invite public.invite_codes%ROWTYPE;
    v_inserted_count int := 0;
BEGIN
    IF v_uid IS NULL THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'authentication_required');
    END IF;

    IF char_length(v_code) < 6 OR char_length(v_code) > 128 THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'invalid_code');
    END IF;

    SELECT *
    INTO v_invite
    FROM public.invite_codes
    WHERE code_hash = private.invite_code_hash(v_code)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'invalid_code');
    END IF;

    IF v_invite.disabled_at IS NOT NULL THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'invite_disabled');
    END IF;

    IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at <= timezone('utc'::text, now()) THEN
        RETURN jsonb_build_object('ok', FALSE, 'error_code', 'invite_expired');
    END IF;

    INSERT INTO public.invite_redemptions (invite_id, user_id)
    VALUES (v_invite.id, v_uid)
    ON CONFLICT (invite_id, user_id) DO NOTHING;

    GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

    IF v_inserted_count > 0 THEN
        UPDATE public.invite_codes
        SET redeemed_count = redeemed_count + 1
        WHERE id = v_invite.id
            AND redeemed_count < max_redemptions;

        IF NOT FOUND THEN
            DELETE FROM public.invite_redemptions
            WHERE invite_id = v_invite.id
                AND user_id = v_uid;
            RETURN jsonb_build_object('ok', FALSE, 'error_code', 'invite_full');
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'ok', TRUE,
        'invite_id', v_invite.id,
        'label', v_invite.label,
        'cohort_key', v_invite.cohort_key,
        'already_redeemed', v_inserted_count = 0,
        'expires_at', v_invite.expires_at
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_active_invite () FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_invite_code (text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_my_active_invite () TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_invite_code (text) TO authenticated;

GRANT SELECT ON public.invite_redemptions TO authenticated;
GRANT ALL ON public.invite_codes TO service_role;
GRANT ALL ON public.invite_redemptions TO service_role;

CREATE OR REPLACE FUNCTION public.matchmaking_enqueue_and_try (p_pool_key text, p_side text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_uid uuid := auth.uid ();
    v_key text;
    v_waiting_a int;
    v_waiting_b int;
    v_pos int;
    v_squad_id uuid;
    v_my_side text := p_side;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    IF NOT private.auth_user_has_active_invite () THEN
        RAISE EXCEPTION 'Invite required' USING ERRCODE = '42501';
    END IF;

    IF p_side NOT IN ('A', 'B') THEN
        RAISE EXCEPTION 'Invalid side';
    END IF;

    v_key := left(trim(p_pool_key), 128);
    IF v_key = '' THEN
        v_key := 'default';
    END IF;

    PERFORM private.matchmaking_assert_pool_key_zk (v_uid, v_key);

    IF EXISTS (
        SELECT 1
        FROM public.match_queue
        WHERE user_id = v_uid
            AND pool_key = v_key
            AND status = 'waiting'
    ) THEN
        UPDATE public.match_queue
        SET side = p_side
        WHERE user_id = v_uid
            AND pool_key = v_key
            AND status = 'waiting';
    ELSE
        INSERT INTO public.match_queue (user_id, pool_key, side, status)
        VALUES (v_uid, v_key, p_side, 'waiting');
    END IF;

    PERFORM private.matchmaking_try_form_pool (v_key);

    SELECT squad_id INTO v_squad_id
    FROM public.match_queue
    WHERE user_id = v_uid
        AND pool_key = v_key
        AND status = 'matched'
    ORDER BY matched_at DESC NULLS LAST
    LIMIT 1;

    SELECT COUNT(*)::int INTO v_waiting_a
    FROM public.match_queue
    WHERE pool_key = v_key
        AND status = 'waiting'
        AND side = 'A';

    SELECT COUNT(*)::int INTO v_waiting_b
    FROM public.match_queue
    WHERE pool_key = v_key
        AND status = 'waiting'
        AND side = 'B';

    IF v_squad_id IS NOT NULL THEN
        RETURN jsonb_build_object('outcome', 'matched', 'squad_id', v_squad_id, 'pool_key', v_key, 'waiting_a', v_waiting_a, 'waiting_b', v_waiting_b, 'queue_position', NULL);
    END IF;

    SELECT 1 + COUNT(*)::int INTO v_pos
    FROM public.match_queue mq
    WHERE mq.pool_key = v_key
        AND mq.status = 'waiting'
        AND mq.side = v_my_side
        AND mq.enqueued_at < (
            SELECT enqueued_at
            FROM public.match_queue
            WHERE user_id = v_uid
                AND pool_key = v_key
                AND status = 'waiting'
        );

    RETURN jsonb_build_object('outcome', 'queued', 'squad_id', NULL, 'pool_key', v_key, 'waiting_a', v_waiting_a, 'waiting_b', v_waiting_b, 'queue_position', coalesce(v_pos, 1));
END;
$$;

REVOKE ALL ON FUNCTION public.matchmaking_enqueue_and_try (text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.matchmaking_enqueue_and_try (text, text) TO authenticated;
