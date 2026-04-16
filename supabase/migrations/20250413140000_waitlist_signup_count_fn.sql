-- Public aggregate for landing waitlist counter (no row data exposed)

CREATE OR REPLACE FUNCTION public.waitlist_signup_count ()
    RETURNS bigint
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT
        count(*)::bigint
    FROM
        public.waitlist_signups;
$$;

REVOKE ALL ON FUNCTION public.waitlist_signup_count () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.waitlist_signup_count () TO anon, authenticated;
