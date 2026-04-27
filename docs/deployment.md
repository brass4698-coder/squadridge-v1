# Deployment

**Frontend (Vite static app)**

- Build: `npm run build` (requires `VITE_SUPABASE_URL` and publishable/anon key; **`VITE_ZK_STUB` must not be `true`** for production — enforced in `vite.config.ts`).
- Hosting: set the same `VITE_*` variables on your provider (e.g. Vercel, Netlify, Cloudflare Pages) plus **`VITE_SITE_URL`** for auth callbacks.
- CI: [.github/workflows/deploy-frontend.yml](../.github/workflows/deploy-frontend.yml) produces a `dist/` artifact; many teams instead connect the repo to the host directly.

**Supabase (database + Edge Functions)**

- Migrations live in `supabase/migrations/`.
- Production deploy workflow: [.github/workflows/deploy-supabase-production.yml](../.github/workflows/deploy-supabase-production.yml) (repository secrets documented in [README.md](../README.md)).

**Release gate**

- Run `npm run lint`, `npm test`, `npm run build`, and `node scripts/check-prod-readiness.mjs` before tagging a release.
- See [operations/production-checklist.md](operations/production-checklist.md).
