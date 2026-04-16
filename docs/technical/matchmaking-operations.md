# Matchmaking operations (MVP)

Operational behavior is defined in SQL (`supabase/migrations/*matchmaking_queue.sql`) and mirrored in TypeScript for UI copy:

| Constant | Value | Source |
| -------- | ----- | ------ |
| `MATCHMAKING_SIDE_SIZE` | 2 | [`src/lib/matchmakingConstants.ts`](../../src/lib/matchmakingConstants.ts) |
| `MATCHMAKING_SQUAD_TOTAL` | 4 | Same |
| `MATCHED_SQUAD_TTL_HOURS` | 24 | Squad `expires_at` default in migrations |
| Queue timeout | None (MVP) | Users cancel via `matchmaking_cancel_waiting` or match |

See [`MATCH_QUEUE_NO_SERVER_TIMEOUT`](../../src/lib/matchmakingConstants.ts) for user-facing copy when explaining wait behavior.

Intent → pool key hashing: [`src/lib/matchmakingPoolKey.ts`](../../src/lib/matchmakingPoolKey.ts).
