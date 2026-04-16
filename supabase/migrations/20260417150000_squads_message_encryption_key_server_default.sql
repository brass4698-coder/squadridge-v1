-- Server-generated squad message keys: every new squad row gets a 32-byte AES key at insert time.
-- Covers matchmaking INSERTs (private.matchmaking_try_form_pool) that omit message_encryption_key,
-- removes reliance on first client message for key material, and uses CSPRNG from pgcrypto.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.squads_set_default_message_encryption_key ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    IF NEW.message_encryption_key IS NULL OR btrim(NEW.message_encryption_key) = '' THEN
        NEW.message_encryption_key := encode(extensions.gen_random_bytes (32), 'base64');
    END IF;
    RETURN NEW;
END;

$$;

COMMENT ON FUNCTION public.squads_set_default_message_encryption_key () IS
'Fills squads.message_encryption_key when missing; uses pgcrypto gen_random_bytes (32 bytes), base64-encoded. Client import accepts this format.';

-- Historical rows (e.g. matched squads before this migration) and any NULLs.
UPDATE
    public.squads
SET
    message_encryption_key = encode(extensions.gen_random_bytes (32), 'base64')
WHERE
    message_encryption_key IS NULL
    OR btrim(message_encryption_key) = '';

DROP TRIGGER IF EXISTS squads_message_encryption_key_default ON public.squads;

CREATE TRIGGER squads_message_encryption_key_default
    BEFORE INSERT OR UPDATE OF message_encryption_key ON public.squads
    FOR EACH ROW
    WHEN (NEW.message_encryption_key IS NULL OR btrim(NEW.message_encryption_key) = '')
    EXECUTE FUNCTION public.squads_set_default_message_encryption_key ();

REVOKE ALL ON FUNCTION public.squads_set_default_message_encryption_key () FROM PUBLIC;

COMMENT ON COLUMN public.squads.message_encryption_key IS
'32-byte AES-256-GCM key (base64 or base64url). Set on INSERT by trigger if omitted; members decrypt via client. Not E2E vs platform — see docs/security/threat-model.md.';
