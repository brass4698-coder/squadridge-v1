# Pilot RLS checklist

Use this table when reviewing Postgres policies before cohort pilots. **RLS constrains peer abuse via the Supabase API; it does not hide data from service-role Edge Functions or operators with DB access** — see [threat model](./threat-model.md).

## Expectations by table

| Table | SELECT | INSERT | UPDATE | DELETE | Notes |
| ----- | ------ | ------ | ------ | ------ | ----- |
| `messages` | Own squad membership or moderator policy only | Prefer RPC / Edge paths that enforce squad membership | Sender-owned updates where applicable | Restricted | Cross-user reads **must** fail for anon JWT from another cohort. |
| `squads` | Policies scoped to membership / moderator role | Controlled paths | Squad owners / triggers | Restricted | Message encryption keys readable only where migrations intend. |
| `squad_members` | Own rows + squad peers | Enrollment RPCs | Limited | Restricted | Unique `(user_id, pool_key)` style constraints enforced elsewhere — see queue migrations. |
| `profiles` | Own profile + projections explicitly granted | Own upsert | Own patch | Rare | No global directory SELECT for anon/authenticated browsing. |
| `match_queue` | Own rows (`user_id = auth.uid()`) | Through **`matchmaking_enqueue_and_try`** RPC, not arbitrary INSERT | RPC-managed state transitions | — | Pool metadata (`pool_key`) visible only with correct JWT. |

## Anonymous cohort isolation

- Two distinct **`anon`** sessions (different underlying `users.id`) **must not** read each other’s rows where policies say “own user only.”
- Automated regression: extend CI when **`supabase db test`** / pgTap is enabled project-wide; until then run manual probes after `supabase db reset` using two JWTs from `supabase auth sign-up` flows.

## Nullifiers and ZK rows

- **`zk_proof_submissions`** / **`verified_attributes`**: Edge inserts via service role after **`verify-zk-proof`**; clients never INSERT verified paths directly — see [ZK implementation](../technical/zk-implementation.md).
- **Unlinkability**: Semaphore **nullifiers** are opaque hashes stored server-side; crossing cohorts still correlates **`user_id`** with verification events — document honestly for pilots.
