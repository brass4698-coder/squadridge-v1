-- Alias for landing counter RPC (smoke tests / docs may call get_waitlist_count).

CREATE OR REPLACE FUNCTION public.get_waitlist_count ()
    RETURNS bigint
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public, pg_catalog
    AS $$
    SELECT
        public.waitlist_signup_count ();

$$;

REVOKE ALL ON FUNCTION public.get_waitlist_count () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_waitlist_count () TO anon;

GRANT EXECUTE ON FUNCTION public.get_waitlist_count () TO authenticated;
