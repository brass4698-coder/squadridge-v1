# Encryption scope

## What is protected

- **Per-squad symmetric encryption (AES-GCM)** stores ciphertext in `messages.payload_ciphertext` (JSON blob). Clients with the squad’s `message_encryption_key` can decrypt; the operator can also read keys and ciphertext — see the [threat model](threat-model.md).
- Other squad members without the key cannot read message bodies from the database payload alone.
- **Outbound redaction is non-bypassable.** As of migration `20260428194500_messages_insert_edge_only.sql`, RLS denies direct authenticated INSERTs into `public.messages` (`WITH CHECK (false)`). Every chat write goes through the `ingest-message` Edge Function (`supabase/functions/ingest-message/edgeHandler.ts`): decrypt with the squad key → run the same `redactOutgoingLiveMessage` pipeline as the live preview → re-encrypt → service-role insert. A custom client cannot persist un-redacted ciphertext. The pgTAP test `supabase/tests/database/messages_insert_edge_only.test.sql` enforces this on every CI `db` run.
- **Moderator decrypt for review is audited.** Migration `20260428120000_moderator_decrypt_audit_rpc.sql` adds an RPC that records a `message_plaintext_decrypt_review` row in `moderation_audit_log` (with required justification ≥ 8 characters) **before** returning plaintext, so any legitimate review leaves a tamper-resistant trail. The mod dashboard surfaces this through `src/lib/moderation/modDecrypt.ts` + `src/pages/ModDashboardPage.tsx`.
- **Archived squads keep decryptable history.** Migration `20260428123000_archive_squad_encryption_snapshot.sql` snapshots the squad message key (and epoch metadata) at archive time, so historical decrypt-for-review continues to work after a squad ends without retaining the live key indefinitely.

## What is not protected (today)

- **Supabase / Postgres at the SQL layer** can read **plaintext** if the application ever writes plaintext to the database or if keys are exposed in logs or misconfigured policies. The audited mod-decrypt RPC narrows this for legitimate review but does not change the underlying trust model.
- **Per-user public-key end-to-end encryption** (so the server never sees decryptable content) is **not** implemented yet. Both the `ingest-message` redaction step and the audited mod-decrypt RPC require the server to hold the squad symmetric key.

## Forward secrecy

- If the **squad key is compromised**, an attacker can decrypt **historical** messages encrypted with that key.
- For high-stakes sessions, consider **key rotation** or **archiving** after the session ends once those flows exist in the product.

## Future work (RFC)

- A **stronger key hierarchy** (operator-blind E2E) is under design; see [`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md). Do not claim E2E in marketing until that RFC is implemented and reviewed.
