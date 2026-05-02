# Conflict Severity Index (CSI) — draft specification

**Status:** Draft spec for methodology and governance. **Shipped today:** regional snapshot + escalation **tables** with **RLS**, a **reference calculator** in TypeScript, **moderator-only** read UI at `/admin/csi` (rostered in `public.moderators`), **automated ingestion** via the `csi-ingest-snapshot` Edge Function on hourly pg_cron with `csi_aggregate_signals` reading `facilitator_signal_codes` + `sentiment_metrics`, per-region band calibration in `csi_band_thresholds`, and a **scoped partner export** Edge Function (`csi-partner-export`) gated by hashed API keys + per-(partner, region, dimension) grants + audit log + rate limit. **Public maps and broad self-serve CSI feeds remain out of scope.** See [`../../CURRENT_STATUS.md`](../../CURRENT_STATUS.md) and [`conflict-severity-index.md`](conflict-severity-index.md).

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

- **In repo today (moderator / ops):** read-only view of `conflict_severity_snapshots` and `escalation_alerts` at `/admin/csi` for users in the moderators roster; data written by **service role** via the `csi-ingest-snapshot` Edge Function on hourly pg_cron.
- **In repo today (partner export, scoped):** `csi-partner-export` Edge Function. Authenticated via `X-CSI-Partner-Key` (SHA-256 hashed against `csi_partners.api_key_hash`); returns snapshots filtered to the partner's region grants and projected to allowed signal dimensions only. Every call writes a `csi_export_audit_log` row.
- **Future:** Partner-facing dashboard UI (today's API is service-to-service; partners build their own dashboards or we ship a thin one with the same scope rules).
- **Future:** Alerting to designated roles via push/email; today alerts surface only in the moderator-only `/admin/csi` table.
- **Out of scope (governance gate):** Public CSI maps or feeds. See [`../business/strategic-positioning-early-warning.md`](../business/strategic-positioning-early-warning.md) — the honest end state is vetted-partner read access, not a public dashboard.

## Engineering touchpoints (when scoped)

- [`../../src/lib/ai/pipeline.ts`](../../src/lib/ai/pipeline.ts) — optional feature inputs for CSI.  
- [`../../src/lib/csiSnapshotPayload.ts`](../../src/lib/csiSnapshotPayload.ts) — map `computeConflictSeverityIndex` output to a `conflict_severity_snapshots` insert payload (service-role writers).  
- [`../../src/lib/csiQueries.ts`](../../src/lib/csiQueries.ts) — moderator read queries for `/admin/csi`.  
- Admin / moderator UIs — triage, not public feeds.  
- [`../business/impact-metrics.md`](../business/impact-metrics.md) — outcome definitions.

## Evidence

Any CSI-backed **impact** claim requires pre-registered metrics, control strategy, and partner sign-off. See [`../business/strategic-positioning-early-warning.md`](../business/strategic-positioning-early-warning.md) (vision vs shipped scope).
