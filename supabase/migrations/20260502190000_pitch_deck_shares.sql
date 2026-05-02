-- Audit / revocation table for pitch-deck share links minted by `mint-deck-share`.
-- Self-tokens (audience='self', TTL <=60s) are NOT recorded here — they're stateless.
-- Only audience='share' tokens (TTL up to 7 days) are persisted, so moderators can
-- list active shares and revoke them. Inserts come from the Edge Function via
-- service role; reads are restricted to moderators.

CREATE TABLE public.pitch_deck_shares (
    jti UUID PRIMARY KEY,
    deck_id TEXT NOT NULL,
    minted_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    CONSTRAINT pitch_deck_shares_deck_id_format CHECK (
        deck_id ~ '^[a-z0-9-]+$'
        AND char_length(deck_id) BETWEEN 1 AND 80
    ),
    CONSTRAINT pitch_deck_shares_expires_after_creation CHECK (expires_at > created_at)
);

COMMENT ON TABLE public.pitch_deck_shares IS
'Minted share-link audit. Each row corresponds to a JWT jti issued by `mint-deck-share` for audience=share. `serve-pitch-deck` looks rows up on every request to honour revocation immediately.';

COMMENT ON COLUMN public.pitch_deck_shares.jti IS
'Matches the `jti` claim in the HMAC-signed token. Primary key so reuse is impossible.';

COMMENT ON COLUMN public.pitch_deck_shares.revoked_at IS
'Set by a moderator (UPDATE) to revoke a share link before its natural expiry. The Edge Function treats any non-null value as denial.';

-- Lookups by jti are the hot path on every gated fetch; PK already covers that.
-- Listing active shares per deck for the hub UI is the secondary query.
CREATE INDEX pitch_deck_shares_deck_active_idx
    ON public.pitch_deck_shares (deck_id, created_at DESC)
    WHERE revoked_at IS NULL;

-- Garbage-collection helper: anything past its expires_at is safe to delete.
CREATE INDEX pitch_deck_shares_expires_at_idx
    ON public.pitch_deck_shares (expires_at)
    WHERE revoked_at IS NULL;

ALTER TABLE public.pitch_deck_shares ENABLE ROW LEVEL SECURITY;

-- Inserts: denied to all authenticated/anon roles; only the service role
-- (used by the Edge Function) can write rows. No policy = no access for
-- non-service callers.

-- Reads: moderators can list every share so the hub can surface "Active
-- shares (N)" and revocation UIs. We do NOT expose the JWT itself, only
-- the metadata (deck_id, expires_at, revoked_at, etc.).
CREATE POLICY "pitch_deck_shares_select_moderators"
    ON public.pitch_deck_shares FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT 1
            FROM public.moderators mo
            WHERE mo.user_id = auth.uid ()
        ));

-- Updates: moderators can flip `revoked_at`. PostgreSQL RLS WITH CHECK
-- cannot constrain column-level mutations, so we additionally enforce
-- column immutability via a trigger below.
CREATE POLICY "pitch_deck_shares_revoke_moderators"
    ON public.pitch_deck_shares FOR UPDATE TO authenticated
        USING (EXISTS (
            SELECT 1
            FROM public.moderators mo
            WHERE mo.user_id = auth.uid ()
        ))
        WITH CHECK (EXISTS (
            SELECT 1
            FROM public.moderators mo
            WHERE mo.user_id = auth.uid ()
        ));

CREATE OR REPLACE FUNCTION public.pitch_deck_shares_only_allow_revoke ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY INVOKER
    SET search_path = public
    AS $$
BEGIN
    IF NEW.jti IS DISTINCT FROM OLD.jti
        OR NEW.deck_id IS DISTINCT FROM OLD.deck_id
        OR NEW.minted_by IS DISTINCT FROM OLD.minted_by
        OR NEW.created_at IS DISTINCT FROM OLD.created_at
        OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
        RAISE EXCEPTION 'pitch_deck_shares: only revoked_at may be modified';
    END IF;
    -- Once revoked, the timestamp is sticky — protects against undo via the API.
    IF OLD.revoked_at IS NOT NULL AND NEW.revoked_at IS DISTINCT FROM OLD.revoked_at THEN
        RAISE EXCEPTION 'pitch_deck_shares: cannot un-revoke a share';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.pitch_deck_shares_only_allow_revoke () FROM PUBLIC;

CREATE TRIGGER pitch_deck_shares_immutable_columns
    BEFORE UPDATE ON public.pitch_deck_shares
    FOR EACH ROW
    EXECUTE FUNCTION public.pitch_deck_shares_only_allow_revoke ();

-- Deletes: never via API. Garbage collection happens via a service-role cron
-- (added separately). No policy = denied.

-- Optional pg_cron sweep: drop expired rows hourly to keep the audit table small.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_extension
        WHERE extname = 'pg_cron'
    ) THEN
        PERFORM cron.unschedule(jobid)
        FROM cron.job
        WHERE jobname = 'pitch-deck-shares-gc';

        PERFORM cron.schedule (
            'pitch-deck-shares-gc',
            '17 * * * *',
            $cmd$
            DELETE FROM public.pitch_deck_shares
            WHERE expires_at < timezone('utc'::text, now()) - INTERVAL '7 days';
            $cmd$
        );
    END IF;
END;
$$;
