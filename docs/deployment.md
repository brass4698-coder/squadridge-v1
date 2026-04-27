# Deployment

**Frontend (Vite static app)**

- Build: `npm run build` (requires `VITE_SUPABASE_URL` and publishable/anon key; **`VITE_ZK_STUB` must not be `true`** for production — enforced in `vite.config.ts`).
- Hosting: set the same `VITE_*` variables on your provider (e.g. Vercel, Netlify, Cloudflare Pages) plus **`VITE_SITE_URL`** for auth callbacks.
- CI: [.github/workflows/deploy-frontend.yml](../.github/workflows/deploy-frontend.yml) produces a `dist/` artifact; many teams instead connect the repo to the host directly.

**Supabase (database + Edge Functions)**

- Migrations live in `supabase/migrations/`.
- Production deploy workflow: [.github/workflows/deploy-supabase-production.yml](../.github/workflows/deploy-supabase-production.yml) (repository secrets documented in [README.md](../README.md)).
- **Staging:** [.github/workflows/deploy-staging.yml](../.github/workflows/deploy-staging.yml) currently runs build + E2E only; it does **not** run `supabase db push`. If you use a separate staging Supabase project, link it in CI and add a `db push` step (same pattern as production), or apply migrations manually to that project when testing schema changes before production.

**Release gate**

- Run `npm run lint`, `npm test`, `npm run build`, and `node scripts/check-prod-readiness.mjs` before tagging a release.
- See [operations/production-checklist.md](operations/production-checklist.md).
