# Pilot Evidence Pack Template

**Purpose:** Empty template for the **first real** private deliberation pilot. Fill during kickoff and closeout — do not pre-fill invented partners, logos, or outcomes.  
**Product path:** Configure → Verify → Facilitate → Release (default: private anchored memo)  
**Last updated:** July 2026

**Must use with:**

- [`./v2-pilot-checklist.md`](./v2-pilot-checklist.md)
- [`./pilot-deploy-runbook.md`](./pilot-deploy-runbook.md)
- [`./evidence-collection.md`](./evidence-collection.md)
- [`./pilot-metrics-preregistration.md`](./pilot-metrics-preregistration.md)

---

## 1. Pilot identity

| Field | Value |
| ----- | ----- |
| Pilot codename (internal) | |
| Organisation (legal name) | |
| Facilitator lead | |
| SquadRidge operator contact | |
| Template used | `ngo_deliberation` / other: ________ |
| Public ledger publish? | No (default) / Yes (partner consent recorded) |
| Session ID(s) | |
| Environment | staging / controlled production |

---

## 2. MOU honesty points (check before go-live)

Confirm the partner MOU or written agreement states:

- [ ] Room content is **operator-readable** today (not Signal-grade / operator-blind E2E)
- [ ] SHA-256 release anchor proves **integrity of approved text**, not court-admissible time (RFC 3161 not production-live unless separately configured and disclosed)
- [ ] SquadRidge is process infrastructure — **not** a legal privilege instrument; counsel decides privilege
- [ ] Illustrative ledger specimens are **not** this pilot’s outcomes
- [ ] Invite/bearer links are credentials; sharing rules agreed
- [ ] Retention / export / deletion expectations documented
- [ ] Success metrics pre-registered (link to filled metrics form)

MOU / agreement reference: ________ · Date: ________

---

## 3. Deploy fingerprint

| Field | Value |
| ----- | ----- |
| Deployed git SHA | |
| Deploy datetime (UTC) | |
| Frontend host | |
| Supabase project ref | |
| `npm run check:all` / CI green on SHA? | Yes / No |
| Edge Functions deployed (list) | |
| `VITE_V2_MOCK_DATA` unset/false | Yes / No |
| `VITE_ZK_STUB` not true in prod | Yes / No |
| Migrations applied through (latest) | |

---

## 4. Timeline

| Milestone | Planned date | Actual date | Notes |
| --------- | ------------ | ----------- | ----- |
| Kickoff / MOU signed | | | |
| Staging dry-run complete | | | |
| Session created | | | |
| Participants verified | | | |
| Room opened | | | |
| Outcome drafted | | | |
| Approvals complete | | | |
| Release (private memo / public) | | | |
| Closeout interview | | | |

---

## 5. Integrity artifacts (private memo)

| Field | Value |
| ----- | ----- |
| Outcome / memo title (non-sensitive) | |
| Release mode | private anchored / public ledger |
| SHA-256 of canonical approved text | |
| Recompute verified by (name) | |
| Recompute date | |
| Ledger record ID (if public) | |
| Audit trail export location (metadata only) | |

Do **not** paste room message bodies into this pack.

---

## 6. Metrics snapshot (from pre-registration)

| Metric | Pre-registered? | Result | Notes |
| ------ | --------------- | ------ | ----- |
| Verification completion | | | |
| Time-to-release | | | |
| Session completion | | | |
| Other (specify) | | | |

---

## 7. Closeout questions

Answer in short prose; keep PII out of shared copies.

1. Did the release gate prevent premature exposure of drafts or room dialogue?  
2. Was facilitator process control adequate for this cohort size?  
3. Were operator-readable limits understood and accepted in practice?  
4. Would the organisation run another session? Why / why not?  
5. What ops friction (invites, email, verification, release) should be fixed first?  
6. Any incident or near-miss? (Link [`./incidents.md`](./incidents.md) if yes.)  
7. Is any public statement allowed? (Default: no logos / no named case study without written consent.)

---

## 8. Sign-off

| Role | Name | Date |
| ---- | ---- | ---- |
| Facilitator | | |
| Partner sponsor | | |
| SquadRidge ops | | |

**Status:** `template` · `in_progress` · `closed` — current: **template**
