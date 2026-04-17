-- Message TTL (7 days) + cleanup indexes; match_queue expiry; hourly cleanup via pg_cron when available.

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE public.match_queue
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE public.messages
SET
    expires_at = sent_at + INTERVAL '7 days'
WHERE
    expires_at IS NULL;

UPDATE public.match_queue
SET
    expires_at = enqueued_at + INTERVAL '7 days'
WHERE
    expires_at IS NULL;

CREATE OR REPLACE FUNCTION public.set_message_ttl ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    NEW.expires_at := timezone('utc'::text, now()) + INTERVAL '7 days';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_message_ttl ON public.messages;

CREATE TRIGGER trigger_set_message_ttl
    BEFORE INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.set_message_ttl ();

CREATE OR REPLACE FUNCTION public.set_match_queue_ttl ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    NEW.expires_at := timezone('utc'::text, now()) + INTERVAL '7 days';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_match_queue_ttl ON public.match_queue;

CREATE TRIGGER trigger_set_match_queue_ttl
    BEFORE INSERT ON public.match_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.set_match_queue_ttl ();

REVOKE ALL ON FUNCTION public.set_message_ttl () FROM PUBLIC;

REVOKE ALL ON FUNCTION public.set_match_queue_ttl () FROM PUBLIC;

CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON public.messages (expires_at);

CREATE INDEX IF NOT EXISTS idx_match_queue_expires_at ON public.match_queue (expires_at);

CREATE INDEX IF NOT EXISTS idx_match_queue_cleanup ON public.match_queue (status, expires_at);

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
DECLARE
    jid bigint;
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_extension
        WHERE
            extname = 'pg_cron') THEN
    SELECT
        jobid INTO jid
    FROM
        cron.job
    WHERE
        jobname = 'cleanup-expired-data';
    IF jid IS NOT NULL THEN
        PERFORM cron.unschedule (jid);
    END IF;
    PERFORM cron.schedule (
        'cleanup-expired-data',
        '0 * * * *',
        $cmd$
        DELETE FROM public.messages
        WHERE expires_at IS NOT NULL
            AND expires_at < timezone('utc'::text, now());

        DELETE FROM public.match_queue
        WHERE expires_at IS NOT NULL
            AND expires_at < timezone('utc'::text, now());

        DELETE FROM public.squads
        WHERE expires_at < timezone('utc'::text, now());
        $cmd$);
END IF;
END;
$$;
