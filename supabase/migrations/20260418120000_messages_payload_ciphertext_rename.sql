-- Honest naming: column holds AES-GCM ciphertext JSON from the client, not E2E against the operator — see threat model.

ALTER TABLE public.messages RENAME COLUMN encrypted_content TO payload_ciphertext;

COMMENT ON COLUMN public.messages.payload_ciphertext IS
'Client-produced ciphertext (JSON: v3 AES-GCM blob or legacy v1). Squad key is readable via RLS — not end-to-end from the platform.';
