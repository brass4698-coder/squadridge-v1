-- Squad_members SELECT policy referenced squad_members again in a subquery, causing
-- "infinite recursion detected in policy for relation squad_members".
-- Use SECURITY DEFINER helper so membership is evaluated without re-entering RLS.

CREATE OR REPLACE FUNCTION public.auth_user_is_squad_member (p_squad_id uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT
        EXISTS (
            SELECT
                1
            FROM
                public.squad_members sm
            WHERE
                sm.squad_id = p_squad_id
                AND sm.user_id = auth.uid ());

$$;

REVOKE ALL ON FUNCTION public.auth_user_is_squad_member (uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.auth_user_is_squad_member (uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.auth_user_is_squad_member (uuid) TO anon;

DROP POLICY IF EXISTS "Squad_members_select_participant" ON public.squad_members;

CREATE POLICY "Squad_members_select_participant" ON public.squad_members
    FOR SELECT USING (user_id = auth.uid ()
        OR public.auth_user_is_squad_member (squad_members.squad_id));
