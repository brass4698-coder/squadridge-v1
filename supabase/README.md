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

**Troubleshooting:** If the workflow prints `Cannot find project ref`, the usual causes are (1) one or more of the three secrets above are missing or misspelled in the repo (names must match exactly), or (2) `link` needs the database password in CI — the workflow passes `--password` from `SUPABASE_DB_PASSWORD`. Re-save secrets and re-run the workflow.

This workflow is the **CLI + Actions** path for a single production project. It is **not** [Supabase Branching](https://supabase.com/docs/guides/deployment/branching/github-integration) (preview databases per git branch). For full CLI + migration docs, see [CI/CD workflows](https://supabase.com/docs/guides/cli/cicd-workflows) and [managing environments](https://supabase.com/docs/guides/deployment/managing-environments).

### Storage and config

Bucket **policies** and other SQL objects belong in **migrations** so `db push` applies them. Dashboard-only bucket clicks are not replayed by the CLI unless captured as SQL.
