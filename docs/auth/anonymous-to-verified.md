# Anonymous sessions → verified accounts

## Production vs demos

- **Anonymous sessions** are useful for **demos**, local testing, and low-friction try-outs.
- **Production** sign-in should use **verified magic links**, **SSO**, or other tenant-approved IdPs — not long-lived anonymous identities for real operations.

## After verification (ZK or email)

1. User completes OAuth or magic-link sign-in (tokens land on `/auth/callback`; use `?next=` to send them to the right screen, e.g. `/onboarding` or `/settings/profile`).
2. Route them to **profile completion** if `profiles` / onboarding gates are incomplete (see `isProfileComplete()` in app code).
3. Existing **squad membership** ties to `auth.users.id`. When the same person upgrades from anonymous to verified, treat it as a **new authenticated user** unless they complete an explicit migration.

### Claim-code migration (DB)

Three RPCs gate the anonymous → verified hand-off (see migrations `20260428124500_demo_session_claim.sql` and `20260428230000_demo_claim_consent_token.sql`):

1. `create_demo_session_claim()` — authenticated user (typically anonymous/demo) obtains a stable claim code (audit `demo_claim_created`).
2. `issue_demo_claim_consent(p_claim_code)` — verified user requests consent. Returns a 32-byte hex `consent_token` with a 5-minute lifetime, bound to `(claim_code, verified_user_id)` in `demo_session_claims` (audit `demo_claim_consent_issued`).
3. `finalize_demo_session_claim(p_claim_code, p_consent_token)` — verified user merges eligible `squad_members` rows **only where** there is no duplicate `[squad_id, verified_user]` membership yet (audit `demo_claim_finalized`).

All three return structured `jsonb`: `{ok: true, ...}` on success or `{ok: false, error_code: ...}` on documented failures (see [`src/lib/sessionClaim.ts`](../../src/lib/sessionClaim.ts) `DemoClaimErrorCode`). User-facing copy is rendered by `describeDemoClaimError`. Network/auth errors still throw — `error_code` is reserved for *expected* user-visible conditions.

The UI must show an explicit consent modal **between** steps 2 and 3 (see [`src/components/settings/DemoClaimConsentModal.tsx`](../../src/components/settings/DemoClaimConsentModal.tsx)) describing what migrates and what does not. Closing the modal counts as cancel; the consent token then expires unused.

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
