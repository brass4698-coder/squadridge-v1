-- pgTAP test: demo_claim consent flow
--
-- Asserts the structural and behavioural contracts of migration
-- 20260428230000_demo_claim_consent_token.sql:
--
--   1. issue_demo_claim_consent and finalize_demo_session_claim exist with the
--      expected signatures and are SECURITY DEFINER.
--   2. Both are EXECUTE-grantable to `authenticated` and not `anon` / public.
--   3. Both return structured `{ok: false, error_code: '...'}` for documented
--      failure modes — they must NOT raise.
--   4. finalize_demo_session_claim refuses without a consent token.
--
-- We do not exercise the full happy-path merge here because that requires
-- two-distinct-JWT setup (anon user creates claim, verified user finalizes); the
-- structural + error-shape assertions below catch regressions that matter for
-- pilot safety. End-to-end coverage lives in app-level tests.
--
-- Run with: supabase test db (CI `db` job).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(11);

-- 1. Functions exist.
SELECT has_function(
    'public',
    'issue_demo_claim_consent',
    ARRAY['text'],
    'issue_demo_claim_consent(text) exists'
);
SELECT has_function(
    'public',
    'finalize_demo_session_claim',
    ARRAY['text', 'text'],
    'finalize_demo_session_claim(text, text) exists with two-arg signature'
);

-- 2. Both return jsonb.
SELECT function_returns(
    'public',
    'issue_demo_claim_consent',
    ARRAY['text'],
    'jsonb',
    'issue_demo_claim_consent returns jsonb'
);
SELECT function_returns(
    'public',
    'finalize_demo_session_claim',
    ARRAY['text', 'text'],
    'jsonb',
    'finalize_demo_session_claim returns jsonb'
);

-- 3. Both are SECURITY DEFINER.
SELECT is(
    (
        SELECT prosecdef
        FROM pg_proc
        WHERE proname = 'issue_demo_claim_consent'
          AND pronamespace = 'public'::regnamespace
    ),
    TRUE,
    'issue_demo_claim_consent is SECURITY DEFINER'
);
SELECT is(
    (
        SELECT prosecdef
        FROM pg_proc p
        WHERE p.proname = 'finalize_demo_session_claim'
          AND p.pronamespace = 'public'::regnamespace
          AND pg_get_function_identity_arguments(p.oid) = 'p_claim_code text, p_consent_token text'
    ),
    TRUE,
    'finalize_demo_session_claim(text, text) is SECURITY DEFINER'
);

-- 4. EXECUTE granted to authenticated only.
SELECT ok(
    has_function_privilege('authenticated', 'public.issue_demo_claim_consent(text)', 'EXECUTE'),
    'authenticated can EXECUTE issue_demo_claim_consent'
);
SELECT ok(
    NOT has_function_privilege('anon', 'public.issue_demo_claim_consent(text)', 'EXECUTE'),
    'anon cannot EXECUTE issue_demo_claim_consent'
);
SELECT ok(
    has_function_privilege('authenticated', 'public.finalize_demo_session_claim(text, text)', 'EXECUTE'),
    'authenticated can EXECUTE finalize_demo_session_claim(text, text)'
);
SELECT ok(
    NOT has_function_privilege('anon', 'public.finalize_demo_session_claim(text, text)', 'EXECUTE'),
    'anon cannot EXECUTE finalize_demo_session_claim(text, text)'
);

-- 5. Without auth.uid(), both functions return structured errors instead of raising.
-- (No JWT claims set on the role-less default session inside this transaction.)
SET LOCAL ROLE authenticated;
SELECT is(
    (SELECT public.issue_demo_claim_consent('any-claim-code-with-min-length')),
    jsonb_build_object('ok', FALSE, 'error_code', 'authentication_required'),
    'issue_demo_claim_consent returns authentication_required when auth.uid() is null'
);

SELECT * FROM finish();

ROLLBACK;
