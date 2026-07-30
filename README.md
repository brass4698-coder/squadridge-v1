# MENDguild

**Stop conflicts before they start.**

[![CI](https://github.com/brass4698-coder/squadridge-v1/actions/workflows/ci.yml/badge.svg)](https://github.com/brass4698-coder/squadridge-v1/actions/workflows/ci.yml)
[![CodeQL](https://github.com/brass4698-coder/squadridge-v1/actions/workflows/codeql.yml/badge.svg)](https://github.com/brass4698-coder/squadridge-v1/actions/workflows/codeql.yml)

MENDguild is an early-warning system that detects rising violence in communities across conflict zones and activates rapid de-escalation. We bring verified citizens from opposite sides of a conflict into real-time dialogue at the exact moment tensions are escalating. When we detect that a community is crossing the violence threshold, we activate mediators to intervene immediately. We measure outcomes: lives saved, violence prevented, conflicts de-escalated.

**Built on React 19 + Vite 6 + TypeScript + Tailwind CSS 3 + Supabase (PostgreSQL + RLS, Auth, Realtime, Edge Functions) + Semaphore ZK proofs.**

**How it works (at a glance):** (1) **Detect** — program-scoped signals and (where enabled) a Conflict Severity Index methodology for triage, not a public omniscient feed. (2) **Intervene** — facilitator-led, verified small squads with structured session UX. (3) **Measure** — pre-registered metrics and partner-aligned evaluation. See [`docs/product/conflict-severity-index.md`](docs/product/conflict-severity-index.md) and [`CURRENT_STATUS.md`](CURRENT_STATUS.md) for what is shipped today vs pilot/roadmap.

Optional Redis in `docker-compose.yml` is for local worker experiments only — not required for the app.

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

| Command                       | Description                                |
| ----------------------------- | ------------------------------------------ |
| `npm run supabase:start`      | Start local Supabase stack                 |
| `npm run supabase:stop`       | Stop local Supabase stack                  |
| `npm run supabase:status`     | Print local service URLs and status        |
| `npm run supabase:db:reset`   | Reset local DB and re-run all migrations   |
| `npm run supabase:db:push`    | Push pending migrations to linked project  |
| `npm run gen:types`           | Regenerate `database.types.ts` from linked project |
| `npm run gen:types:local`     | Regenerate `database.types.ts` from local stack    |

## After linking Supabase + GitHub

Use this checklist to confirm everything is wired (manual steps in the dashboard where noted):

| Step | Action |
| ---- | ------ |
| 1 | **GitHub:** Repo → **Actions** → **Deploy Supabase to production** succeeds on `main`. If it fails, see [supabase/README.md](supabase/README.md) (secrets, PAT format, migration drift). |
| 2 | **Supabase:** **Table Editor** or **SQL** — tables from `supabase/migrations/` exist (`users`, `squads`, `messages`, …). |
| 3 | **Supabase:** **Authentication → Providers** — **Anonymous** enabled. |
| 4 | **Local:** `.env` targets the **same** project CI deploys. Run `npm run dev`, open `/admin/health` (**moderator** account — connectivity), `/find-squad` (**Find my squad**), or expand **Session hub** → developer **Create demo squad** to exercise auth + RLS + Realtime. |
| 5 | **Local (release gate):** Run `npm run build`, `npm test`, and `npm run check:all` — should pass before you rely on CI or a deploy. |

### Frontend hosting (MVP)

Use the same variables as local production builds (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and **`VITE_SITE_URL`** set to the deployed origin for magic links). Set them in the host's project settings (not only in `.env` on your laptop). CI in [`.github/workflows/deploy-supabase-production.yml`](.github/workflows/deploy-supabase-production.yml) deploys **database migrations only**; ship the static app in a separate pipeline or manual deploy.

The [`.github/workflows/deploy-frontend.yml`](.github/workflows/deploy-frontend.yml) workflow runs tests, `npm run build` (with `VITE_ZK_STUB=false`), and uploads the `dist/` folder as a **build artifact** for download or attachment to your host (Vercel/Netlify/Cloudflare Pages typically use the same env vars in project settings instead of this artifact).

### Demos (investors and staging)

- **Offline squad UI:** `/session/demo-session-001` on your dev server or deploy is always routed to the static **DemoSessionPage** — a browser-only mock with seeded messages; copy on the page points to the real security model. This does **not** require `VITE_ENABLE_DEMO_SQUAD`.
- **Guided tour:** From the home page, **Start guided tour** runs the scripted steps in [`src/demo/demoScript.ts`](src/demo/demoScript.ts), including onboarding, **ZK verification** (`/verify?demo=1`), intent, match, the offline session, ledger, security, and profile.
- **Developer shortcuts:** Set `VITE_ENABLE_DEMO_SQUAD=true` to show extra affordances — see [`.env.example`](.env.example).

## Documentation

- **Index:** [`docs/README.md`](docs/README.md) — curated map (product, technical, security, ops, ADRs)
- **AI agent context:** [`AGENTS.md`](AGENTS.md) — stack, directory map, rules for Cursor / Copilot / Claude
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
- **Pitch materials:** Interactive hub at `/pitch-deck-hub` in the app (`src/pages/PitchDeckHubPage.tsx`); static HTML decks under `public/pitch-deck-hub/`

## Contributing

- Branching, checks, and PR flow: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- PR template: [`.github/pull_request_template.md`](.github/pull_request_template.md)
- Branch protection setup (one-time, repo owner): [`docs/operations/branch-protection.md`](docs/operations/branch-protection.md)
- Security reporting: [`SECURITY.md`](SECURITY.md)

Security-touching changes (RLS, migrations, Edge functions, ZK, encryption, auth) must go through a PR even if you have direct push access — see the **Security-touching change?** section of the PR template.

## License

MIT — see [LICENSE](LICENSE).
