-- Replace permissive member INSERT with impossible CHECK so direct PostgREST inserts stop working.
-- Chat persistence must go through ingest-message Edge (service_role bypasses RLS): decrypt → redact → re-encrypt.

DROP POLICY IF EXISTS "Messages_insert_squad" ON public.messages;

CREATE POLICY "Messages_insert_squad" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (FALSE);

COMMENT ON POLICY "Messages_insert_squad" ON public.messages IS
'Direct client inserts disabled; use ingest-message Edge Function (service_role bypass).';
