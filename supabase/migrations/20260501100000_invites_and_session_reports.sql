CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.invite_cohorts (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    allow_matchmaking BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    CONSTRAINT invite_cohorts_key_format CHECK (key ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$')
);

COMMENT ON TABLE public.invite_cohorts IS
'Invite-scoped pilot cohorts. Matchmaking pool keys are bound to one of these cohort keys.';

CREATE TABLE public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_key TEXT NOT NULL REFERENCES public.invite_cohorts (key) ON DELETE CASCADE,
    code_digest TEXT NOT NULL UNIQUE,
    code_hint TEXT,
    max_uses INTEGER,
    expires_at TIMESTAMPTZ,
    disabled_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    CONSTRAINT invites_max_uses_check CHECK (max_uses IS NULL OR max_uses > 0)
);

COMMENT ON TABLE public.invites IS
'Server-side invite records. Raw codes are never stored; compare on sha256 digest of normalized code.';

CREATE INDEX invites_cohort_created_idx ON public.invites (cohort_key, created_at DESC);

CREATE TABLE public.invite_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_id UUID NOT NULL REFERENCES public.invites (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    cohort_key TEXT NOT NULL REFERENCES public.invite_cohorts (key) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    last_validated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    revoked_at TIMESTAMPTZ,
    source_code_hint TEXT,
    UNIQUE (invite_id, user_id),
    UNIQUE (user_id, cohort_key)
);

COMMENT ON TABLE public.invite_claims IS
'Invite entitlements bound to auth.users.id. Matchmaking requires an active claim for the cohort prefix in pool_key.';

CREATE INDEX invite_claims_user_claimed_idx ON public.invite_claims (user_id, claimed_at DESC);
CREATE INDEX invite_claims_invite_active_idx ON public.invite_claims (invite_id, claimed_at DESC)
WHERE revoked_at IS NULL;

CREATE OR REPLACE FUNCTION private.normalize_invite_code (p_code TEXT)
    RETURNS TEXT
    LANGUAGE sql
    IMMUTABLE
    AS $$
    SELECT regexp_replace(lower(trim(coalesce(p_code, ''))), '\\s+', '', 'g');
$$;

CREATE OR REPLACE FUNCTION private.invite_code_digest (p_code TEXT)
    RETURNS TEXT
    LANGUAGE sql
    IMMUTABLE
    AS $$
    SELECT encode(digest(private.normalize_invite_code(p_code), 'sha256'), 'hex');
$$;

CREATE OR REPLACE FUNCTION private.active_invite_claims_for_user (p_uid UUID)
    RETURNS TABLE (
        claim_id UUID,
        invite_id UUID,
        cohort_key TEXT,
        cohort_label TEXT,
        allow_matchmaking BOOLEAN,
        claimed_at TIMESTAMPTZ,
        invite_expires_at TIMESTAMPTZ,
        code_hint TEXT,
        metadata JSONB)
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT
        ic.id,
        ic.invite_id,
        ic.cohort_key,
        c.label,
        c.allow_matchmaking,
        ic.claimed_at,
        i.expires_at,
        i.code_hint,
        i.metadata
    FROM
        public.invite_claims ic
        INNER JOIN public.invites i ON i.id = ic.invite_id
        INNER JOIN public.invite_cohorts c ON c.key = ic.cohort_key
    WHERE
        ic.user_id = p_uid
        AND ic.revoked_at IS NULL
        AND i.disabled_at IS NULL
        AND (i.expires_at IS NULL OR i.expires_at > timezone('utc'::TEXT, now()))
        AND (
            i.max_uses IS NULL
            OR (
                SELECT count(*)::INTEGER
                FROM public.invite_claims active_ic
                WHERE active_ic.invite_id = i.id
                    AND active_ic.revoked_at IS NULL
            ) <= i.max_uses
        )
    ORDER BY
        ic.claimed_at DESC;
$$;

REVOKE ALL ON FUNCTION private.active_invite_claims_for_user (UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.normalize_invite_code (TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.invite_code_digest (TEXT) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.claim_invite_code (p_code TEXT)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_uid UUID := auth.uid ();
    v_normalized TEXT := private.normalize_invite_code(p_code);
    v_invite public.invites%ROWTYPE;
    v_active_claims INTEGER;
    v_claim public.invite_claims%ROWTYPE;
    v_cohort_label TEXT;
    v_allow_matchmaking BOOLEAN;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Sign in before using an invite' USING ERRCODE = '28000';
    END IF;

    IF v_normalized = '' THEN
        RAISE EXCEPTION 'Enter an invite code';
    END IF;

    SELECT *
    INTO v_invite
    FROM public.invites i
    WHERE i.code_digest = private.invite_code_digest(v_normalized)
      AND i.disabled_at IS NULL
      AND (i.expires_at IS NULL OR i.expires_at > timezone('utc'::TEXT, now()))
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invite code is invalid or expired';
    END IF;

    SELECT count(*)::INTEGER
    INTO v_active_claims
    FROM public.invite_claims ic
    WHERE ic.invite_id = v_invite.id
      AND ic.revoked_at IS NULL;

    IF v_invite.max_uses IS NOT NULL AND v_active_claims >= v_invite.max_uses THEN
        RAISE EXCEPTION 'Invite code has reached its limit';
    END IF;

    INSERT INTO public.invite_claims (invite_id, user_id, cohort_key, last_validated_at, source_code_hint)
    VALUES (v_invite.id, v_uid, v_invite.cohort_key, timezone('utc'::TEXT, now()), v_invite.code_hint)
    ON CONFLICT (user_id, cohort_key)
        DO UPDATE SET
            invite_id = EXCLUDED.invite_id,
            revoked_at = NULL,
            last_validated_at = timezone('utc'::TEXT, now()),
            source_code_hint = EXCLUDED.source_code_hint
    RETURNING * INTO v_claim;

    SELECT c.label, c.allow_matchmaking
    INTO v_cohort_label, v_allow_matchmaking
    FROM public.invite_cohorts c
    WHERE c.key = v_claim.cohort_key;

    RETURN jsonb_build_object(
        'claim_id', v_claim.id,
        'invite_id', v_claim.invite_id,
        'cohort_key', v_claim.cohort_key,
        'cohort_label', v_cohort_label,
        'allow_matchmaking', coalesce(v_allow_matchmaking, TRUE),
        'claimed_at', v_claim.claimed_at,
        'invite_expires_at', v_invite.expires_at,
        'code_hint', v_invite.code_hint,
        'metadata', v_invite.metadata
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_active_invite_claim ()
    RETURNS JSONB
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
    SELECT CASE
        WHEN auth.uid() IS NULL THEN NULL
        ELSE (
            SELECT jsonb_build_object(
                'claim_id', a.claim_id,
                'invite_id', a.invite_id,
                'cohort_key', a.cohort_key,
                'cohort_label', a.cohort_label,
                'allow_matchmaking', a.allow_matchmaking,
                'claimed_at', a.claimed_at,
                'invite_expires_at', a.invite_expires_at,
                'code_hint', a.code_hint,
                'metadata', a.metadata
            )
            FROM private.active_invite_claims_for_user(auth.uid()) a
            LIMIT 1
        )
    END;
$$;

CREATE OR REPLACE FUNCTION private.matchmaking_assert_active_invite (p_uid UUID, p_pool_key TEXT)
    RETURNS void
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_cohort_key TEXT;
BEGIN
    v_cohort_key := substring(p_pool_key FROM '^cohort:([^|]+)\\|');

    IF v_cohort_key IS NULL OR trim(v_cohort_key) = '' THEN
        RAISE EXCEPTION 'Invite-scoped cohort key is required before matchmaking';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM private.active_invite_claims_for_user(p_uid) a
        WHERE a.cohort_key = v_cohort_key
          AND a.allow_matchmaking = TRUE
    ) THEN
        RAISE EXCEPTION 'Invite access is required for this cohort';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION private.matchmaking_assert_active_invite (UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_invite_code (TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_active_invite_claim () FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_invite_code (TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_active_invite_claim () TO authenticated;

ALTER TABLE public.invite_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invite_claims_select_own" ON public.invite_claims
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Invite_claims_select_moderators" ON public.invite_claims
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY "Invite_cohorts_select_moderators" ON public.invite_cohorts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY "Invites_select_moderators" ON public.invites
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE TABLE public.session_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE DEFAULT auth.uid (),
    squad_id UUID NOT NULL REFERENCES public.squads (id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    evidence TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    assigned_moderator_user_id UUID REFERENCES public.moderators (user_id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    CONSTRAINT session_reports_type_check CHECK (report_type IN ('room', 'participant')),
    CONSTRAINT session_reports_status_check CHECK (status IN ('open', 'triaged', 'in_review', 'resolved', 'dismissed')),
    CONSTRAINT session_reports_target_check CHECK (
        (report_type = 'room' AND target_user_id IS NULL)
        OR (report_type = 'participant' AND target_user_id IS NOT NULL)
    )
);

COMMENT ON TABLE public.session_reports IS
'Participant-submitted room and participant reports with moderation workflow fields for assignment and resolution.';

CREATE INDEX session_reports_created_idx ON public.session_reports (created_at DESC);
CREATE INDEX session_reports_status_idx ON public.session_reports (status, created_at DESC);
CREATE INDEX session_reports_target_idx ON public.session_reports (target_user_id, created_at DESC)
WHERE target_user_id IS NOT NULL;

CREATE TABLE public.participant_safety_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE DEFAULT auth.uid (),
    target_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    control_type TEXT NOT NULL,
    reason TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    CONSTRAINT participant_safety_controls_type_check CHECK (control_type IN ('block', 'mute')),
    CONSTRAINT participant_safety_controls_owner_target_check CHECK (owner_user_id <> target_user_id),
    UNIQUE (owner_user_id, target_user_id, control_type)
);

COMMENT ON TABLE public.participant_safety_controls IS
'Participant-managed block/mute controls for users they encountered in a squad.';

CREATE INDEX participant_safety_controls_owner_idx ON public.participant_safety_controls (owner_user_id, active, control_type);
CREATE INDEX participant_safety_controls_target_idx ON public.participant_safety_controls (target_user_id, active, control_type);

CREATE OR REPLACE FUNCTION public.set_session_reports_updated_at ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at := timezone('utc'::TEXT, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS session_reports_set_updated_at ON public.session_reports;
CREATE TRIGGER session_reports_set_updated_at
    BEFORE UPDATE ON public.session_reports
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_session_reports_updated_at();

CREATE OR REPLACE FUNCTION public.set_participant_safety_controls_updated_at ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at := timezone('utc'::TEXT, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS participant_safety_controls_set_updated_at ON public.participant_safety_controls;
CREATE TRIGGER participant_safety_controls_set_updated_at
    BEFORE UPDATE ON public.participant_safety_controls
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_participant_safety_controls_updated_at();

ALTER TABLE public.session_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_safety_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session_reports_insert_reporter" ON public.session_reports
    FOR INSERT TO authenticated
    WITH CHECK (
        reporter_user_id = auth.uid()
        AND public.auth_user_is_squad_member(squad_id)
        AND (target_user_id IS NULL OR target_user_id <> auth.uid())
        AND (
            target_user_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.squad_members sm
                WHERE sm.squad_id = session_reports.squad_id
                  AND sm.user_id = session_reports.target_user_id
            )
        )
    );

CREATE POLICY "Session_reports_select_reporter" ON public.session_reports
    FOR SELECT TO authenticated
    USING (reporter_user_id = auth.uid());

CREATE POLICY "Session_reports_select_moderators" ON public.session_reports
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY "Session_reports_update_moderators" ON public.session_reports
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY "Participant_safety_controls_select_owner" ON public.participant_safety_controls
    FOR SELECT TO authenticated
    USING (owner_user_id = auth.uid());

CREATE POLICY "Participant_safety_controls_select_moderators" ON public.participant_safety_controls
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY "Participant_safety_controls_insert_owner" ON public.participant_safety_controls
    FOR INSERT TO authenticated
    WITH CHECK (
        owner_user_id = auth.uid()
        AND owner_user_id <> target_user_id
    );

CREATE POLICY "Participant_safety_controls_update_owner" ON public.participant_safety_controls
    FOR UPDATE TO authenticated
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.matchmaking_enqueue_and_try (p_pool_key TEXT, p_side TEXT)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_uid UUID := auth.uid ();
    v_key TEXT;
    v_waiting_a INT;
    v_waiting_b INT;
    v_pos INT;
    v_squad_id UUID;
    v_my_side TEXT := p_side;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    IF p_side NOT IN ('A', 'B') THEN
        RAISE EXCEPTION 'Invalid side';
    END IF;

    v_key := left(trim(p_pool_key), 128);

    IF v_key = '' THEN
        v_key := 'default';
    END IF;

    PERFORM private.matchmaking_assert_pool_key_zk(v_uid, v_key);
    PERFORM private.matchmaking_assert_active_invite(v_uid, v_key);

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

    PERFORM private.matchmaking_try_form_pool(v_key);

    SELECT squad_id INTO v_squad_id
    FROM public.match_queue
    WHERE user_id = v_uid
      AND pool_key = v_key
      AND status = 'matched'
    ORDER BY matched_at DESC NULLS LAST
    LIMIT 1;

    SELECT count(*)::INT INTO v_waiting_a
    FROM public.match_queue
    WHERE pool_key = v_key
      AND status = 'waiting'
      AND side = 'A';

    SELECT count(*)::INT INTO v_waiting_b
    FROM public.match_queue
    WHERE pool_key = v_key
      AND status = 'waiting'
      AND side = 'B';

    IF v_squad_id IS NOT NULL THEN
        RETURN jsonb_build_object('outcome', 'matched', 'squad_id', v_squad_id, 'pool_key', v_key, 'waiting_a', v_waiting_a, 'waiting_b', v_waiting_b, 'queue_position', NULL);
    END IF;

    SELECT 1 + count(*)::INT INTO v_pos
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

CREATE OR REPLACE FUNCTION public.matchmaking_pool_snapshot (p_pool_key TEXT)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_uid UUID := auth.uid ();
    v_key TEXT;
    v_waiting_a INT;
    v_waiting_b INT;
    v_pos INT;
    v_side TEXT;
    v_squad_id UUID;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    v_key := left(trim(p_pool_key), 128);

    IF v_key = '' THEN
        v_key := 'default';
    END IF;

    PERFORM private.matchmaking_assert_pool_key_zk(v_uid, v_key);
    PERFORM private.matchmaking_assert_active_invite(v_uid, v_key);
    PERFORM private.matchmaking_try_form_pool(v_key);

    SELECT squad_id INTO v_squad_id
    FROM public.match_queue
    WHERE user_id = v_uid
      AND pool_key = v_key
      AND status = 'matched'
    ORDER BY matched_at DESC NULLS LAST
    LIMIT 1;

    IF v_squad_id IS NOT NULL THEN
        RETURN jsonb_build_object('outcome', 'matched', 'squad_id', v_squad_id, 'pool_key', v_key);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.match_queue
        WHERE user_id = v_uid
          AND pool_key = v_key
          AND status = 'waiting'
    ) THEN
        RETURN jsonb_build_object('outcome', 'idle', 'pool_key', v_key);
    END IF;

    SELECT side INTO v_side
    FROM public.match_queue
    WHERE user_id = v_uid
      AND pool_key = v_key
      AND status = 'waiting'
    LIMIT 1;

    SELECT count(*)::INT INTO v_waiting_a
    FROM public.match_queue
    WHERE pool_key = v_key
      AND status = 'waiting'
      AND side = 'A';

    SELECT count(*)::INT INTO v_waiting_b
    FROM public.match_queue
    WHERE pool_key = v_key
      AND status = 'waiting'
      AND side = 'B';

    SELECT 1 + count(*)::INT INTO v_pos
    FROM public.match_queue mq
    WHERE mq.pool_key = v_key
      AND mq.status = 'waiting'
      AND mq.side = v_side
      AND mq.enqueued_at < (
          SELECT enqueued_at
          FROM public.match_queue
          WHERE user_id = v_uid
            AND pool_key = v_key
            AND status = 'waiting'
      );

    RETURN jsonb_build_object('outcome', 'queued', 'pool_key', v_key, 'side', v_side, 'waiting_a', v_waiting_a, 'waiting_b', v_waiting_b, 'queue_position', coalesce(v_pos, 1));
END;
$$;

CREATE OR REPLACE FUNCTION public.matchmaking_cancel_waiting (p_pool_key TEXT)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_uid UUID := auth.uid ();
    v_key TEXT;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    v_key := left(trim(p_pool_key), 128);

    IF v_key = '' THEN
        v_key := 'default';
    END IF;

    PERFORM private.matchmaking_assert_pool_key_zk(v_uid, v_key);
    PERFORM private.matchmaking_assert_active_invite(v_uid, v_key);

    UPDATE public.match_queue
    SET status = 'cancelled'
    WHERE user_id = v_uid
      AND pool_key = v_key
      AND status = 'waiting';
END;
$$;

REVOKE ALL ON FUNCTION public.matchmaking_enqueue_and_try (TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.matchmaking_pool_snapshot (TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.matchmaking_cancel_waiting (TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.matchmaking_enqueue_and_try (TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.matchmaking_pool_snapshot (TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.matchmaking_cancel_waiting (TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.matchmaking_enqueue_and_try (TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.matchmaking_pool_snapshot (TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.matchmaking_cancel_waiting (TEXT) TO authenticated;
