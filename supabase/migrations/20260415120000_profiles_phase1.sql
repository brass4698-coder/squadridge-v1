-- Phase 1: pseudonymous operator profile (auth.users.id-aligned).
-- Placement fields map to product language: language / region_hint / timezone_window.
-- TODO(ZK): optional future columns for commitment anchors may be added alongside tags; keep eligibility as coarse flags only.

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    callsign TEXT NOT NULL DEFAULT '',
    role_archetype TEXT,
    role_other_detail VARCHAR(100),
    era_affiliation TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    language TEXT,
    region_hint TEXT,
    timezone_window TEXT,
    onboarding_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
    CONSTRAINT profiles_role_archetype_check CHECK (
        role_archetype IS NULL
        OR role_archetype IN (
            'strategist',
            'analyst',
            'policy',
            'mediator',
            'field',
            'other'
        )
    )
);

CREATE INDEX IF NOT EXISTS profiles_callsign_lower_idx ON public.profiles (lower(callsign));

COMMENT ON TABLE public.profiles IS 'Pseudonymous operator profile; no PII beyond auth. Used for routing and in-room display.';

COMMENT ON COLUMN public.profiles.tags IS 'Coarse capability / lane tags (e.g. military_veteran). Prefer commitments over raw facts when ZK lands.';

COMMENT ON COLUMN public.profiles.role_other_detail IS 'Free text when role_archetype is other; length enforced in application (8–100).';

-- updated_at
CREATE OR REPLACE FUNCTION public.set_profiles_updated_at ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at := timezone('utc'::TEXT, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;

CREATE TRIGGER profiles_set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_profiles_updated_at ();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT + INSERT + UPDATE (upsert needs SELECT on conflict target)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid () = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid () = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid () = id)
    WITH CHECK (auth.uid () = id);
