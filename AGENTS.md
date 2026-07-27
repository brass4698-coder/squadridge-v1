# SquadRidge — Developer Context

This file is the fastest way to get oriented in the codebase. It covers the stack,
where things live, how the design system works, and the rules that keep the codebase
consistent. Read it before making significant changes.

## What is SquadRidge?

A peace-tech platform for **facilitator-led, high-stakes dialogue** — protected sessions
in a private room, then a **verifiable anchored outcome** without exposing who said what.
The product spine is **Configure → Verify → Facilitate → Release**.

**Pilot wedge (default):** NGO internal deliberation with a **private** anchored decision memo;
public ledger publish is optional. Default create-session template is `ngo_deliberation`.

**Core architectural line:** the room and the record are separate by design — not policy.

Legacy citizen matchmaking / ZK routes are **soft-retired** in `App.v2.tsx` (redirect to
`/request-access`); code may remain for diligence. See `docs/security/threat-model.md` for
honest privacy bounds. Canonical story: [`docs/product/platform-description.md`](docs/product/platform-description.md),
`squadridge_platform_spec.json`, and `docs/founding/north-star.md`.
Investor / diligence start-here: [`docs/business/investor-brief.md`](docs/business/investor-brief.md).
The longer civic early-warning → redacted ledger → proposal vision lives in
[`docs/product/civic-early-warning-response-model.md`](docs/product/civic-early-warning-response-model.md)
(vision-labeled; do not treat as shipped claims).

**Contributor rules:** `.cursor/rules/squadridge.mdc` (platform), `component-rules.mdc` (UI),
`ai-guidelines.mdc` (optional translation/AI paths). Root `.cursorrules` summarizes both.

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
- **Default theme**: cool near-black elevation stack for app + marketing (`:root`). `body[data-theme='institutional']` / `ledger-dark` are scope aliases that inherit the same palette (cream parchment retired)
- **Accent**: interactive teal `--sr-primary` (`#1F8A7A`); verification punctuation `--sr-verify` (`#3FE0C5`) reserved for verified / released badges and dots only
- **Fonts (tokenized)**: Inter for body/UI/headings (`--sr-font-body|heading|display`); IBM Plex Mono for labels/ledger/code — see `--sr-font-*` in tokens.css. Kit: [`docs/design/squadridge-trust-ui-kit.md`](docs/design/squadridge-trust-ui-kit.md)
- **Motion**: `motion` (Framer) + `animate-step-in` utilities; respect `prefers-reduced-motion`
- **Rules**: No raw hex in components; WCAG AA; calm de-escalation copy; no militarized iconography (flags, weapons)

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
- **Do not overclaim privacy** — message protection is application-layer encryption with
  operator-readable keys today; see `docs/security/threat-model.md` before UI or marketing copy.
- **Redis in `docker-compose.yml` is local-dev optional** — production rate limits use Upstash via Edge Functions.
- **Migrations are append-only** — never edit an existing file in `supabase/migrations/`.
  Always add a new timestamped file.
- **RLS is mandatory** — every new table needs `alter table ... enable row level security`
  and at least one policy in the same migration.
- **Tokenized fonts only** — Inter (UI + headings) + IBM Plex Mono (labels/ledger).
  Don't introduce a new family without updating `tailwind.config.ts`, `tokens.css`, and `index.html`.
- **TypeScript strict** — no `any`, no `@ts-ignore` without an explanatory comment.
- **Test new utilities** — any new file in `src/utils/` or `src/lib/` needs a corresponding
  test in `src/test/`.
