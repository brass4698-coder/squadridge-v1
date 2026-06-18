# SquadRidge — AI Agent Context

This file provides architectural context for AI coding agents (Cursor, GitHub Copilot,
Claude, Perplexity, etc.) working in this repository.

## What is SquadRidge?

A peace-tech platform that enables **verified anonymous dialogue** across conflict lines.
Users join verified groups ("squads"), are matched with counterparts, and hold structured
conversations recorded in a tamper-evident ledger. Zero-knowledge proofs (Semaphore)
preserve anonymity while proving group membership.

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
- **Default theme**: dark (graphite #0c0e12 base), `.theme-light` for marketing/ledger surfaces
- **Accent**: single slate-teal `--sr-primary: #2aa39a` — never add a second accent color
- **Fonts**: IBM Plex Sans (UI), IBM Plex Serif (display/marketing), IBM Plex Mono (ledger/code)
- **Motion**: use `motion` (Framer) + `animate-step-in` / `animate-step-in-body` Tailwind utilities

## Key Directories

```
src/
  App.tsx              # Root router — all page routes defined here
  components/          # Shared UI primitives and layout shells
  pages/               # Route-level page components
  onboarding/          # Lazy-loaded onboarding flow (shadcn-heavy)
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
| `VITE_ZK_STUB` | `true` = use stub ZK proofs in dev (never in production) |
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

## Rules for AI Agents

- **Never add a second accent color** — `--sr-primary` is the only hue in UI chrome.
  Charts may use semantic palette (`--sr-success`, `--sr-warning`, `--sr-danger`, `--sr-info`).
- **Never use raw hex** in component JSX/CSS — always reference a `--sr-*` token or Tailwind
  alias (`bg-surface`, `text-brand`, `border-line`, etc.).
- **Never set `VITE_ZK_STUB=true` in production paths** — the CI gate `check:no-zk-stub-prod` will fail.
- **Migrations are append-only** — never modify an existing file in `supabase/migrations/`.
  Add a new timestamped file.
- **RLS is mandatory** — every new table must have `alter table ... enable row level security`
  in its migration and at least one policy.
- **Fonts are IBM Plex only** — do not introduce a new font family without updating
  `tailwind.config.ts` and `tokens.css`.
- **TypeScript strict** — no `any`, no `@ts-ignore` without a comment explaining why.
- **Test new utilities** — any new file in `src/utils/` or `src/lib/` needs a corresponding
  test in `src/test/`.
