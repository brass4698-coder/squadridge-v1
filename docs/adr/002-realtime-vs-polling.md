# ADR 002: Realtime primary, polling as backfill

## Status

Accepted; Phase 3.2 of the audit remediation plan adds client-side telemetry. Hard server-side socket caps remain future work.

## Context

Squad messages must feel live on poor networks; users may disconnect, sleep tabs, or hit Realtime limits.

## Decision

- **Primary:** Supabase Realtime `postgres_changes` on the messages channel (`useRealtimeMessages`).
- **Secondary:** Bounded exponential backoff on subscribe failures; catch-up queries after visibility/focus; optional polling intervals where product logic already requires snapshots (e.g. matchmaking pool in `Match`).

## Consequences

- **Positive:** Low latency when Realtime is healthy; resilience when it is not.
- **Negative:** More code paths to test (subscribe, retry, backfill); must keep React Query keys consistent across paths.

## Phase 3.2 follow-up: telemetry + soft socket cap

Audit-remediation Phase 3.2 adds client-side telemetry so operators can see realtime pressure without standing up a full metrics pipeline. See [`src/lib/realtimeTelemetry.ts`](../../src/lib/realtimeTelemetry.ts).

- `recordRealtimeSubscribe(tag)` is called from `useRealtimeMessages`; returns a release function bound to useEffect cleanup so dedupe counters stay correct on hot reload.
- `recordRealtimeFallback()` increments whenever `backfillAfterReconnect` runs — sustained fallback usage signals a realtime degradation.
- `recordRealtimeError()` increments on `CHANNEL_ERROR` / `TIMED_OUT`.
- `getRealtimeTelemetry()` returns a snapshot for devtools / Phase 3.4 dashboards.
- `REALTIME_TELEMETRY_MAX_SUBSCRIBERS_PER_TAG` is the **soft** cap (default 4). When crossed, we emit a structured `realtime_subscribers_over_cap` warning via `logWarn`. We do **not** disconnect — overlap during a hot reload or rapid route change is expected.

### Future work (out of scope for Phase 3.2)

Hard enforcement still requires server cooperation:

- A `subscribe_to_squad` RPC that increments a Postgres counter (or Upstash key) and rejects when the per-squad cap is reached. Mentioned in the audit remediation plan but deferred — implementing it inside Supabase Realtime requires a custom Postgres function that the realtime worker can read on subscribe, which is non-trivial without a fork.
- A Grafana / Sentry dashboard query that reads the `getRealtimeTelemetry()` snapshot via Sentry breadcrumbs every N minutes (lands with Phase 3.4 observability).
- Per-tab session-storage dedupe so a user with 10 tabs open does not silently consume 10 realtime sockets (currently each tab opens its own subscription; the soft cap above is per-tab, not per-user).
