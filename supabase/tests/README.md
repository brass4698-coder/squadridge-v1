# Database tests (optional)

Pilot RLS regression tests are documented in [`docs/security/pilot-rls-checklist.md`](../../docs/security/pilot-rls-checklist.md).

When the project adopts **`supabase db test`**, add **pgTap** (or equivalent) cases under `supabase/tests/database/` that assert cross-principal `SELECT` denials using two distinct JWTs. Until then, run the checklist’s manual probes after `supabase db reset` on a developer machine.
