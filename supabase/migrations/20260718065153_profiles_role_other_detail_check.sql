-- Profiles: require role_other_detail when role_archetype = 'other';
-- extend handle_new_user to auto-create a profiles row; reaffirm own-row RLS.
--
-- Final phase-1 identity columns (see 20260415120000 + role_other_detail fixes):
--   id uuid PK → auth.users
--   callsign text          (product display handle; not display_name)
--   role_archetype text    (CHECK: strategist|analyst|policy|mediator|field|other)
--   role_other_detail text NULLABLE when role_archetype <> 'other'
--   onboarding_completed_at timestamptz
-- Invite-only columns (display_name, primary_role, …) are additive via later migrations.

-- Clear incomplete "other" rows so the new CHECK can validate.
UPDATE public.profiles
SET
    role_archetype = NULL
WHERE
    role_archetype = 'other'
    AND (
        role_other_detail IS NULL
        OR trim(role_other_detail) = ''
    );

DO $$
BEGIN
    ALTER TABLE public.profiles
        ADD CONSTRAINT chk_role_other_detail
        CHECK (
            role_archetype IS DISTINCT FROM 'other'
            OR role_other_detail IS NOT NULL
        );
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END;
$$;

-- Auto-create public.users + public.profiles on auth signup.
CREATE OR REPLACE FUNCTION public.handle_new_user ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    INSERT INTO public.users (id)
        VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id)
        VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user ();

-- Own-row RLS (idempotent). INSERT kept so clients can upsert during onboarding.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT
        USING (auth.uid () = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE
        USING (auth.uid () = id)
        WITH CHECK (auth.uid () = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT
        WITH CHECK (auth.uid () = id);
