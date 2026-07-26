# SquadRidge — Trust & Diligence Packet

**Audience:** Philanthropic, government, institutional investor, and enterprise security evaluators  
**Registry version:** `2026.07.25` (from `src/data/implementationStatus.ts`)  
**Reading order:** Documented limits → live safeguards → planned items → process  

This packet is version-controlled and must stay aligned with the Implementation Status Registry. If a claim is not LIVE in the registry, it is not a shipped guarantee.

---

## 1. Current vs planned security posture

| Capability | Status | Notes |
| ---------- | ------ | ----- |
| SHA-256 verification anchor on release | **LIVE** | Recomputable integrity of approved text |
| Hash-bound participant approvals | **LIVE** | Edit resets approvals |
| Facilitator authorship attestation | **LIVE** | Bound to same hash |
| Metadata-only audit trail | **LIVE** | No message bodies in audit export |
| Magic-link auth; role-scoped invites | **LIVE** | Invite-only pilot access |
| Manual intake review (5–7 business days) | **LIVE** | Human review; no self-serve approval |
| Approved-outcomes-only public ledger | **LIVE** | Specimens labeled illustrative |
| RFC 3161 trusted timestamping | **SCAFFOLDED** | Schema + optional TSA client; not verified LIVE |
| Operator-blind room encryption | **PLANNED** | See ADR 005; rooms operator-readable today |
| IOA certification / legal privilege / court-admissible time | **NOT CLAIMED** | Architecture may align with IOA practice; no certification |

---

## 2. Threat model summary (honest bounds)

- **Room vs record:** Dialogue stays in the private room. Only facilitator-authored, approval-bound text can leave as a public or private anchored record.
- **Operator access today:** v2 room content is readable by the operator (Postgres plaintext + RLS). Cover this in the MOU. Not Signal-grade E2E.
- **Integrity vs time:** SHA-256 proves the released file is unaltered. It does **not** prove independently attested time until a LIVE RFC 3161 path exists.
- **Source of truth:** [`docs/security/threat-model.md`](./threat-model.md) and [`docs/security/public-claims-audit.md`](./public-claims-audit.md).

---

## 3. Data residency

- Application data is hosted on **Supabase Cloud** (Postgres + Auth + Edge Functions) in the project region configured for your deployment.
- Frontend static assets are typically served via **Vercel** (or equivalent CDN).
- Confirm region and subprocessors for your pilot contract before go-live; do not assume EU-only residency unless the project is provisioned that way.

---

## 4. Subprocessors (typical pilot stack)

| Subprocessor | Role |
| ------------ | ---- |
| Supabase | Database, Auth, Edge Functions, storage |
| Vercel | Frontend hosting / CDN |
| Resend (optional) | Transactional email when configured |
| Sentry (optional) | Error monitoring — hashed user ids; no message bodies |

Exact subprocessors for a named pilot are confirmed in the partner MOU.

---

## 5. Incident response & breach notification

- Operational runbooks: [`docs/operations/incidents.md`](../operations/incidents.md).
- Target for pilot partners: acknowledge security incidents affecting pilot data within **72 hours** of confirmed awareness, with a written follow-up on scope and remediation. Contractual SLAs may tighten this for named pilots.
- Moderator break-glass decrypt (legacy squad paths) is audited; v2 rooms are operator-readable by design today (see §2).

---

## 6. Data deletion on pilot termination

- On written pilot termination, operator deletes or archives pilot session rows, participant tokens, and related outcome drafts per retention policy ([`docs/operations/data-retention-operators.md`](../operations/data-retention-operators.md)).
- Released **public** ledger records, if any were deliberately published, are treated as published instruments — discuss retention before release.
- Default NGO pilot template prefers **private** anchored memos (no public ledger publish).

---

## 7. Sample artifacts for format inspection

Without requesting a pilot, evaluators can inspect:

- Illustrative ledger specimens on `/ledger` (labeled **ILLUSTRATIVE SPECIMEN (NOT VERIFIABLE)**).
- Downloadable redacted sample approved record and audit-trail export under `/diligence/` (synthetic; not a live release).

---

## 8. ADRs evaluators should read

- [ADR 004 — Defer operator-blind E2E](../adr/004-defer-operator-blind-e2e.md)
- [ADR 005 — Operator-blind design options](../adr/005-operator-blind-room-encryption-options.md)

---

## 9. Contact

Pilot intake: `/request-access` · Security narrative: `/security` · Registry-backed status badges appear on Security, How it works, Home, and Ledger.
