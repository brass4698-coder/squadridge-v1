-- Squad peer profiles: members of a squad may read each other's pseudonymous display fields.
-- Uses SECURITY DEFINER to avoid a global-directory SELECT policy on profiles.
-- Caller must be a member of p_squad_id; only safe, non-sensitive columns are returned.

CREATE TYPE public.squad_peer_profile AS (
    user_id UUID,
    callsign TEXT,
    role_archetype TEXT,
    tags TEXT[],
    region_hint TEXT
);

CREATE OR REPLACE FUNCTION public.get_squad_peer_profiles (p_squad_id UUID)
    RETURNS SETOF public.squad_peer_profile
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT
            1
        FROM
            public.squad_members sm
        WHERE
            sm.squad_id = p_squad_id
            AND sm.user_id = auth.uid ()) THEN
    RAISE EXCEPTION 'not a member of this squad'
        USING ERRCODE = '42501';
END IF;
    RETURN QUERY
    SELECT
        p.id AS user_id,
        p.callsign,
        p.role_archetype,
        p.tags,
        p.region_hint
    FROM
        public.profiles p
        INNER JOIN public.squad_members sm ON sm.user_id = p.id
    WHERE
        sm.squad_id = p_squad_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_squad_peer_profiles (UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_squad_peer_profiles (UUID) TO authenticated;

COMMENT ON FUNCTION public.get_squad_peer_profiles (UUID) IS
'Returns callsign, role_archetype, tags, and region_hint for all members of a squad.
Caller must be a member of p_squad_id (checked inside the function before querying profiles).
SECURITY DEFINER prevents a global-directory SELECT policy on profiles — no cross-squad discovery.';
