-- Onboarding identity: free text when role_archetype = 'other' (8–100 chars enforced in app).
DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'profiles'
      AND c.relkind = 'r'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS role_other_detail VARCHAR(100);

    COMMENT ON COLUMN public.profiles.role_other_detail IS
      'Optional lane description when role_archetype is other; capped at 100 characters.';
  END IF;
END $migration$;
