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
- [ ] `VITE_SENTRY_DSN` set on the build host. The build refuses to ship a production bundle when DSN is set without `VITE_SENTRY_USER_HASH_SALT` (see [`src/lib/env.ts`](../../src/lib/env.ts)). Setting neither builds without Sentry; do not ship a production release that way.
- [ ] `VITE_SENTRY_USER_HASH_SALT` set on the build host. Use a long opaque random string and treat it like a secret — rotating it changes the salted hash sent to Sentry but leaves prior events untouched (see [`src/lib/sentryUserHash.ts`](../../src/lib/sentryUserHash.ts)).
- [ ] Optional but recommended: `VITE_SENTRY_ENVIRONMENT=production` (or `staging`, `preview`) so events are partitioned in Sentry.
- [ ] If you ship the artifact via [`.github/workflows/deploy-frontend.yml`](../../.github/workflows/deploy-frontend.yml), add `VITE_SENTRY_DSN` and `VITE_SENTRY_USER_HASH_SALT` as GitHub Actions repository secrets and `VITE_SENTRY_ENVIRONMENT` as a repository variable. Secrets passed at workflow build-time are baked into the static bundle.
- [ ] Smoke-test Sentry post-deploy: trigger a known error (e.g. visit a route that throws in dev tools) and confirm it lands in the configured Sentry project with the expected `environment` tag and a hashed (not UUID) user id.
- [ ] Optional: `VITE_SITE_URL` for magic-link redirects when the deploy URL must be exact.

## Smoke tests

- [ ] Sign-in / anonymous fallback paths work for your policy.
- [ ] Session room loads messages; ledger index lists published rows after [`ledger_proposals`](../../supabase/migrations/20260417120500_ledger_proposals.sql) migration.
- [ ] For **ZK verification demos or recordings** (Semaphore + `verify-zk-proof`, not the hash stub): follow [`zk-demo-staging-checklist.md`](zk-demo-staging-checklist.md) and optionally [`zk-verify-demo-script.md`](zk-verify-demo-script.md).

## Ops

- [ ] Moderator `user_id` rows inserted in `moderators` for staff accounts (see moderation migration).
- [ ] Backup and retention expectations documented for your jurisdiction ([`data-retention-operators.md`](data-retention-operators.md)).
- [ ] Retention cleanup is running. Confirm `SELECT * FROM public.pilot_retention_cleanup_24h ORDER BY hour_bucket DESC LIMIT 1;` returns a row newer than 90 minutes (migration `20260429140000_retention_cleanup_metrics.sql` wires the metrics; the underlying TTL cron lives in `20260418090000_ttl_cleanup.sql`).
- [ ] IP-logging surfaces (Supabase logs, hosting provider, CDN, email click tracking) reviewed against [`ip-logging.md`](ip-logging.md); retention windows and admin-access posture match what the partner-facing copy claims.
