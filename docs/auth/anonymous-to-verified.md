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

## Related

- Profile schema: `supabase/migrations/*profiles*`
- Sign-in UI: `/sign-in`
