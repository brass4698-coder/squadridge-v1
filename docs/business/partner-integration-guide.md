# Partner integration guide (aspirational)

**Status:** **Not all capabilities below are shipped.** This document describes a target operating model; verify against [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md) before external commitments.

## What exists today

- Product flows (match, session, ledger where enabled) and [security disclosure](/security) in the app.  
- [Conflict Severity Index](../product/conflict-severity-index.md) methodology; Postgres tables for snapshots and alerts (migration in repo; writers use **service role**).  
- Internal moderator review at **`/admin/csi`** (rostered moderators only)—not a public or anonymous dashboard.

## Future integration options (design targets)

| Option | Description | Shipped? |
| ------ |-------------| -------- |
| Read-only data share | Partners receive aggregate CSI rows under contract | Design |
| Webhooks | HTTPS callbacks on alert thresholds | **Not shipped**; SLA TBD with engineering |
| White-label UI | Branded mediator shell | **Not shipped** |
| API keys for partners | Programmatic read | **Not shipped**; would require policy + rate limits |

## Data and privacy

- No PII in CSI regional keys by default; raw dialogue never leaves trust boundaries without a **data use agreement** and RLS-consistent paths.  
- Re-read [threat model](../security/threat-model.md) before promising encryption scope.

## Next steps to operationalize

1. Sign pilot scope and regions.  
2. Apply database migrations; assign moderator roster.  
3. Stand up a **trusted worker** to compute features and insert snapshots (see [conflict-severity-index.md](../product/conflict-severity-index.md#ingestion-and-internal-console)).
