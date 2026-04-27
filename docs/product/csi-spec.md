# Conflict Severity Index (CSI) — draft specification

**Status:** Draft spec for methodology and governance. **Partially in product today:** regional snapshot and escalation **tables** with **RLS**, a **reference calculator** in TypeScript, and a **moderator-only** read UI at `/admin/csi` (rostered in `public.moderators`) — see [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md) and [`conflict-severity-index.md`](conflict-severity-index.md). **Not** a public API, partner export, or automated ingestion pipeline until explicitly listed in `CURRENT_STATUS` and covered here.

Do not treat this file as a contract for a full partner dashboard or public CSI feed. Align any future build with [`../security/threat-model.md`](../security/threat-model.md).

**Full methodology, bands, data sources, and SQL:** [`conflict-severity-index.md`](conflict-severity-index.md) (and [`../../src/lib/conflictSeverityIndex.ts`](../../src/lib/conflictSeverityIndex.ts) for the reference calculator).

## Purpose (fully scoped product — future)

A Conflict Severity Index would give **vetted program partners** a structured view of **escalation-relevant signals** derived only from data the organization has chosen to collect and is allowed to process under its agreements and law. It is **not** omniscient “global early warning” and must not be marketed as such until governance and evidence standards are met.

## Design principles

1. **Human in the loop** — Elevated signals trigger **review** (facilitator / moderator), not automatic public alerts.  
2. **Privacy by design** — No new data class without RLS review, retention policy, and partner disclosure.  
3. **False positives** — Language and sentiment models err; UI and ops must surface uncertainty.  
4. **Separation** — Distinguish **pilot analytics** from **production claims** in all copy.

## Candidate signal categories (illustrative)

| Category | Possible inputs | Real-time? | Notes |
| -------- | --------------- | ---------- | ----- |
| Sentiment trajectory | In-room NLP / heuristics where enabled | Maybe | Requires opt-in, bias review, locale coverage |
| Theme clustering | Aggregated tags / facilitator codings | Batch / near-real-time | Prefer human-validated taxonomies in early pilots |
| Escalation velocity | Rate of change of allowed metrics | Maybe | Define windowing and baseline carefully |
| Facilitator flags | Manual severity ratings | Human-paced | Ground truth for model calibration |

*Table is illustrative only; inclusion in the product requires a versioned spec and legal review.*

## Product surfaces

- **In repo today (moderator / ops):** read-only view of `conflict_severity_snapshots` and `escalation_alerts` at `/admin/csi` for users in the moderators roster; data written by **service role** (batch/cron) only.  
- **Future:** Partner-facing dashboard (authenticated, RLS-scoped to partner orgs if added).  
- **Future:** Alerting to designated roles only; audit log of who saw what.  
- **Future:** Optional export API for partner systems — **no commitment** until documented in [`../technical/api-design.md`](../technical/api-design.md) or Edge Function specs.

## Engineering touchpoints (when scoped)

- [`../../src/lib/ai/pipeline.ts`](../../src/lib/ai/pipeline.ts) — optional feature inputs for CSI.  
- [`../../src/lib/csiSnapshotPayload.ts`](../../src/lib/csiSnapshotPayload.ts) — map `computeConflictSeverityIndex` output to a `conflict_severity_snapshots` insert payload (service-role writers).  
- [`../../src/lib/csiQueries.ts`](../../src/lib/csiQueries.ts) — moderator read queries for `/admin/csi`.  
- Admin / moderator UIs — triage, not public feeds.  
- [`../business/impact-metrics.md`](../business/impact-metrics.md) — outcome definitions.

## Evidence

Any CSI-backed **impact** claim requires pre-registered metrics, control strategy, and partner sign-off. See [`../business/strategic-positioning-early-warning.md`](../business/strategic-positioning-early-warning.md) (vision vs shipped scope).
