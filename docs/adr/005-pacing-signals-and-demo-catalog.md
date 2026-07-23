# ADR 005: Privacy-preserving pacing signals and demo catalog scope

## Status

Accepted — July 2026.

## Context

SquadRidge needs facilitators, mediators, and participants to stay engaged under pressure without turning the product into surveillance. Legacy `SessionPage` shipped **Slow down** (breathing overlay + send cooldown) and **Pull back** (message retract). The active App.v2 participant and facilitator rooms did not. Separately, diligence requires a way to open every surface in demo without shipping decoys to production.

## Decision

### Pacing / frustration awareness

1. **Signals are local and explainable.** Prefer client-side behavioral cues (rapid send thrash, composer delete ratio, repeated retract). Optional local tone heuristics only when `VITE_ENABLE_AI` is on and the product path already allows it. Never market an “AI mood score.”
2. **No dialogue bodies in pacing telemetry.** Intervention logs store type, session/squad id, timestamps, and actor role — not message text. Sentry must not receive bodies (see [`docs/security/observability-and-sentry.md`](../security/observability-and-sentry.md)).
3. **Facilitator authority stays primary.** Soft prompts suggest Slow down; room-wide pause/cooldown applied to others requires facilitator action (or the participant applying Slow down to themselves).
4. **Slow down duration is 10–15 seconds** of send cooldown after a short breathing moment (~2s). Distinguish from session `paused` (room-level halt).
5. **Pull back** is time-bounded retract of own message with calm UI; prefer Edge Function for authoritative write when available; client path may demo locally.

### Demo catalog

1. **Demo Catalog** lives at `/app/demo/catalog` (and DEV / `VITE_ENABLE_DEMO_SQUAD`), gated to `super_admin` or local DEV. It indexes marketing pages, role dashboards, facilitator flows, participant token flow, admin ops, and UI primitives.
2. **Demo role switcher** sets a session-only flag (`sessionStorage`) that changes which dashboard/shell the catalog opens — never mutates production `user_roles`.
3. **Illustrative labeling** is mandatory on demo fixtures. CI continues to enforce `check:no-demo-decoys-prod` and no demo login in release artifacts.

## Consequences

- v2 rooms must mount shared Slow down / Pull back / pace-signal hooks.
- Role dashboards become distinct destinations under `/app/{role}` matching [`ROLE_DASHBOARD_MAP`](../../src/types/roles.ts).
- Health probes and smoke e2e cover Slow down + one dashboard path per primary role over time.

## Non-goals

- Operator-blind E2E (see [ADR 004](./004-defer-operator-blind-e2e.md)).
- Automated punitive moderation from tone.
- Storing message text for “frustration ML.”
