-- Phase 0.2 (audit remediation): rotate any squad encryption keys that may have been generated
-- client-side before `src/lib/squad.ts` stopped producing them. The BEFORE INSERT trigger from
-- migration 20260417150000_squads_message_encryption_key_server_default already covers new rows
-- and back-filled NULLs at install time, but a client that explicitly passed a key would have
-- bypassed the WHEN-clause guard. This migration replaces those keys with fresh,
-- pgcrypto-generated values so no key material persisted in production traces back to an
-- unaudited client-side CSPRNG.
--
-- Scope:
--   - Demo squads only (topic = 'Demo dialogue'), the literal string used by the previous
--     `createDemoSquad` client flow. Production matched squads (`topic = 'Matched dialogue'`)
--     are NOT rotated; rotating them would invalidate existing message ciphertext history.
--   - Demo squads are ephemeral by design (1-day expires_at) so rotating is safe.
--
-- This migration cannot append to public.moderation_audit_log because that table requires
-- actor_user_id = auth.uid() (NOT NULL + CHECK constraint), and migrations run with no JWT
-- session. Operators can audit this rotation via Supabase migration history and the RAISE
-- NOTICE below in db push logs.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
    n int;
BEGIN
    UPDATE
        public.squads
    SET
        message_encryption_key = encode(extensions.gen_random_bytes (32), 'base64')
    WHERE
        topic = 'Demo dialogue';
    GET DIAGNOSTICS n = ROW_COUNT;
    RAISE NOTICE
        '[20260428210000] rotated message_encryption_key for % demo squads (topic=''Demo dialogue'')',
        n;
END
$$;
