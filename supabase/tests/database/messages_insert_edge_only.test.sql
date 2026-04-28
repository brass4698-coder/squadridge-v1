-- pgTAP test: messages_insert_edge_only
--
-- Asserts that the migration 20260428194500_messages_insert_edge_only.sql is in
-- effect: the `Messages_insert_squad` policy on public.messages must use
-- `WITH CHECK (false)`, and an authenticated direct INSERT must raise an RLS
-- violation (SQLSTATE 42501). All inserts must go through the ingest-message
-- Edge Function (service_role bypasses RLS).
--
-- Run with: supabase test db (CI `db` job).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(2);

-- 1. Structural: policy still has `WITH CHECK (false)` for INSERT on messages.
SELECT is(
    (
        SELECT lower(with_check)
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'messages'
          AND policyname = 'Messages_insert_squad'
    ),
    'false',
    'Messages_insert_squad policy uses WITH CHECK (false) — direct authenticated inserts blocked'
);

-- 2. Behavioural: authenticated role cannot INSERT into public.messages.
-- We use random UUIDs for squad_id / sender_id; RLS denial fires before FK
-- validation so we do not need to seed real users.
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
    true
);

SELECT throws_ok(
    $$INSERT INTO public.messages (squad_id, sender_id, payload_ciphertext)
      VALUES ('00000000-0000-0000-0000-000000000002',
              '00000000-0000-0000-0000-000000000001',
              'ciphertext-from-direct-attempt')$$,
    '42501',
    NULL,
    'authenticated role cannot direct-insert into public.messages (must use ingest-message Edge)'
);

SELECT * FROM finish();

ROLLBACK;
