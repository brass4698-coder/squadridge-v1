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

Fill in `.env` with your Supabase URL and anon key. Enable **Anonymous** sign-in in the Supabase dashboard. Apply the SQL in `supabase/migrations/` (see `supabase/README.md`).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`    | Start Vite dev server    |
| `npm run build`  | Typecheck + production build |
| `npm run preview` | Preview production build |

## Documentation

Product and technical specs live under `docs/`.

## License

MIT — see [LICENSE](LICENSE).
