# Demo account operations

The "Try the Demo" button on `/sign-in` (added in Phase 5) signs the user in
as a pre-seeded Supabase account with example sessions, participants, and
outcome records. This doc covers how to create / refresh / rotate that
account.

## One-time setup

1. Copy the service role key from the Supabase dashboard into `.env.local`
   (already gitignored — do **not** commit):

   ```
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...   # dashboard → Settings → API
   DEMO_EMAIL=demo@squadridge.com          # optional; matches src/lib/demoLogin.ts default
   DEMO_PASSWORD=SquadRidgeDemo2026!       # optional; matches default; rotate for prod
   ```

2. Run the seed:

   ```bash
   node --env-file=.env.local scripts/seedDemo.mjs
   ```

3. Set the same `DEMO_EMAIL` / `DEMO_PASSWORD` as `VITE_DEMO_EMAIL` /
   `VITE_DEMO_PASSWORD` in your **frontend** env (or leave them unset to
   use the defaults) so the client's `signInWithDemo` call matches the
   seeded credentials.

The script is idempotent — safe to re-run any time to reset the demo
state.

## What gets seeded

- **User**: `demo@squadridge.com`, `status='active'`, `primary_role='participant'`
- **Role**: participant only (no facilitator / admin powers)
- **Sessions** (3): landlord-tenant, business partnership, workplace conflict
- **Participants** (2 per session): pseudonymous codenames, verified status
- **Outcome records** (1 per session): draft, pending_approval, published — one of each

The demo user is **not** a super_admin or facilitator. If you need a demo
admin, seed a separate account and grant roles via the invite-only auth
migration RPCs (`create_invite` + `accept_invite`, or the new
`grant_role_to_user` RPC from `feat/phase3-role-management`).

## Rotating the password

Change `DEMO_PASSWORD` in `.env.local` and re-run the seed. The script
does not update the password on an existing user via createUser (that
call errors on "already exists"); to change the password on an existing
demo user, use the admin dashboard or extend `seedDemo.mjs` to call
`admin.auth.admin.updateUserById(...)`.

## Removing the demo account entirely

Delete the user in the Supabase dashboard (Auth → Users). Cascade
deletes on `profiles` and `user_roles` will clean up the related rows.
Sessions and outcomes referencing the demo user's id remain but become
orphaned — either accept that or run a manual cleanup query first.

## Detection in the client

`isDemoUser(session)` (from `src/lib/demoLogin.ts`) matches on
`session.user.email` lowercased. Used by:

- `DemoBanner` — persistent top strip shown app-wide for demo sessions
- `UserAvatarMenu` — shows a "Demo" pill next to the avatar

Neither surfaces the demo password anywhere in the UI.
