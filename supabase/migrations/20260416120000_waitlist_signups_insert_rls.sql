-- Replace permissive WITH CHECK (true) on waitlist inserts (Supabase advisor: rls_policy_always_true).
-- Aligns policy expression with table constraints; still allows anon/authenticated INSERT for the landing waitlist.

DROP POLICY IF EXISTS "Waitlist_signups_insert" ON public.waitlist_signups;

CREATE POLICY "Waitlist_signups_insert" ON public.waitlist_signups
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        email IS NOT NULL
        AND char_length(btrim(email)) >= 5
        AND char_length(email) <= 320
    );
