# SquadRidge

**Protected dialogue, verifiable outcomes.**

[![CI](https://github.com/brass4698-coder/squadridge-v1/actions/workflows/ci.yml/badge.svg)](https://github.com/brass4698-coder/squadridge-v1/actions/workflows/ci.yml)
[![CodeQL](https://github.com/brass4698-coder/squadridge-v1/actions/workflows/codeql.yml/badge.svg)](https://github.com/brass4698-coder/squadridge-v1/actions/workflows/codeql.yml)

SquadRidge is a **facilitator-led protected dialogue platform** for NGO and peacebuilding teams (and mediators) running high-stakes written conversations. Parties speak in a **private written room** under facilitator control; nothing said in the room is published. When dialogue produces something worth standing behind, the facilitator drafts an **outcome**, captures approvals, and **releases** an **anchored record** — private/partner-shared by default for pilots; optionally listed on the public ledger.

**Private pilot MVP:** NGO internal deliberation → Configure → Verify → Facilitate → Release (private anchored decision memo). See [`docs/product/platform-description.md`](docs/product/platform-description.md) and [`CURRENT_STATUS.md`](CURRENT_STATUS.md).

**Built on React 19 + Vite 6 + TypeScript + Tailwind CSS 3 + Supabase (PostgreSQL + RLS, Auth, Realtime, Edge Functions).**

**Primary paths:** `/request-access` → `/app` (facilitator) → `/p/*` (participant tokens) → private release (or `/ledger` when public).

### Legacy routes (soft-retired in `App.v2` — code kept, not the product story)

| Route | Status |
| ----- | ------ |
| `/match`, `/verify`, `/session/*`, `/onboarding/*` | Redirect to `/request-access` or `/` |
| `/ledger-legacy` | Redirects to `/ledger` |
| `/incident` | Only in unused `App.tsx` router |
| `/admin/csi` | Internal moderator console (not a public product) |

Optional Redis in `docker-compose.yml` is for local worker experiments only — not required for the app.

## Local Development

Full stack on your machine: Vite (port **5173**) + local Supabase via the CLI (Docker) + optional Redis.

### Prerequisites

- **Node.js 22+** and npm 10+
- **Docker Desktop** running (required for `supabase start`)
- Dev dependency **`supabase` CLI** (`package.json` pins `^2.91.3` — run via `npx` / npm scripts)

### 1. Install and env

```bash
npm install
cp .env.example .env
```

Start local Supabase, then copy URLs/keys from status into `.env`:

```bash
npm run supabase:start
npx supabase status -o env
```

Typical local values:

| Variable | Local value |
| -------- | ----------- |
| `VITE_SUPABASE_PROJECT_REF` | `squadridge` (matches `project_id` in `supabase/config.toml`) |
| `VITE_SUPABASE_URL` | `http://127.0.0.1:54321` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_ANON_KEY` | from `supabase status` |
| `VITE_SITE_URL` | `http://localhost:5173` (auth redirects; matches `[auth] site_url`) |

Edge Functions secrets live in gitignored `supabase/functions/.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) — never put `service_role` in `VITE_*`.

### 2. Database reset and types

```bash
npm run db:reset          # apply all migrations + seed
npm run db:types          # regenerate src/types/supabase.ts from local schema
```

Aliases: `npm run supabase:db:reset`, `npm run gen:types:local`.

### 3. Run the app

```bash
npm run dev               # http://localhost:5173
```

Useful companions:

| Command | Purpose |
| ------- | ------- |
| `npm run supabase:status` | API / Studio / DB URLs |
| `npm run supabase:stop` | Stop the local stack |
| `docker compose up -d` | Optional Redis only (not Supabase) |

### Config notes (`supabase/config.toml`)

- `[auth] site_url` = `http://localhost:5173`; `[auth.email] enable_confirmations = false` for local ease
- `[realtime] enabled = true`; `[storage] enabled = false` (app does not use Storage yet)
- Postgres `major_version = 17`; latest migration timestamp documented as `20260718071000`
- Supabase Docker images are selected by the **CLI version**, not `docker-compose.yml`

### Verify

```bash
npm test
npm run lint
npm run build
```

Studio: http://127.0.0.1:54323 — Mailpit (auth emails): http://127.0.0.1:54324

## Prerequisites

- **Node.js 22+** and npm 10+ (enforced via `engines` in `package.json`)
- A [Supabase](https://supabase.com/) project (for auth, data, and Realtime)

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `VITE_SUPABASE_URL` — project URL (`https://<ref>.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — anon/publishable key (preferred; legacy alias `VITE_SUPABASE_ANON_KEY` also accepted)

For production builds, set the same `VITE_*` values in your host (Vercel, Netlify, etc.); use a **local** `.env` or `.env.production` file for `npm run build` — **do not commit** env files with secrets (`.env.production` is gitignored).

Enable **Anonymous** sign-in under **Authentication → Providers** in the Supabase dashboard (required for the demo squad flow). Apply migrations via CI or manually — see [`supabase/README.md`](supabase/README.md).

### GitHub Actions (Supabase deploy on `main`)

The workflow [`.github/workflows/deploy-supabase-production.yml`](.github/workflows/deploy-supabase-production.yml) needs these **repository secrets** (Settings → Secrets and variables → Actions):

| Secret                  | Purpose                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| `SUPABASE_ACCESS_TOKEN` | Classic Supabase PAT (`sbp_*`), not the anon or service_role API key             |
| `SUPABASE_DB_PASSWORD`  | Database password for linking / migrations                                       |
| `SUPABASE_PROJECT_ID`   | 20-character project ref (subdomain only), e.g. from `https://<ref>.supabase.co` |

The workflow validates token shape and project ref format; see comments in the YAML for PAT pitfalls (`sbp_v0_*` experimental tokens are rejected by the CLI).

Create or rotate tokens in the [Supabase dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens) — use a **classic** PAT with the `sbp_` prefix for CLI and CI.

### Repository hygiene

Never commit `.env*` files with secrets. If `node_modules` shows as tracked, run `git rm -r --cached node_modules` and recommit.

## Scripts

### Dev

| Command             | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `npm run dev`       | Start Vite dev server                                             |
| `npm run build`     | Typecheck + production build                                      |
| `npm run build:e2e` | Typecheck + Vite build using `.env.e2e` (Playwright / demo smoke) |
| `npm run preview`   | Preview production build                                          |
| `npm run clean`     | Remove build artifacts                                            |

### Test & Lint

| Command                  | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `npm test`               | Vitest unit tests (single run)                  |
| `npm run test:watch`     | Vitest in watch mode                            |
| `npm run test:coverage`  | Vitest with V8 coverage report                  |
| `npm run e2e`            | Playwright e2e (Chromium)                       |
| `npm run e2e:ui`         | Playwright with interactive UI                  |
| `npm run lint`           | ESLint (zero warnings enforced)                 |
| `npm run lint:fix`       | ESLint with auto-fix                            |
| `npm run format`         | Prettier — format `src/` and docs               |
| `npm run format:root`    | Prettier — format root config files             |
| `npm run format:check`   | Prettier — check only (CI-safe)                 |

### Production readiness checks

| Command                             | What it verifies                                        |
| ----------------------------------- | ------------------------------------------------------- |
| `npm run check:prod-readiness`      | Environment variables and production config             |
| `npm run check:no-zk-stub-prod`     | `VITE_ZK_STUB` is false in the build artifact           |
| `npm run check:no-demo-decoys-prod` | No Semaphore demo group bundled in production           |
| `npm run check:no-raw-console`      | No raw `console.*` calls in data-path code              |
| `npm run check:banned-copy`         | No disallowed marketing copy strings                    |
| `npm run check:database-types`      | Generated DB types match the linked Supabase schema     |
| `npm run check:all`                 | Runs all of the above in sequence                       |

### Supabase

| Command                       | Description                                              |
| ----------------------------- | -------------------------------------------------------- |
| `npm run supabase:start`      | Start local Supabase stack                               |
| `npm run supabase:stop`       | Stop local Supabase stack                                |
| `npm run supabase:status`     | Print local service URLs and status                      |
| `npm run db:reset`            | Reset local DB and re-run all migrations (`supabase db reset`) |
| `npm run supabase:db:reset`   | Alias for `db:reset`                                     |
| `npm run supabase:db:push`    | Push pending migrations to linked project                |
| `npm run db:types`            | Regenerate `src/types/supabase.ts` from local stack      |
| `npm run gen:types:local`     | Alias for `db:types`                                     |
| `npm run gen:types`           | Regenerate `src/types/supabase.ts` from linked project   |

## After linking Supabase + GitHub

Use this checklist to confirm everything is wired (manual steps in the dashboard where noted):

| Step | Action |
| ---- | ------ |
| 1 | **GitHub:** Repo → **Actions** → **Deploy Supabase to production** succeeds on `main`. If it fails, see [supabase/README.md](supabase/README.md) (secrets, PAT format, migration drift). |
| 2 | **Supabase:** **Table Editor** or **SQL** — tables from `supabase/migrations/` exist (`users`, `squads`, `messages`, …). |
| 3 | **Supabase:** **Authentication → Providers** — **Anonymous** enabled. |
| 4 | **Local:** `.env` targets the **same** project CI deploys. Run `npm run dev`, open `/request-access`, sign in as a facilitator, create an **NGO internal deliberation** session at `/app/sessions/new/setup`, and exercise `/p/invite/:token` → `/p/room/:token`. |
| 5 | **Local (release gate):** Run `npm run build`, `npm test`, and `npm run check:all` — should pass before you rely on CI or a deploy. |

### Frontend hosting (MVP)

Use the same variables as local production builds (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and **`VITE_SITE_URL`** set to the deployed origin for magic links). Set them in the host's project settings (not only in `.env` on your laptop). CI in [`.github/workflows/deploy-supabase-production.yml`](.github/workflows/deploy-supabase-production.yml) deploys **database migrations only**; ship the static app in a separate pipeline or manual deploy.

The [`.github/workflows/deploy-frontend.yml`](.github/workflows/deploy-frontend.yml) workflow runs tests, `npm run build` (with `VITE_ZK_STUB=false`), and uploads the `dist/` folder as a **build artifact** for download or attachment to your host (Vercel/Netlify/Cloudflare Pages typically use the same env vars in project settings instead of this artifact).

### Legacy diligence demos (not the pilot path)

Citizen matchmaking, ZK `/verify`, and offline squad mock UIs remain in the codebase for historical diligence but are **soft-retired from the live router**. Prefer the facilitator walkthrough below. Details: [`docs/technical/demo-walkthrough.md`](docs/technical/demo-walkthrough.md) (legacy-labeled).

## Demo Flow (pilot MVP)

Use this walkthrough for an NGO/peacebuilding partner. Target: under **3 minutes** for the public story; **15–20 minutes** for a live facilitator session (requires admin setup).

| Step | What to show | Route / action |
| ---- | ------------ | -------------- |
| **1. Homepage** | Protected room → release gate → record; **Request pilot access** | `/` |
| **2. Request access** | Partner submits interest; explain invite-only pilot | `/request-access` |
| **3. Sign in (admin sends invite)** | Super admin creates staff invite; user lands on facilitator dashboard | `/invite/accept/:token` → `/app` |
| **4. Create NGO session** | Default template **NGO internal deliberation** (private outcome) | `/app/sessions/new/setup` |
| **5. Invite → room → release** | Participant `/p/invite/:token` … `/p/room/:token`; facilitator releases **private anchored** decision memo | `/app/sessions/:id/control`, `/release` |

### Manual steps (not self-serve today)

- **Staff invites:** A `super_admin` must approve access requests and send invite links (`/app/admin/invites`). New accounts start as `pending` until activated.
- **Participant invites:** Facilitator generates per-participant tokens; participants use `/p/*`, not staff sign-in.
- **Public ledger:** Optional; leave “Also publish to the public ledger” unchecked for first pilots.

### Verify locally before a demo

```bash
npm ci
npm run lint
npm test
npm run build
npm run supabase:start   # requires Docker Desktop
npm run supabase:db:reset
npm run dev
```

Investor-only surfaces (`/pitch-deck-hub`, `/financial-projections`, `/decks`) are gated to **`super_admin`** and are not part of this walkthrough.

## Documentation

- **Index:** [`docs/README.md`](docs/README.md) — curated map (product, technical, security, ops, ADRs)
- **Institutional readiness:** [`docs/audit/institutional-readiness-audit.md`](docs/audit/institutional-readiness-audit.md)
- **Contributor orientation:** [`AGENTS.md`](AGENTS.md) — stack, directory map, coding rules
- **Changelog:** [`CHANGELOG.md`](CHANGELOG.md)
- Current status snapshot: [`CURRENT_STATUS.md`](CURRENT_STATUS.md)
- Diligence summary: [`DILIGENCE_OVERVIEW.md`](DILIGENCE_OVERVIEW.md)
- Security reporting: [`SECURITY.md`](SECURITY.md)
- Specs and runbooks: [`docs/`](docs/)
- Security boundaries and non-goals: [`docs/security/threat-model.md`](docs/security/threat-model.md)
- Pilot operations: [`docs/operations/pilot-runbook.md`](docs/operations/pilot-runbook.md)
- Incident handling: [`docs/operations/incidents.md`](docs/operations/incidents.md)
- Metrics definition: [`docs/product/metrics-spec.md`](docs/product/metrics-spec.md)
- Partner and fundraising support: [`docs/business/pilot-partner-one-pager.md`](docs/business/pilot-partner-one-pager.md), [`docs/business/data-room-index.md`](docs/business/data-room-index.md), [`docs/pitch/`](docs/pitch/)
- **Pitch materials (invite / super_admin):** Interactive hub at `/pitch-deck-hub`; HTML decks are gated via Edge Function `serve-deck` (not public static files) — deferred until post-pilot; not linked from member nav.

## Contributing

- Branching, checks, and PR flow: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- PR template: [`.github/pull_request_template.md`](.github/pull_request_template.md)
- Branch protection setup (one-time, repo owner): [`docs/operations/branch-protection.md`](docs/operations/branch-protection.md)
- Security reporting: [`SECURITY.md`](SECURITY.md)

Security-touching changes (RLS, migrations, Edge functions, ZK, encryption, auth) must go through a PR even if you have direct push access — see the **Security-touching change?** section of the PR template.

## License

MIT — see [LICENSE](LICENSE).
