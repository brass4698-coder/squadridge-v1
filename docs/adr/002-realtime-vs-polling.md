# ADR 002: Realtime primary, polling as backfill

## Status

Accepted

## Context

Squad messages must feel live on poor networks; users may disconnect, sleep tabs, or hit Realtime limits.

## Decision

- **Primary:** Supabase Realtime `postgres_changes` on the messages channel (`useRealtimeMessages`).
- **Secondary:** Bounded exponential backoff on subscribe failures; catch-up queries after visibility/focus; optional polling intervals where product logic already requires snapshots (e.g. matchmaking pool in `Match`).

## Consequences

- **Positive:** Low latency when Realtime is healthy; resilience when it is not.
- **Negative:** More code paths to test (subscribe, retry, backfill); must keep React Query keys consistent across paths.
