-- Per-user notification preferences. v1 is preferences-only — there is no
-- delivery system attached today; the in-app surfaces simply gate on these
-- flags, and any future email/push pipeline can read the same row without a
-- schema change.

CREATE TABLE public.user_notification_prefs (
    user_id UUID PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
    in_app_session_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_publish_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    email_pilot_updates BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.user_notification_prefs IS
'Per-user notification preferences. Read/write self only via RLS; future delivery workers may read all via service_role.';

ALTER TABLE public.user_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notif_prefs_select_self" ON public.user_notification_prefs FOR
SELECT TO authenticated
    USING (user_id = auth.uid ());

CREATE POLICY "Notif_prefs_insert_self" ON public.user_notification_prefs FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid ());

CREATE POLICY "Notif_prefs_update_self" ON public.user_notification_prefs FOR UPDATE TO authenticated
    USING (user_id = auth.uid ())
    WITH CHECK (user_id = auth.uid ());

GRANT SELECT, INSERT, UPDATE ON public.user_notification_prefs TO authenticated;

GRANT ALL ON public.user_notification_prefs TO service_role;

-- Convenience: bump updated_at on UPDATE.
CREATE OR REPLACE FUNCTION public.user_notification_prefs_touch ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE TRIGGER user_notification_prefs_touch_updated_at
    BEFORE UPDATE ON public.user_notification_prefs
    FOR EACH ROW
    EXECUTE FUNCTION public.user_notification_prefs_touch ();
