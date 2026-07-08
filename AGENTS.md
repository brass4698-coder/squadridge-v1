# SquadRidge — Developer Context

This file is the fastest way to get oriented in the codebase. It covers the stack,
where things live, how the design system works, and the rules that keep the codebase
consistent. Read it before making significant changes.

## What is SquadRidge?

A peace-tech platform for **verified anonymous dialogue** across conflict lines.
Users join verified groups (called squads), get matched with counterparts, and hold
structured conversations recorded in a tamper-evident ledger. Zero-knowledge proofs
(Semaphore) prove group membership without revealing identity.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | Tailwind CSS 3 + custom CSS token system (`src/styles/tokens.css`) |
| Routing | React Router v7 |
| State / data | TanStack Query v5 + Supabase realtime |
| Backend | Supabase (PostgreSQL + RLS + Edge Functions in Deno) |
| ZK proofs | `@semaphore-protocol` v4 (identity, group, proof) |
| Auth | Supabase Auth (magic link + OAuth) |
| Error tracking | Sentry React SDK |
| Animations | Motion (Framer Motion successor) |
| Testing | Vitest (unit) + Playwright (e2e) |
| CI | GitHub Actions — see `.github/workflows/ci.yml` |
| Deployment | Vercel (frontend) + Supabase Cloud (DB + functions) |

## Design System

- **Token source of truth**: `src/styles/tokens.css` — CSS custom properties with `--sr-` prefix
- **Tailwind bridge**: `tailwind.config.ts` maps `--sr-*` vars to utility classes (`bg-surface`, `text-brand`, etc.)
- **Default theme**: dark (graphite `#0c0e12` base), `.theme-light` for marketing/ledger surfaces
- **Accent**: single slate-teal `--sr-primary: #2aa39a` — one accent, full stop
- **Fonts**: IBM Plex Sans (UI), IBM Plex Serif (display/marketing), IBM Plex Mono (ledger/code)
- **Motion**: use `motion` (Framer) + `animate-step-in` / `animate-step-in-body` Tailwind utilities

## Directory Map

```
src/
  App.tsx              # Root router — all page routes defined here
  components/          # Shared UI primitives and layout shells
  pages/               # Route-level page components
  onboarding/          # Lazy-loaded onboarding flow
  hooks/               # Custom React hooks
  contexts/            # React Context providers (Auth, Demo)
  lib/                 # Supabase client, feature flags, ZK utilities
  utils/               # Pure utility functions
  styles/
    tokens.css         # CSS custom properties — single source of truth
    globals.css        # Base resets, typography, Tailwind @layer
  workers/             # Web Workers (ZK proof generation)
  demo/                # Demo walkthrough context (dev/staging only)
  pitch-deck-hub/      # Internal pitch deck viewer (auth-gated)
supabase/
  migrations/          # 42 ordered SQL migrations
  functions/           # Deno Edge Functions
  seed.sql             # Local dev seed
.github/
  workflows/
    ci.yml             # Primary CI: lint, typecheck, test, build, e2e, security, db
    deploy-frontend.yml
    deploy-staging.yml
    deploy-supabase-production.yml
    codeql.yml         # CodeQL static analysis
```

## Feature Flags

All flags are `VITE_*` env vars resolved at build time:

| Flag | Purpose |
|---|---|
| `VITE_ZK_STUB` | `true` = stub ZK proofs in dev. Never ship this as true. |
| `VITE_ENABLE_DEMO_SQUAD` | `true` = mount `/session/demo-session-001` route |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |

## CI Gates (ci.yml)

1. **lint** — ESLint, zero warnings
2. **check:banned-copy** — no marketing copy that violates brand guidelines
3. **check:prod-readiness** — production environment validation
4. **check:no-zk-stub-prod** — `VITE_ZK_STUB` must be false in release artifacts
5. **check:no-demo-decoys-prod** — no Semaphore demo group bundled in production
6. **check:no-raw-console** — no `console.*` in data paths
7. **test** — Vitest unit tests
8. **build** — production Vite build
9. **e2e** — Playwright Chromium
10. **security** — dependency-review + npm audit
11. **db** — local Supabase migrations + pgTAP + type drift check

## Coding Rules

These exist because past PRs broke things in predictable ways. Please follow them.

- **One accent only** — `--sr-primary` is the only hue in UI chrome. Charts can use
  the semantic palette (`--sr-success`, `--sr-warning`, `--sr-danger`, `--sr-info`).
- **No raw hex in components** — always use a `--sr-*` token or a Tailwind alias
  (`bg-surface`, `text-brand`, `border-line`, etc.). Raw hex in JSX/CSS will be flagged in review.
- **Never set `VITE_ZK_STUB=true` in production paths** — `check:no-zk-stub-prod` will catch it,
  but don't rely on CI to enforce something this important.
- **Migrations are append-only** — never edit an existing file in `supabase/migrations/`.
  Always add a new timestamped file.
- **RLS is mandatory** — every new table needs `alter table ... enable row level security`
  and at least one policy in the same migration.
- **IBM Plex fonts only** — don't introduce a new font family without also updating
  `tailwind.config.ts` and `tokens.css`.
- **TypeScript strict** — no `any`, no `@ts-ignore` without an explanatory comment.
- **Test new utilities** — any new file in `src/utils/` or `src/lib/` needs a corresponding
  test in `src/test/`.

## Cursor Cloud specific instructions

Environment prerequisites (Node 22 / npm 10, Docker, Supabase CLI) are already
installed on the VM; the startup update script runs `npm install`. Standard
dev/test/lint/build commands live in `README.md` (Scripts) and `package.json`.
The notes below are the non-obvious gotchas discovered during setup.

- **Active app entry is `src/App.v2.tsx`, not `src/App.tsx`.** `src/main.tsx`
  does `import App from './App.v2'` — the redesign/v2 router is what actually
  renders. Route/layout/page definitions live in `App.v2.tsx`, `components/layout/`
  (`PublicShell`, `AuthenticatedShell`), and `src/pages/v2/`. Editing the legacy
  `App.tsx`/old shells/pages has no effect on the running app.
- **Dev server:** `npm run dev` serves on `http://localhost:5173`. Vite binds to
  `localhost` / `::1` — use `localhost`, not `127.0.0.1`, when probing with curl.
- **Local `.env` (gitignored) is required to boot.** Set `VITE_SUPABASE_URL` plus
  a key. `src/lib/supabaseClient.ts` accepts `VITE_SUPABASE_PUBLISHABLE_KEY`, but
  `src/lib/supabase.ts` reads the legacy `VITE_SUPABASE_ANON_KEY`. A few Vitest
  suites import `src/lib/supabase.ts`, so set **both** keys in `.env` for the full
  unit suite to run (CI/`.env.test` only set the publishable key).
- **Local Supabase needs Docker + a recent CLI.** The pinned `supabase`
  devDependency (2.91.3) is too old for `supabase/config.toml` (the
  `auto_expose_new_tables` key needs CLI ≥ 2.106.0). Use `npx supabase@latest ...`
  (this matches CI's `supabase/setup-cli@v2` `version: latest`), not the bare
  `supabase:*` npm scripts.
- **Frontend runs without a backend.** With placeholder Supabase values the app
  still boots (Vite/esbuild does no typechecking); backend-free routes such as
  `/onboarding/*` and the participant flow (`/p/*`) render and are interactive,
  which is the quickest way to sanity-check the UI.
