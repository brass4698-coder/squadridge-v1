# Production checklist (Phase 1)

Use before tagging a release or pointing a production domain at the app.

## Supabase

- [ ] Migrations applied on the production project (`supabase db push` or CI deploy workflow).
- [ ] `npm run gen:types` run against the linked project so [`src/lib/database.types.ts`](../../src/lib/database.types.ts) matches live schema.
- [ ] Authentication redirect URLs include production origin (see [`docs/technical/auth-and-sessions.md`](../technical/auth-and-sessions.md)).
- [ ] Row Level Security policies enabled on new tables; spot-check with anon and authenticated clients.

## Frontend build

- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or legacy anon JWT) set on the **build** host.
- [ ] `VITE_ZK_STUB` unset or `false` for production bundles (see `vite.config.ts`).
- [ ] Optional: `VITE_SENTRY_DSN`, `VITE_SITE_URL` for observability and magic-link correctness.

## Smoke tests

- [ ] Sign-in / anonymous fallback paths work for your policy.
- [ ] Session room loads messages; ledger index lists published rows after [`ledger_proposals`](../../supabase/migrations/20260416183000_ledger_proposals.sql) migration.
- [ ] For **ZK verification demos or recordings** (Semaphore + `verify-zk-proof`, not the hash stub): follow [`zk-demo-staging-checklist.md`](zk-demo-staging-checklist.md) and optionally [`zk-verify-demo-script.md`](zk-verify-demo-script.md).

## Ops

- [ ] Moderator `user_id` rows inserted in `moderators` for staff accounts (see moderation migration).
- [ ] Backup and retention expectations documented for your jurisdiction ([`data-retention-operators.md`](data-retention-operators.md)).
