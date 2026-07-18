# Encryption scope

## What is protected

- **Per-squad symmetric encryption (AES-GCM)** stores ciphertext in `messages.payload_ciphertext` (JSON blob). Clients with the squad’s `message_encryption_key` can decrypt; the operator can also read keys and ciphertext — see the [threat model](threat-model.md).
- Other squad members without the key cannot read message bodies from the database payload alone.
- **Outbound redaction is non-bypassable.** As of migration `20260428194500_messages_insert_edge_only.sql`, RLS denies direct authenticated INSERTs into `public.messages` (`WITH CHECK (false)`). Every chat write goes through the `ingest-message` Edge Function (`supabase/functions/ingest-message/edgeHandler.ts`): decrypt with the squad key → run the same `redactOutgoingLiveMessage` pipeline as the live preview → re-encrypt → service-role insert. A custom client cannot persist un-redacted ciphertext. The pgTAP test `supabase/tests/database/messages_insert_edge_only.test.sql` enforces this on every CI `db` run.
- **Moderator decrypt for review is audited.** Migration `20260428120000_moderator_decrypt_audit_rpc.sql` adds an RPC that records a `message_plaintext_decrypt_review` row in `moderation_audit_log` (with required justification ≥ 8 characters) **before** returning plaintext, so any legitimate review leaves a tamper-resistant trail. The mod dashboard surfaces this through `src/lib/moderation/modDecrypt.ts` + `src/pages/ModDashboardPage.tsx`.
- **Archived squads keep decryptable history.** Migration `20260428123000_archive_squad_encryption_snapshot.sql` snapshots the squad message key (and epoch metadata) at archive time, so historical decrypt-for-review continues to work after a squad ends without retaining the live key indefinitely.

## Demo session claim (anonymous → verified)

Demo / anonymous users can migrate eligible `squad_members` rows onto a verified account via the claim-code flow documented in [`docs/auth/anonymous-to-verified.md`](../auth/anonymous-to-verified.md):

1. `create_demo_session_claim` → claim code
2. `issue_demo_claim_consent` → short-lived consent token
3. `finalize_demo_session_claim` → membership rewrite (no message history rewrite)

Encryption implications:

- Existing message rows keep their original `sender_id` and the same squad `message_encryption_key`.
- Post-claim writes still go only through `ingest-message` (edge-only INSERT).
- Moderator decrypt audit continues to apply to both pre-claim and post-claim ciphertext.

## Semaphore demo decoys (`VITE_SEMAPHORE_DEMO_GROUP`)

This flag is **not** about message encryption. It gates the **bundled-in-source Semaphore decoys** used to pad anonymity groups during demos (`squadridge-decoy-{a,b,c}` in `src/lib/zk/buildAnonymityGroup.ts`).

| Environment | Expected setting |
| ----------- | ---------------- |
| Real pilots / production | `VITE_SEMAPHORE_DEMO_GROUP` unset or `false`; use issuer-managed groups ([RFC](../technical/rfc-issuer-managed-anonymity-group.md)) |
| Local / Vitest / Playwright | Demo decoys allowed in DEV / `MODE=test` / `MODE=e2e` |
| Explicit internal demo build | Both `VITE_SEMAPHORE_DEMO_GROUP=true` **and** `VITE_ALLOW_DEMO_DECOYS_IN_PROD=true` (CI rejects the latter for normal prod release jobs) |

Bundled decoys **collapse** the anonymity set (three of four members are public). Do not enable them for high-stakes cohorts. See threat model §13.1.

## What is not protected (today)

- **Supabase / Postgres at the SQL layer** can read **plaintext** if the application ever writes plaintext to the database or if keys are exposed in logs or misconfigured policies. The audited mod-decrypt RPC narrows this for legitimate review but does not change the underlying trust model.
- **Per-user public-key end-to-end encryption** (so the server never sees decryptable content) is **not** implemented yet. Both the `ingest-message` redaction step and the audited mod-decrypt RPC require the server to hold the squad symmetric key.

## Forward secrecy

- If the **squad key is compromised**, an attacker can decrypt **historical** messages encrypted with that key.
- For high-stakes sessions, consider **key rotation** or **archiving** after the session ends once those flows exist in the product.

## Future work (RFC)

- A **stronger key hierarchy** (operator-blind E2E) is under design; see [`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md). Do not claim E2E in marketing until that RFC is implemented and reviewed. The decision to defer that work today, and the triggers that would re-open it, is recorded in [ADR 004](../adr/004-defer-operator-blind-e2e.md).
