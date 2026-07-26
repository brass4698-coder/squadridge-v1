# Pilot deploy runbook — remote ops (v2 spine)

**Purpose:** Turn the v2 facilitator spine from “works locally” into **staging/production proof**.  
**Audience:** Operator with Supabase + Vercel (or equivalent) credentials.  
**Companion:** [`v2-pilot-checklist.md`](./v2-pilot-checklist.md) (session dry-run) · [`production-checklist.md`](./production-checklist.md) (release gate)

Do **not** run remote `db push` or production deploy from CI without explicit operator approval and a recorded commit SHA.

---

## 1. Record the deploy target

| Field | Value |
| ----- | ----- |
| Git commit SHA | |
| Supabase project ref | |
| Frontend deploy URL | |
| Operator | |
| Date | |

---

## 2. Database — apply migrations

From a machine linked to the target Supabase project:

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
supabase test db
npm run gen:types
```

**Expected:** All Jul 2026 migrations apply cleanly (capacity lock, dialogue stages, release provenance, digest/RAISE fixes, hot-path indexes, timestamp scaffold). Local `supabase db reset` should already be green on the same commit.

**Stop if:** pgTAP failures, type drift after `gen:types`, or incident hold migration `20260707` blocks CI — resolve before pilot.

---

## 3. Edge Functions — deploy + secrets

Deploy at minimum for v2 pilot:

```bash
supabase functions deploy health-check --no-verify-jwt
supabase functions deploy send-session-invite
supabase functions deploy serve-deck
```

### Required secrets

| Secret | Function(s) | Notes |
| ------ | ----------- | ----- |
| `SITE_URL` | `send-session-invite`, magic-link redirects | Production origin, no trailing slash |
| `SUPABASE_URL` | (auto) | Set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `serve-deck`, invite paths | Never in frontend bundle |

### Optional (email delivery)

| Secret | Notes |
| ------ | ----- |
| `RESEND_API_KEY` | Without this, invite email returns `delivery: manual` |
| `RESEND_FROM_EMAIL` | Verified sender domain |

**Without Resend:** MOU and facilitator runbook must state **manual link sharing** (copy `/p/invite/:token` and `/p/review/:token` from the app). This is the supported pilot path today.

### Smoke probes

```bash
curl -s "https://<PROJECT_REF>.supabase.co/functions/v1/health-check"
```

Expect JSON health payload (not 404). Deck access requires a grant row — test via `/decks` after facilitator login, not raw HTML paths.

---

## 4. Frontend — production build env

Set on the **build host** (Vercel project env or GitHub Actions secrets):

| Variable | Pilot value |
| -------- | ----------- |
| `VITE_SUPABASE_URL` | Target project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key |
| `VITE_V2_MOCK_DATA` | **unset or `false`** |
| `VITE_MAINTENANCE_MODE` | **unset or `false`** |
| `VITE_ZK_STUB` | **unset or `false`** |
| `VITE_SENTRY_DSN` + `VITE_SENTRY_USER_HASH_SALT` | Recommended for staging/prod |

Redeploy frontend after env changes. Verify `/ledger` shows empty live register (not fixture data) and `/pipeline` shows honest placeholders until real metrics are sourced.

---

## 5. Facilitator account bootstrap

1. Create or promote operator account in Supabase Auth.
2. Ensure `profiles.status = 'active'`.
3. Assign `facilitator` role (app metadata or `user_roles` per current schema).
4. Complete `/app/pilot-guide` on staging before partner session.

**Stop if:** Facilitator cannot reach `/app/sessions/new/setup` or sees pending/suspended gate.

---

## 6. Post-deploy verification (M3 prep)

Run on **staging** with 4–6 internal participants before any partner pilot:

| Step | Route | Pass |
| ---- | ----- | ---- |
| Create NGO deliberation session | `/app/sessions/new/setup` | Session row + stage = preparation |
| Invite participants | `/app/sessions/:id/invite` | Links copy; optional email or manual |
| Participant verify + join | `/p/invite/:token` → room | Verified admission |
| Facilitate through stages | `/app/sessions/:id/room` | Stage map visible; pacing works |
| Participant self-review | `/p/review/:token` | Approval recorded |
| Private release | Release console | SHA-256 bound; ledger **private** if unchecked |
| Public ledger (optional) | `/ledger` | Row appears only after deliberate publish |

Capture screenshots + commit SHA in pilot evidence folder per [`evidence-collection.md`](./evidence-collection.md).

---

## 7. Human gates (not automatable)

- [ ] Partner MOU: **operator-readable v2 room content** ([`threat-model.md`](../security/threat-model.md))
- [ ] Runbook drill: break-glass decrypt path understood ([`break-glass-moderator-decrypt-runbook.md`](./break-glass-moderator-decrypt-runbook.md))
- [ ] Metrics pre-registered ([`pilot-metrics-preregistration.md`](./pilot-metrics-preregistration.md))
- [ ] `FOUNDER_NOTE` + pipeline numbers in [`src/data/siteMessaging.ts`](../../src/data/siteMessaging.ts) — **only when sourced**; never invent traction

---

## 8. Explicitly deferred (post-first-pilot)

- Co-facilitator / observer ACL on v2 sessions
- Full verify/open/release email notification pipeline
- Live RFC 3161 TSA
- External security review
- Operator-blind E2E program (threat model §13)

---

## Quick reference — priority order

1. **This runbook** — `db push` + Edge deploy + secrets + frontend env  
2. **M3** — staging dry-run Configure → Release ([`v2-pilot-checklist.md`](./v2-pilot-checklist.md))  
3. **P1/P2** — MOU + runbook drill  
4. **P7** — one real private anchored release with a design partner  
5. Institutional depth — co-fac ACL, TSA, external audit
