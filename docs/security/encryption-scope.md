# Encryption scope

## What is protected

- **Per-squad symmetric encryption (AES-GCM)** stores ciphertext in `messages.payload_ciphertext` (JSON blob). Each message is now stamped with `key_epoch_id` pointing at the row in `squad_key_epochs` whose `encryption_key` was used. Clients with the squad's current epoch key (mirrored to `squads.message_encryption_key` for the fast path) can decrypt new messages; for older epochs they look up `squad_key_epochs` directly (RLS allows squad members + moderators). The operator can read all keys and ciphertext — see the [threat model](threat-model.md).
- Other squad members without the key cannot read message bodies from the database payload alone.
- **Productized key rotation.** `public.rotate_squad_key(p_squad_id, p_reason)` (`20260502120100`) is a moderator-only audited RPC that mints a new 32-byte AES key, retires the previous epoch, and writes a `moderation_audit_log` row (`action=squad_key_rotated`). Rotation triggers a defensive epoch boundary: messages encrypted before the rotation remain decryptable via the retired epoch key (until purged — see "Forward secrecy" below); messages after rotation use the new epoch.
- **Outbound redaction is non-bypassable.** As of migration `20260428194500_messages_insert_edge_only.sql`, RLS denies direct authenticated INSERTs into `public.messages` (`WITH CHECK (false)`). Every chat write goes through the `ingest-message` Edge Function (`supabase/functions/ingest-message/edgeHandler.ts`): decrypt with the squad key → run the same `redactOutgoingLiveMessage` pipeline as the live preview → re-encrypt → service-role insert with `key_epoch_id` stamped. A custom client cannot persist un-redacted ciphertext. The pgTAP test `supabase/tests/database/messages_insert_edge_only.test.sql` enforces this on every CI `db` run.
- **Moderator decrypt for review is audited and epoch-aware.** Migration `20260428120000_moderator_decrypt_audit_rpc.sql` adds an RPC that records a `message_plaintext_decrypt_review` row in `moderation_audit_log` (with required justification ≥ 8 characters) **before** returning plaintext. The client helper `src/lib/moderation/modDecrypt.ts` then resolves the right key for each message: epoch key → archived snapshot → current squad key, in that order, so review still works across rotations and after archive.
- **Archived squads keep a single recovery surface.** `20260502120200_archive_squad_uses_epochs.sql` + `20260503120100_archive_purges_epoch_keys.sql` snapshot the current epoch's key into `squads.archived_encryption_key_snapshot` and purge all per-epoch encryption_key columns for the squad in the same transaction. Moderator decrypt-for-review continues to work via the snapshot column.

## What is not protected (today)

- **Supabase / Postgres at the SQL layer** can read **plaintext** if the application ever writes plaintext to the database or if keys are exposed in logs or misconfigured policies. The audited mod-decrypt RPC narrows this for legitimate review but does not change the underlying trust model.
- **Per-user public-key end-to-end encryption** (so the server never sees decryptable content) is **not** implemented yet. Both the `ingest-message` redaction step and the audited mod-decrypt RPC require the server to hold the squad symmetric key.

## Forward secrecy

- **Interim posture (shipped):** `20260503120000_purge_retired_squad_keys.sql` schedules a daily pg_cron job (`purge-retired-squad-keys`) that nulls the `encryption_key` column on retired `squad_key_epochs` rows for live squads after `purge_after_days` (default 30) and on every per-epoch row for archived squads as soon as `archived_encryption_key_snapshot` is set. The epoch row itself is preserved (so `messages.key_epoch_id` stays a valid reference); only the key material is dropped, with `encryption_key_purged_at` recording when. This bounds the **future-DB-snapshot attack window** and gives ops a single, easier-to-restrict surface (`archived_encryption_key_snapshot`) for any post-archive recovery.
- **What this does not protect against:**
  - An operator who copies the live or retired-but-not-yet-purged key before the purge runs.
  - An attacker who compromises the live `current_epoch_id` key — they can still decrypt messages encrypted under the same epoch.
  - In-transit interception (out of scope for this layer; TLS).
- **Signal-grade forward secrecy** (per-message ratchet) is not provided and is part of the deferred E2E program below.

## Future work (RFC)

- A **stronger key hierarchy** (operator-blind E2E) is under design; see [`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md). Do not claim E2E in marketing until that RFC is implemented and reviewed. The decision to defer that work today, and the triggers that would re-open it, is recorded in [ADR 004](../adr/004-defer-operator-blind-e2e.md). The Track A (rotation) and Track B (interim FS) work shipped here is the safety scaffolding that an E2E migration would otherwise need to build first; it is **not** a substitute for ADR 004.
