# SquadRidge

Verified-anonymous cross-border dialogue platform: React, Vite, TypeScript, Tailwind, Supabase (PostgreSQL + RLS), with optional Redis for future workers.

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

Enable **Anonymous** sign-in under **Authentication → Providers** in the Supabase dashboard (required for the demo squad flow). Apply migrations via CI or manually — see [`supabase/README.md`](supabase/README.md).

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
| 4 | **Local:** `.env` targets the **same** project CI deploys. Run `npm run dev`, open `/dev/supabase` (connectivity) and `/session` → **Create demo squad** (auth + RLS + Realtime). |

## Suggested next milestones

Pick one vertical to focus engineering next (all tie to files under `docs/` and `src/`):

| Lane | Focus |
| ---- | ----- |
| **Session reliability** | Error handling, offline/retry UX — [`src/pages/SessionPage.tsx`](src/pages/SessionPage.tsx), [`src/hooks/useRealtimeMessages.ts`](src/hooks/useRealtimeMessages.ts) |
| **Matching / squads** | Replace demo squad with real matching — Edge Function or worker; see [`src/lib/ephemeral/matchingQueue.ts`](src/lib/ephemeral/matchingQueue.ts), [`docs/product/feature-specifications.md`](docs/product/feature-specifications.md) |
| **ZK** | Semaphore / verifier path — [`src/lib/zk/index.ts`](src/lib/zk/index.ts), [`docs/technical/zk-implementation.md`](docs/technical/zk-implementation.md) |
| **AI pipeline** | `VITE_ENABLE_AI=true` when backend is ready — [`src/lib/ai/pipeline.ts`](src/lib/ai/pipeline.ts), [`docs/technical/ai-pipeline.md`](docs/technical/ai-pipeline.md) |
| **Frontend hosting** | Vercel / Netlify / Cloudflare Pages with the same `VITE_*` build env vars (separate from DB migration CI). |

## Documentation

Product and technical specs live under [`docs/`](docs/).

## License

MIT — see [LICENSE](LICENSE).
