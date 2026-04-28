# Anonymous sessions → verified accounts

## Production vs demos

- **Anonymous sessions** are useful for **demos**, local testing, and low-friction try-outs.
- **Production** sign-in should use **verified magic links**, **SSO**, or other tenant-approved IdPs — not long-lived anonymous identities for real operations.

## After verification (ZK or email)

1. User completes OAuth or magic-link sign-in (tokens land on `/auth/callback`; use `?next=` to send them to the right screen, e.g. `/onboarding` or `/settings/profile`).
2. Route them to **profile completion** if `profiles` / onboarding gates are incomplete (see `isProfileComplete()` in app code).
3. Existing **squad membership** ties to `auth.users.id`. When the same person upgrades from anonymous to verified, treat it as a **new authenticated user** unless they complete an explicit migration.

### Claim-code migration (DB)

Use when a demo/anonymous session should hand off squad membership to the post-verify account:

- `create_demo_session_claim()` — authenticated user (typically anonymous/demo) obtains a stable claim code (audit `demo_claim_created`).
- `finalize_demo_session_claim(p_claim_code)` — signed-in verified user merges eligible `squad_members` rows **only where** there is no duplicate `[squad_id, verified_user]` membership yet.

Provision UI consent before calling finalize; failures raise SQL exceptions for conflicts.

## Callback URL

- Magic links and OAuth redirects typically hit: `/auth/callback?next=<encoded-path>`
- Ensure `next` is an **internal path** only (the app already rejects `//` and off-origin URLs).

## What carries over after a claim

- **Squad membership** is rewritten to the verified `auth.users.id` by `finalize_demo_session_claim` (audit `demo_claim_finalized`).
- **Existing message rows** keep their original `sender_id` (the anonymous user) — claims do not rewrite history. New messages from the verified account sit alongside the old ones in `messages`, encrypted with the same squad key.
- **Outbound redaction** stays in force for both the anonymous demo session and the post-claim verified account: every message write goes through the `ingest-message` Edge Function (RLS revokes direct INSERTs since migration `20260428194500_messages_insert_edge_only.sql`).
- **Moderator review** still applies — decrypt-for-review writes `message_plaintext_decrypt_review` rows to `moderation_audit_log` with the moderator's justification (see [`docs/security/encryption-scope.md`](../security/encryption-scope.md) and migration `20260428120000_moderator_decrypt_audit_rpc.sql`).

## Related

- Profile schema: `supabase/migrations/*profiles*`
- Sign-in UI: `/sign-in`
- Edge ingest + redaction: [`docs/security/encryption-scope.md`](../security/encryption-scope.md), `supabase/functions/ingest-message/edgeHandler.ts`
