# Feature Specifications

> **Canonical overview:** [platform-description.md](platform-description.md). This document lists features by implementation status. Do not describe legacy squad matchmaking as the primary product unless the audience is engineering or migration.

---

## v2 facilitator platform (primary)

### 1. Facilitator session lifecycle

Structured mediation workflow: **Configure → Verify → Facilitate → Release**.

| Step | Capability | Status |
| ---- | ---------- | ------ |
| Configure | Session create with title, template, `setup_config`, participant cap | **Shipped** |
| Verify | Participant tokens, facilitator verification review | **Shipped** (participant OTP UI partially simulated) |
| Facilitate | Realtime `session_messages`, facilitator control room | **Shipped** |
| Release | Outcome draft, approvals, `release_outcome` RPC, ledger publish | **Shipped** |

**Purpose:** High-stakes dialogue with a credible public outcome and no published transcript.

### 2. Facilitator-led messaging room

- Structured **written** dialogue only — no video, audio, or call integrations.
- Facilitator controls prompts, rounds, pace, and release.
- Room content **never** published to ledger.

**Status:** **Shipped** (core path). Mock alternate room UI exists for design (`LiveRoomPage`).

### 3. Room / record separation

- Private: `sessions`, `participants`, `session_messages`.
- Public: `outcome_records` with `ledger_sha` anchor after facilitator release.

**Status:** **Shipped** architecturally. Enforcement of skipped lifecycle steps is **partial** (manual status updates).

### 4. Session templates

Three templates: community mediation, NGO deliberation, Track II dialogue — ground rules, outcome structure, approval rules.

**Status:** **Shipped** — [`src/lib/sessionTemplates.ts`](../../src/lib/sessionTemplates.ts).

### 5. Invite-only access and roles

- Pilot request form → manual review → staff invite → magic link → role assignment.
- Roles: `super_admin`, `institution_admin`, `facilitator`, `mediator`, `analyst`, `participant`, `observer`.

**Status:** **Shipped** for staff invites. Session participant token path **partially** aligned with staff invite flow.

### 6. Public ledger and verification anchor

- Query published `outcome_records`; display anchor via `ledgerDisplay`.
- Sample records labeled **illustrative** when no live data.

**Status:** **Shipped** UI + release RPC. Independent public verify UX depends on deployment; samples use static hashes.

### 7. Marketing and legal surfaces

- Landing, How It Works, Use Cases, Security, FAQ, About, Contact, Privacy, Terms.

**Status:** **Shipped**. Copy governed by `squadridge_platform_spec.json` and `check:banned-copy`.

### 8. Workflow automation (planned)

Spec calls for notifications at invite, verify, approve, release. Notification preferences table exists.

**Status:** **Planned** — not fully wired to email/workflow events.

### 9. Room-level E2E encryption

**Status:** **Roadmap** — not operator-blind today. See [threat model](../security/threat-model.md) §13.

---

## Legacy product lines (still in repository)

### A. Structured squad matchmaking

Intent-pool matching into encrypted squad chat; Semaphore ZK verification path; `ingest-message` Edge Function with server-side redaction.

**Status:** **Legacy**, still routed in v2 app (`/match`, `/session/:squadId`). Application-layer encryption — **not** operator-proof E2E. See threat model §5.

### B. Incident dialogue rooms

Structured incident response rooms (`incident_rooms`, moderation, severity tiers).

**Status:** **Implemented**, mounted in legacy `App.tsx` only — **not** the v2 primary story.

### C. AI-assisted de-escalation and translation

Optional translation workers; tone/de-escalation UX on legacy squad path.

**Status:** **Partial** — optional; core v2 mediation does not depend on AI.

### D. Aggregated early-warning / sentiment analytics

Described in research docs and dashboard fixtures.

**Status:** **Not shipped** as production analytics product; dashboard metrics may show **pilot/fixture** data in dev.

---

## Claims discipline

| Claim | Allowed? |
| ----- | -------- |
| Facilitator-led written room | Yes |
| Verification anchor on released records | Yes (for release path) |
| No video/audio on platform | Yes |
| Completed pilots / named partners | **Only if verified** |
| Operator-blind E2E | **No** (today) |
| Full platform zero-knowledge | **No** |
| Public transcript | **No** |

See [public-claims-audit.md](../security/public-claims-audit.md).

---

## References

- [Platform description](platform-description.md)
- [Threat model](../security/threat-model.md)
- [Data model](../technical/data-model.md)
- [Auth and sessions](../technical/auth-and-sessions.md)
