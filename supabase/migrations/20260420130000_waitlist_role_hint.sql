-- Optional self-reported role from the public landing waitlist (segmentation / outreach)

ALTER TABLE public.waitlist_signups
    ADD COLUMN IF NOT EXISTS role_hint text NULL;

COMMENT ON COLUMN public.waitlist_signups.role_hint IS
    'Self-reported role label from landing form (shortlist segmentation).';
