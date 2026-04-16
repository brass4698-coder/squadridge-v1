# Anonymous sessions → verified accounts

## Production vs demos

- **Anonymous sessions** are useful for **demos**, local testing, and low-friction try-outs.
- **Production** sign-in should use **verified magic links**, **SSO**, or other tenant-approved IdPs — not long-lived anonymous identities for real operations.

## After verification (ZK or email)

1. User completes OAuth or magic-link sign-in (tokens land on `/auth/callback`; use `?next=` to send them to the right screen, e.g. `/onboarding` or `/settings/profile`).
2. Route them to **profile completion** if `profiles` / onboarding gates are incomplete (see `isProfileComplete()` in app code).
3. Existing **squad membership** ties to `auth.users.id`. When the same person upgrades from anonymous to verified, treat it as a **new authenticated user** unless you implement an explicit account-linking or migration flow (not bundled here).

## Callback URL

- Magic links and OAuth redirects typically hit: `/auth/callback?next=<encoded-path>`
- Ensure `next` is an **internal path** only (the app already rejects `//` and off-origin URLs).

## Related

- Profile schema: `supabase/migrations/*profiles*`
- Sign-in UI: `/sign-in`
