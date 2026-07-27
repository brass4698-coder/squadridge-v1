# Pilot metrics pre-registration

Complete **before** the first NGO pilot session starts. Cite only these metrics in closeout memos — never “lives saved” or unregistered impact claims.

**Related:** [`evidence-collection.md`](./evidence-collection.md) · [`v2-pilot-checklist.md`](./v2-pilot-checklist.md) · [`../product/impact-roadmap.md`](../product/impact-roadmap.md)

## Cohort

| Field | Value |
| ----- | ----- |
| Partner / program | |
| Facilitator owner | |
| Incident owner (off-platform) | |
| Template | `ngo_deliberation` (default) |
| Planned start | |
| Planned close | |
| Public ledger? | No (private anchored memo) / Yes (partner consent on file) |
| Deployed commit SHA | |
| Staging or production project ref | |

## Pre-registered primary metrics

Define numerators and denominators before day one.

| Metric | Definition | Target (optional) | Data source |
| ------ | ---------- | ----------------- | ----------- |
| Verification completion rate | Verified participants ÷ invited participants | | Facilitator review UI / audit export |
| Time to room open | Hours from first invite to `room_opened` | | `session_audit_events` |
| Session completion | Sessions reaching Release ÷ sessions started | | Sessions list / audit |
| Time to release | Hours from draft outcome to `record_released` | | Audit export |
| Approval completeness | Approvals recorded ÷ required approvers | | Release gate |

## Secondary / qualitative (optional)

- Facilitator rubric score (attach rubric version)
- Participant follow-up survey at 7 days (template below) — consent required
- Off-platform incident log count (program-owned)

## Participant follow-up survey (7-day, optional)

Use only with partner ethics approval. Do not collect unnecessary PII.

1. Did you feel the written room was a safer place to speak than email or open chat? (Yes / Partly / No)
2. Was the facilitator’s pacing clear? (Yes / Partly / No)
3. Did you understand what could leave the room before the session? (Yes / Partly / No)
4. Would you use this format again for a similar matter? (Yes / Unsure / No)
5. Free text (optional): one thing that should improve next time.

## Closeout checklist

- [ ] Metrics table filled with actuals vs pre-registered definitions
- [ ] Audit trail exported (metadata only)
- [ ] Private anchored release completed **or** documented abort reason
- [ ] If public ledger claimed: partner consent on file + live ledger row verified
- [ ] No banned public claims in partner-facing materials

## Honest boundaries (copy into MOU)

Room content is operator-readable today. This is not Signal-grade end-to-end encryption. Only facilitator-approved outcome text may leave the room; identities do not appear on released records.
