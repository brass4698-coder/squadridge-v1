# Supabase (SquadRidge)

## CLI layout

This repo includes [`config.toml`](./config.toml) from `supabase init`. Migrations live in [`migrations/`](./migrations/).

- **Local dev:** [Supabase CLI](https://supabase.com/docs/guides/cli) — e.g. `supabase start`, `supabase db reset` (uses [`seed.sql`](./seed.sql) when present).
- **Remote schema:** If you previously changed production only in the Dashboard, reconcile with `supabase db pull` before editing migrations (see [managing environments](https://supabase.com/docs/guides/cli/cicd-workflows)).

## Apply migrations (manual)

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. In **SQL Editor**, paste and run [`migrations/20250413000000_initial_schema.sql`](./migrations/20250413000000_initial_schema.sql).
3. If `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages` fails, enable **Realtime** for `messages` under **Database → Replication** instead.
4. **Authentication → Providers:** enable **Anonymous sign-ins** (required for the demo app flow).
5. Copy **Project URL** and API keys into the app `.env` (`VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY` or legacy `VITE_SUPABASE_ANON_KEY`).

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
