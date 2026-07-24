# v2 Facilitator Pilot Checklist

Use this checklist for **facilitator-led v2 sessions** (`/app/*`, `/p/*`). It complements the legacy squad pre-flight in [`pilot-runbook.md`](./pilot-runbook.md) — do not substitute one for the other.

**Product path:** Configure → Verify → Facilitate → Release  
**Beachhead template:** NGO internal deliberation (`ngo_deliberation`) — private anchored outcome by default  
**Routes:** Facilitator `/app/sessions/...` · Participant `/p/invite/:token` … `/p/room/:token`  
**Not in scope for v2 pilots:** `/match`, `/verify`, squad ZK chat, `/admin/csi`, `/incident`, Track II as first session (soft-retired or deferred in UI).

---

## Before go-live

| # | Check | Stop condition |
|---|--------|----------------|
| 1 | Deployed commit recorded in pilot kickoff doc | Unknown build |
| 2 | `npm run check:all` green on that commit | Any prod-readiness failure |
| 2b | Facilitator completes `/app/pilot-guide` walkthrough (or scripted tour on staging) | Facilitator unfamiliar with spine |
| 2c | Metrics pre-registered in [`pilot-metrics-preregistration.md`](./pilot-metrics-preregistration.md) | Closeout cites unregistered claims |
| 3 | `supabase db push` + `supabase test db` green (includes `v2_session_lifecycle`) | Migration or pgTAP failure |
| 4 | Partner MOU states **operator-readable v2 room content** (not Signal-grade E2E) | Partner expects server-blind encryption |
| 5 | Facilitator account active (`profile.status = active`, `facilitator` role) | Pending or suspended facilitator |
| 6 | `VITE_V2_MOCK_DATA` is **unset or `false`** in deployed frontend | Fixture data in pilot |
| 7 | Public `/ledger` banner reviewed — live records appear only after `release_outcome` | Partner cites illustrative samples as outcomes |

---

## Session setup (facilitator)

| # | Step | Route |
|---|------|-------|
| 1 | Create session (prefer **NGO internal deliberation**; leave public ledger unchecked) | `/app/sessions/new/setup` |
| 2 | Invite participants (copy `/p/invite/:token` links) | `/app/sessions/:id/invite` |
| 3 | Review verification submissions | `/app/sessions/:id/participants` |
| 4 | Approve each participant (`verified`) | Same |
| 5 | Open room (`live` / `open`) | `/app/sessions/:id/control` |

**Manual today:** Participant email OTP is **not** sent automatically. Facilitator approval on the review screen is the real gate.

---

## Participant path

| # | Step | Route |
|---|------|-------|
| 1 | Open invite link | `/p/invite/:token` |
| 2 | Submit verification materials (pilot UI) | `/p/verify/:token` |
| 3 | Consent + briefing | `/p/consent/:token`, `/p/briefing/:token` |
| 4 | Wait until facilitator approves **and** opens session | `/p/waiting/:token` |
| 5 | Enter written room | `/p/room/:token` |

**Token security:** Invite links are bearer secrets (72h default expiry). Do not forward links on insecure channels.

---

## During session

- Facilitator messaging: `/app/sessions/:id/control` (Supabase Realtime with reconnect)
- Participant messaging: `/p/room/:token` (polling + visibility refresh)
- **No v2 in-room crisis alert** — agree an off-platform immediate-danger protocol before the pilot (see [`incidents.md`](./incidents.md))
- Do not demo mock pages (`/app/sessions/:id/room` redirects to control)

---

## Close and release

| # | Step | Route |
|---|------|-------|
| 1 | End session | `/app/sessions/:id/control` |
| 2 | Draft outcome (no room import) | `/app/sessions/:id/outcome` |
| 3 | Record approvals | `/app/sessions/:id/release` |
| 4 | Release to ledger | Same — verify `ledger_sha` on `/ledger` |

**Consent:** Facilitator-marked approvals are process metadata, not cryptographic party signatures. Document off-platform consent if required.

---

## Post-session diligence

- Export audit trail: `/app/sessions/:id` → Session audit section (metadata only, no message bodies)
- Check workflow notifications in facilitator dashboard / settings
- Record pre-registered metrics per [`impact-roadmap.md`](../product/impact-roadmap.md)
- Confirm first **live** ledger row (not illustrative sample) if claiming public proof

---

## Abort criteria (v2-specific)

Stop the pilot if:

- Participant token path fails (wrong table, expired token, cannot message)
- Facilitator can release outcome with verbatim room content (guard failure)
- Partner discovers demo was on `VITE_V2_MOCK_DATA=true` or mock routes
- Room content confidentiality assumptions differ from MOU (operator-readable)

---

## Related docs

- [`pilot-runbook.md`](./pilot-runbook.md) — legacy squad pre-flight, owners, incidents
- [`institutional-readiness-audit.md`](../audit/institutional-readiness-audit.md) — audience fit
- [`threat-model.md`](../security/threat-model.md) — engineering truth
