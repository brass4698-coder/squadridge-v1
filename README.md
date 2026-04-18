# SquadRidge

Verified-anonymous cross-border dialogue platform: React, Vite, TypeScript, Tailwind, and **Supabase** (PostgreSQL + RLS, Auth, Realtime, Edge Functions). Optional Redis in `docker-compose.yml` is for local worker experiments only—not required for the app.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com/) project (for auth, data, and Realtime)

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `VITE_SUPABASE_URL` — project URL (`https://<ref>.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (recommended) or legacy `VITE_SUPABASE_ANON_KEY`

For production builds, set the same `VITE_*` values in your host (Vercel, Netlify, etc.); use a **local** `.env` or `.env.production` file for `npm run build` — **do not commit** env files with secrets (`.env.production` is gitignored).

Enable **Anonymous** sign-in under **Authentication → Providers** in the Supabase dashboard (required for the demo squad flow). Apply migrations via CI or manually — see [`supabase/README.md`](supabase/README.md).

### GitHub Actions (Supabase deploy on `main`)

The workflow [`.github/workflows/deploy-supabase-production.yml`](.github/workflows/deploy-supabase-production.yml) needs these **repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Purpose |
| ------ | ------- |
| `SUPABASE_ACCESS_TOKEN` | Classic Supabase PAT (`sbp_*`), not the anon or service_role API key |
| `SUPABASE_DB_PASSWORD` | Database password for linking / migrations |
| `SUPABASE_PROJECT_ID` | 20-character project ref (subdomain only), e.g. from `https://<ref>.supabase.co` |

The workflow validates token shape and project ref format; see comments in the YAML for PAT pitfalls (`sbp_v0_*` experimental tokens are rejected by the CLI).

Create or rotate tokens in the [Supabase dashboard (Account → Access Tokens)](https://supabase.com/dashboard/account/tokens) — use a **classic** PAT with the `sbp_` prefix for CLI and CI.

### Repository hygiene

Never commit `.env*` files with secrets. If `node_modules` shows as tracked, run `git rm -r --cached node_modules` and recommit.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`    | Start Vite dev server    |
| `npm run build`  | Typecheck + production build |
| `npm run preview` | Preview production build |

## After linking Supabase + GitHub

Use this checklist to confirm everything is wired (manual steps in the dashboard where noted):

| Step | Action |
| ---- | ------ |
| 1 | **GitHub:** Repo → **Actions** → **Deploy Supabase to production** succeeds on `main`. If it fails, see [supabase/README.md](supabase/README.md) (secrets, PAT format, migration drift). |
| 2 | **Supabase:** **Table Editor** or **SQL** — tables from `supabase/migrations/` exist (`users`, `squads`, `messages`, …). |
| 3 | **Supabase:** **Authentication → Providers** — **Anonymous** enabled. |
| 4 | **Local:** `.env` targets the **same** project CI deploys. Run `npm run dev`, open `/admin/health` (**moderator** account — connectivity), `/intent` → **Find my squad** (or expand **Session hub** → developer **Create demo squad**) to exercise auth + RLS + Realtime. |

### Frontend hosting (MVP)

Use the same variables as local production builds (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`, and **`VITE_SITE_URL`** set to the deployed origin for magic links). Set them in the host’s project settings (not only in `.env` on your laptop). CI in [`.github/workflows/deploy-supabase-production.yml`](.github/workflows/deploy-supabase-production.yml) deploys **database migrations only**; ship the static app in a separate pipeline or manual deploy.

The [`.github/workflows/deploy-frontend.yml`](.github/workflows/deploy-frontend.yml) workflow runs tests, `npm run build` (with `VITE_ZK_STUB=false`), and uploads the `dist/` folder as a **build artifact** for download or attachment to your host (Vercel/Netlify/Cloudflare Pages typically use the same env vars in project settings instead of this artifact).

## Documentation

Product and technical specs live under [`docs/`](docs/). For **high-stakes security and anonymity claims**, start with [`docs/security/threat-model.md`](docs/security/threat-model.md) (engineering source of truth).

## License

MIT — see [LICENSE](LICENSE).
