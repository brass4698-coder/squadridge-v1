# Supabase (SquadRidge)

## CLI layout

This repo includes [`config.toml`](./config.toml) from `supabase init`. Migrations live in [`migrations/`](./migrations/).

- **Local dev:** [Supabase CLI](https://supabase.com/docs/guides/cli) is a **devDependency**; use `npm run supabase:start` (or `npx supabase start`) from the repo root if `supabase` is not on your PATH. Same for `npm run supabase:db:reset` (uses [`seed.sql`](./seed.sql) when present), `supabase:stop`, `supabase:status`.
- **Remote schema:** If you previously changed production only in the Dashboard, reconcile with `supabase db pull` before editing migrations (see [managing environments](https://supabase.com/docs/guides/cli/cicd-workflows)).

## Apply migrations (manual)

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. In **SQL Editor**, paste and run [`migrations/20250413000000_initial_schema.sql`](./migrations/20250413000000_initial_schema.sql).
3. If `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages` fails, enable **Realtime** for `messages` under **Database → Replication** instead.
4. **Authentication → Providers:** enable **Anonymous sign-ins** (required for the demo app flow).
5. **Authentication → URL configuration:** add your app origins to **Redirect URLs** (and **Site URL**). The app uses **`/auth/callback`** for magic-link return, e.g. `http://localhost:5173/auth/callback` and `https://your-domain.com/auth/callback`. Optional: set `VITE_SITE_URL` in `.env` when the deployed origin must match exactly.
6. **Email:** enable the **Email** provider so passwordless sign-in works.
7. Copy **Project URL** and API keys into the app `.env` (`VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY` or legacy `VITE_SUPABASE_ANON_KEY`).
8. Apply later migrations (e.g. [`migrations/20250414100000_zk_server_verified_insert.sql`](./migrations/20250414100000_zk_server_verified_insert.sql), [`migrations/20260415120000_profiles_phase1.sql`](./migrations/20260415120000_profiles_phase1.sql)) via `supabase db push` or the SQL Editor.

**Regenerate TypeScript types** after schema changes (requires [Supabase CLI](https://supabase.com/docs/guides/cli) and `supabase link`):

```bash
npm run gen:types
```

9. Deploy Edge Functions after linking the project: `supabase functions deploy` (includes [`functions/verify-zk-proof`](./functions/verify-zk-proof/index.ts), [`functions/zk-verify`](./functions/zk-verify/index.ts), [`functions/rate-limit`](./functions/rate-limit/index.ts), and optional [`functions/match-notify`](./functions/match-notify/index.ts) for Database Webhooks on `match_queue`). Supabase injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` automatically. **Also set:**
   - **`ALLOWED_ORIGINS`** — comma-separated browser origins allowed for CORS on ZK functions (e.g. `http://localhost:5173,https://your-app.netlify.app`). See [`functions/_shared/cors.ts`](./functions/_shared/cors.ts).
   - **`UPSTASH_REDIS_REST_URL`** / **`UPSTASH_REDIS_REST_TOKEN`** — optional; required for enforcement in [`functions/rate-limit`](./functions/rate-limit/index.ts) (otherwise the function returns 503 and the app fails open).
   - **`MATCH_QUEUE_WEBHOOK_SECRET`** — optional; set for [`functions/match-notify`](./functions/match-notify/index.ts) and send the same value as request header `x-match-queue-secret` from Database Webhooks (see [`docs/technical/matchmaking-automation.md`](../docs/technical/matchmaking-automation.md)).

The app route **`/verify`** calls `verify-zk-proof` via [`src/lib/zkAdapter.ts`](../src/lib/zkAdapter.ts); without a deployed function (or offline), verification fails unless `VITE_ZK_STUB=true` (local dev hash-only path).

## Database advisor / linter notes

Some [Supabase database linter](https://supabase.com/docs/guides/database/database-linter) findings are expected for this app:

- **`auth_allow_anonymous_sign_ins`:** The product uses **anonymous sign-in** for demo squads and low-friction flows. RLS policies that apply to `anon` (and `authenticated`) are intentional. Tightening would mean revoking `anon` access or disabling anonymous auth in the Dashboard—only do that when you drop anonymous demos entirely.
- **`auth.users` policies:** Managed by Supabase; warnings on `auth` schema are informational.
- **Leaked password protection:** Enable under **Authentication → Providers → Email** (or Auth settings) → **Password** / security options in the [Dashboard](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)—not controlled by repo migrations.

The **`rls_policy_always_true`** on `waitlist_signups` was addressed in [`migrations/20260416120000_waitlist_signups_insert_rls.sql`](./migrations/20260416120000_waitlist_signups_insert_rls.sql); apply via `supabase db push` or SQL Editor.

### Waitlist (landing)

Waitlist objects ship in these migrations (applied in timestamp order with the rest of the chain):

- [`migrations/20250413120000_waitlist_signups.sql`](./migrations/20250413120000_waitlist_signups.sql) — table + RLS insert policy
- [`migrations/20250413140000_waitlist_signup_count_fn.sql`](./migrations/20250413140000_waitlist_signup_count_fn.sql) — `waitlist_signup_count()` for the hero counter
- [`migrations/20260416120000_waitlist_signups_insert_rls.sql`](./migrations/20260416120000_waitlist_signups_insert_rls.sql) — tighter insert `WITH CHECK`

**CLI (remote):** from the repository root, run `npx supabase link` once (project ref + database password), then `npm run supabase:db:push` to apply pending migrations.

**Verify:** with `VITE_SUPABASE_URL` and a publishable/anon key in `.env`, run `npm run waitlist:smoke` to check the RPC and inserts.

**Export emails (operators):** run [`scripts/waitlist-export.sql`](../scripts/waitlist-export.sql) in the SQL Editor (or use **Table Editor → Export** on `waitlist_signups`).

## CI/CD (GitHub Actions)

Pushes to **`main`** run [`.github/workflows/deploy-supabase-production.yml`](../.github/workflows/deploy-supabase-production.yml): `supabase link` → `supabase db push` → `supabase functions deploy` (only if `supabase/functions/<name>/index.ts` exists).

### Repository secrets

| Secret | Description |
| ------ | ------------- |
| `SUPABASE_ACCESS_TOKEN` | Personal access token from [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_ID` | **Project ref only** — the 20-character subdomain (e.g. `abcd…wxyz`), same as in `https://<ref>.supabase.co`. Not the full URL, not the project UUID. The workflow strips `https://…\.supabase\.co` if you paste a URL by mistake. |
| `SUPABASE_DB_PASSWORD` | Database password (Dashboard → **Project Settings → Database**) |

Do **not** commit secrets; only add them under **GitHub → Settings → Secrets and variables → Actions**.

### Troubleshooting (workflow fails)

1. **Secret names** must match exactly: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, `SUPABASE_DB_PASSWORD` (repository secrets on **this** repo — not Organization secrets unless scoped to the repo; forks do not receive parent secrets on `pull_request`).

2. **Access token type:** Use a **personal access token** from [Account → Access Tokens](https://supabase.com/dashboard/account/tokens). It should start with `sbp_` (**classic**). Tokens starting with **`sbp_v0_`** (experimental) are **not** accepted by the Supabase CLI — generate a new classic token. Do **not** use the anon key or service_role key here.

3. **Project ref:** Exactly **20** characters, lowercase alphanumeric (subdomain of `https://<ref>.supabase.co`). Not the UUID from the dashboard.

4. **Database password:** The **Postgres** password from **Project Settings → Database** (the one you use with `psql`). If you reset it in Supabase, update the GitHub secret.

5. **`supabase link` fails:** Re-run the workflow via **Actions → Deploy Supabase to production → Run workflow** and enable **debug_link** for verbose `link` output.

6. **`supabase db push` fails** with migration / history errors: Often the remote DB was changed manually (e.g. SQL Editor) while git has different migrations. Options: align remote with [`supabase migration repair`](https://supabase.com/docs/reference/cli/supabase-migration-repair), or baseline — see [managing environments](https://supabase.com/docs/guides/deployment/managing-environments). If the initial migration was **already applied** manually before CI, the migration history table may need repairing so `db push` can proceed.

7. **`Cannot find project ref`:** Usually empty/wrong secrets or invalid token (see above).

This workflow is the **CLI + Actions** path for a single production project. It is **not** [Supabase Branching](https://supabase.com/docs/guides/deployment/branching/github-integration) (preview databases per git branch). For full CLI + migration docs, see [CI/CD workflows](https://supabase.com/docs/guides/cli/cicd-workflows) and [managing environments](https://supabase.com/docs/guides/deployment/managing-environments).

### Storage and config

Bucket **policies** and other SQL objects belong in **migrations** so `db push` applies them. Dashboard-only bucket clicks are not replayed by the CLI unless captured as SQL.
