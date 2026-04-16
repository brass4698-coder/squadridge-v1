-- Pre-launch waitlist: email capture from the public landing (anon insert, no public reads)

CREATE TABLE public.waitlist_signups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    email text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now ()),
    CONSTRAINT waitlist_email_len CHECK (char_length(btrim(email)) >= 5
        AND char_length(email) <= 320),
    CONSTRAINT waitlist_email_unique UNIQUE (email)
);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.waitlist_signups FROM PUBLIC;

GRANT INSERT ON TABLE public.waitlist_signups TO anon, authenticated;

CREATE POLICY "Waitlist_signups_insert" ON public.waitlist_signups
    FOR INSERT TO anon, authenticated
    WITH CHECK (TRUE);
