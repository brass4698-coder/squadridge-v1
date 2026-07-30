# Product note: Pacing signals & demo catalog

Canonical decision record: [`docs/adr/005-pacing-signals-and-demo-catalog.md`](../adr/005-pacing-signals-and-demo-catalog.md).

## Summary for implementers

- Local pace signals may **suggest** Slow down; facilitators authorize room-wide effects.
- Never store or log message bodies for frustration / pacing telemetry.
- Slow down (10–15s cooldown) ≠ session `paused`.
- Demo catalog at `/app/demo/catalog` is illustrative; demo role switcher is `sessionStorage` only.
- Critical writes: idempotent `create-invite`, `release-outcome`, and `pull-back` Edge Functions (RPC fallback).
- Stale invite / stuck-session cleanup: `cleanup_stale_invites_and_sessions` (pg_cron when available).
- Cinematic diligence walkthrough: `/demo/simulation`.
