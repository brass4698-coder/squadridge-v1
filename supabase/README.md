# Supabase (SquadRidge)

## Apply migrations

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. In **SQL Editor**, paste and run the contents of [`migrations/20250413000000_initial_schema.sql`](./migrations/20250413000000_initial_schema.sql).
3. If `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages` fails, enable **Realtime** for `messages` under **Database → Replication** instead.
4. **Authentication → Providers**: enable **Anonymous sign-ins** (required for the demo flow in this repo).
5. Copy **Project URL** and **anon public** key into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Optional: install the [Supabase CLI](https://supabase.com/docs/guides/cli) and use `supabase link` + `supabase db push` after logging in.
