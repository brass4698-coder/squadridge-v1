-- Authorize squad-scoped Realtime Broadcast/Presence channels.
--
-- `squad-presence:<uuid>` and `squad-typing:<uuid>` carry user IDs for online
-- and typing state. They must not be public topics: without Realtime RLS, any
-- authenticated client that guesses a squad UUID could join and observe room
-- activity metadata. Client hooks set `private: true`; these policies make the
-- join succeed only for members of the referenced squad.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.squad_realtime_topic_squad_id (p_topic text)
    RETURNS uuid
    LANGUAGE sql
    IMMUTABLE
    PARALLEL SAFE
    AS $$
    SELECT
        CASE
        WHEN p_topic ~ '^squad-(presence|typing):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
            THEN substring(p_topic FROM '^[^:]+:(.*)$')::uuid
        ELSE NULL::uuid
        END
$$;

REVOKE ALL ON FUNCTION public.squad_realtime_topic_squad_id (text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.squad_realtime_topic_squad_id (text) TO authenticated;

CREATE OR REPLACE FUNCTION public.auth_user_can_access_squad_realtime (p_topic text)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT
        public.auth_user_is_squad_member (
            public.squad_realtime_topic_squad_id (p_topic)
        );
$$;

REVOKE ALL ON FUNCTION public.auth_user_can_access_squad_realtime (text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.auth_user_can_access_squad_realtime (text) TO authenticated;

DROP POLICY IF EXISTS "Squad realtime read member" ON realtime.messages;

CREATE POLICY "Squad realtime read member" ON realtime.messages FOR
SELECT TO authenticated
    USING (
        realtime.messages.extension IN ('broadcast', 'presence')
        AND public.auth_user_can_access_squad_realtime ((SELECT realtime.topic ()))
    );

DROP POLICY IF EXISTS "Squad realtime write member" ON realtime.messages;

CREATE POLICY "Squad realtime write member" ON realtime.messages FOR INSERT TO authenticated
    WITH CHECK (
        realtime.messages.extension IN ('broadcast', 'presence')
        AND public.auth_user_can_access_squad_realtime ((SELECT realtime.topic ()))
    );
