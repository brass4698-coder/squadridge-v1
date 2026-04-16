-- Operator export: run in Supabase SQL Editor (service role / dashboard) — not for anon clients.
-- Returns emails and signup time for CRM or CSV export (Table Editor → Export works too).

SELECT email, created_at
FROM public.waitlist_signups
ORDER BY created_at ASC;
