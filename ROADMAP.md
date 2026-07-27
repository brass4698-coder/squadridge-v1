# SquadRidge Roadmap — Phase A Checklist

**Horizon:** Next 90 days · **Strategy:** [docs/product/impact-roadmap.md](docs/product/impact-roadmap.md)

Track P0/P1 items here before claiming pilot impact or differentiation. Mark complete only when acceptance criteria are met.

---

## P0 — Blockers (must ship before credible pilot)

### 1. Enforced session state machine

- [x] DB or RPC rejects `live`/`open` status if required participants are not `verified`
- [x] DB or RPC rejects `release_outcome` if any required approval is not `approved`
- [x] Facilitator UI surfaces clear error when transition is blocked (not silent failure)
- [x] Unit or pgTAP test covers invalid transitions

**Files:** new migration, `SessionControlPage`, `OutcomeReleasePage`, `release_outcome` RPC  
**Acceptance:** Facilitator cannot skip Verify → Facilitate or Release without approvals in a fresh session.

---

### 2. Fix participant token invite path

- [x] `/p/invite/:token` validates against `participants.invite_token` (or participant RPC), not staff `invites` table
- [x] Accept flow redirects to `/p/verify/:token`, not `/invite/accept/:token`
- [x] Token expiry and declined states handled with recoverable error UI
- [x] E2E: demo-token walkthrough invite → `/p/room` (`e2e/phase0-routing.spec.ts`)
- [x] Integration: pgTAP facilitator `invite_token` → consent → verify → live room messaging (`supabase/tests/database/v2_participant_invite_to_room.test.sql`)

**Files:** `ParticipantInvitePage`, `InviteAcceptancePage`, `participantToken.ts`, participant RPCs  
**Acceptance:** Facilitator-generated participant link works without staff-invite workaround.

---

### 3. Architectural record redaction

- [x] Outcome editor has no “import from room” or paste-from-messages action
- [x] Outcome fields are facilitator-authored only (`summary`, `agreed_terms`, `pending_items`)
- [x] UI copy states room content cannot be copied into the record
- [x] Optional: server-side reject if outcome payload contains verbatim `session_messages` hash match

**Files:** `OutcomeWorkspacePage`, `OutcomeReleasePage`, platform spec `record-redaction-enforcement`  
**Acceptance:** No code path publishes raw session dialogue to `outcome_records`.

---

## P1 — Credibility enablers

### 4. Workflow notifications

- [x] In-app notifications on: verification submitted, room opened, approval recorded, record released
- [x] Respects `user_notification_prefs.in_app_session_alerts`
- [ ] Email delivery (future); failed sends logged when email pipeline ships

**Files:** `20260710_001_session_audit_and_notifications.sql`, `useWorkflowNotifications`, `WorkflowNotificationsBanner`  
**Acceptance:** Pilot facilitator sees in-app alerts for standard lifecycle events.

---

### 5. v2 audit trail

- [x] `session_audit_events` table: metadata only, append-only
- [x] Events: `verification_submitted`, `participant_verified`, `room_opened`, `room_entered`, `prompt_posted`, `approval_given`, `record_released`
- [x] RLS: facilitator + super_admin read; participants cannot read audit log
- [x] Export via `export_session_audit_trail` on session detail page

**Files:** migration, `useSessionAudit`, `SessionAuditPanel`  
**Acceptance:** Post-session export shows ordered metadata trail for diligence review.

---

### 6. First live ledger records

- [x] `LedgerIndexPage` shows live records when `outcome_records.status = published` exists
- [x] Public anchor verifiable via `ledger_sha` recompute (`release_outcome` RPC)
- [ ] At least one real pilot session completes Release in production/staging (operator step)
- [ ] Partner consent documented for any public metadata

**Files:** `LedgerIndexPage`, `LedgerRecordPage`, [`v2-pilot-checklist.md`](docs/operations/v2-pilot-checklist.md)  
**Acceptance:** One non-sample SQR record on ledger from a real facilitated session.

---

### 7. Unify “New session” entry

- [x] `/app/sessions/new` redirects to `/app/sessions/new/setup` OR setup wizard persists a real session
- [x] Dashboard “New session” CTA uses real create path only
- [x] Remove or gate hardcoded `sess-new-001` fixture from primary flow (`VITE_V2_MOCK_DATA` opt-in only)

**Files:** `App.v2.tsx`, `SessionNewPage`, facilitator dashboard  
**Acceptance:** New facilitator creates a real session row on first attempt.

---

## P2 — Evidence (parallel to pilot)

### 8. Pre-registered pilot metrics

- [x] Metrics template defined ([`docs/operations/pilot-metrics-preregistration.md`](docs/operations/pilot-metrics-preregistration.md))
- [ ] Metrics filled before cohort starts (verification rate, time-to-release, session completion)
- [ ] Facilitator rubric + optional 7-day participant follow-up survey (template in metrics doc)
- [ ] Results stored per [evidence-collection.md](docs/operations/evidence-collection.md); no public “lives saved” claims

**Acceptance:** Partner pilot closeout memo cites pre-registered metrics only.

---

## Out of scope until first private released outcome

Do not expand into these until one NGO pilot completes Release with a non-public anchored record:

- Citizen matchmaking / public ZK verify UI as a product surface
- Operator-blind E2E encryption program
- Civic early-warning / CSI as a public product
- New session templates or Ridge Protocol round choreography
- Track II / city community safety as default create-session paths
- Email notification delivery pipeline (in-app alerts are enough for first pilot)

## Phase B preview (not Phase A)

See [impact-roadmap.md](docs/product/impact-roadmap.md) and [ridge-protocol-spec.md](docs/product/ridge-protocol-spec.md) for 12-month differentiation work. Do not start B1 until P0 items 1–3 are complete and the freeze above is lifted.
