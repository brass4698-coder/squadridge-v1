# Pilot Runbook

This runbook is for early facilitator-led pilots. It assumes a bounded cohort, named internal owners, and a willingness to pause the pilot if safety or product confidence drops.

## Pilot Shape

Recommended first pilots:

- 1 partner organization
- 1 facilitator or moderator lead
- 1 narrowly defined participant cohort
- 1-3 dialogue sessions
- clear pre-session consent and post-session feedback

Avoid broad public launches as the first proving ground.

## Pilot Owners

Assign before launch and record the actual names, emails, and on-call contacts in [`pilot-owners.md`](./pilot-owners.md):

- product owner
- technical owner
- moderation owner
- facilitator owner
- partner owner

For an in-flight emergency reference, see [`pilot-quickstart.md`](./pilot-quickstart.md).

## Before The Pilot

1. Confirm the exact cohort and purpose.
2. Confirm the version being used and staging/production environment.
3. Verify the release checklist in [`production-checklist.md`](./production-checklist.md).
4. Review current security boundaries with the partner.
5. Confirm incident roles using [`incidents.md`](./incidents.md).
6. Confirm what metrics will be collected.
7. Prepare participant-facing materials:
   - onboarding instructions
   - consent and safety language
   - support contact
   - what to do if the session is paused

## Pre-Session Readiness Checklist

- facilitator account works
- moderator account works
- verification flow works in the target environment
- matchmaking flow works or the session cohort is pre-arranged
- session entry works for test accounts
- post-session feedback flow is ready
- partner knows the support escalation path

## Security pre-flight checklist (Phase 3.4)

Run this before every pilot. Each item is a **stop the pilot** condition until resolved. Add the date and signoff name beside each item in the pilot kickoff doc.

### Bundle integrity

- [ ] CI run against the exact commit being deployed shows green for `check:no-zk-stub-prod`, `check:no-demo-decoys-prod`, `check:no-raw-console`, `check:prod-readiness`, `check:database-types`.
- [ ] Production frontend bundle does **not** contain the literal string `squadridge-decoy-` (run `grep -r squadridge-decoy dist/ || echo OK`). Bundled Semaphore decoys collapse the anonymity set; their presence is a release-stop.
- [ ] `VITE_ZK_STUB` is unset or `false` in the deployed environment.
- [ ] `VITE_SEMAPHORE_DEMO_GROUP` is unset (or has both `VITE_ALLOW_DEMO_DECOYS_IN_PROD=true` *and* an explicit operator note that this is an internal-demo build).

### Database posture

- [ ] All migrations under `supabase/migrations` apply cleanly via `supabase db push`.
- [ ] pgTAP suite (`supabase test db`) is green: `messages_insert_edge_only`, `create_demo_squad_atomic`, `demo_claim_consent_flow`.
- [ ] `select tgname, tgenabled from pg_trigger where tgname in ('squads_message_encryption_key_default', 'moderation_audit_log_block_review_mutations')` — both rows must show `tgenabled = 'O'` (enabled).
- [ ] If using issuer-managed anonymity groups (Phase 2.1), at least one row in `public.issuer_groups` and its `current_root_expires_at` is in the future.

### Edge functions

- [ ] `ingest-message` deployed and bundled (`npm run bundle:ingest-message` produced a non-empty `edge.bundle.mjs` in the same commit).
- [ ] `verify-zk-proof`, `crisis-alert`, `match-notify`, `rate-limit` all deployed.
- [ ] `ALLOWED_ORIGINS`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `MATCH_QUEUE_WEBHOOK_SECRET` set in Supabase secrets.

### Key custody

- [ ] No client-generated `squads.message_encryption_key` rows since the last rotation. Confirm with `select count(*) from public.squads where message_encryption_key is null;` (should be zero).
- [ ] Documented owner for the rotation playbook in `docs/security/secrets-rotation.md`.

### Observability

- [ ] Sentry DSN configured for the deployed environment (`VITE_SENTRY_DSN`).
- [ ] Dashboard queries below return data when run as service-role.
- [ ] On-call moderator subscribed to the Sentry release alerts and to the crisis-alert webhook (if wired).

### Emergency rollback steps

1. **Identify the bad release.** `git log` on `main` since the last green pilot.
2. **Revert frontend.** Roll the hosting provider (Vercel/Netlify/Cloudflare) back to the prior deploy artifact — instantaneous.
3. **Roll database back if a migration is at fault.** Use the Supabase dashboard's point-in-time recovery to a timestamp **before** the bad migration; do **not** attempt manual DROP on tables that contain user data without an explicit decision and a fresh backup snapshot.
4. **Revoke Edge function secrets** if a key compromise is suspected (rotate via dashboard, redeploy with new values).
5. **Notify pilot partners** via the channel agreed in onboarding before the pilot resumes.

## Observability — pilot dashboards (Phase 3.4)

The migration `20260428270000_pilot_observability_views.sql` creates read-only views for the most-watched signals. Wire each to your dashboard tool of choice (Supabase log drain → Grafana, or query directly via service-role client). Suggested alert thresholds are documented as queries below.

### Match queue depth

```sql
SELECT * FROM public.pilot_match_queue_depth ORDER BY pool_key, side;
```

Alert when any pool/side combination has `row_count > 50` waiting for more than 5 minutes (sign of stalled matchmaking).

### Match latency (24h)

```sql
SELECT * FROM public.pilot_match_latency_24h ORDER BY pool_key;
```

Alert when `avg_match_seconds > 600` for a pool that previously matched in under 60s — investigate the matching pool config and Edge `match-notify` webhook.

### Moderator decrypt count (24h)

```sql
SELECT * FROM public.pilot_decrypt_audit_24h ORDER BY hour_bucket DESC LIMIT 24;
```

**Alert when `decrypt_count > 25` in any hour**, or `distinct_squads > 10` — both indicate either a coordinated event (e.g. a flagged room) or a moderator-side anomaly. The Phase 2.2 SQL rate-limit caps individual moderator activity; this view catches *cohort-wide* spikes.

### Claim finalize (24h)

```sql
SELECT * FROM public.pilot_claim_finalize_24h;
```

`finalized_without_verified_user > 0` is a **data-integrity alert** — open an incident.

### Key creation events (24h)

```sql
SELECT * FROM public.pilot_key_creation_events_24h ORDER BY hour_bucket DESC LIMIT 24;
```

Use as a pulse on matchmaking + demo squad creation rates. Sudden zero rate during pilot hours = matchmaking sweep stalled.

### Open crisis alerts

```sql
SELECT * FROM public.pilot_crisis_alerts_open;
```

**Page the on-call moderator** when a row with `reason_code = 'immediate_danger'` has `open_seconds > 60`.

### Retention cleanup (24h)

```sql
SELECT * FROM public.pilot_retention_cleanup_24h ORDER BY hour_bucket DESC LIMIT 24;
```

The hourly `cleanup-expired-data` cron now calls `public.run_expired_data_cleanup()` (migration `20260429140000_retention_cleanup_metrics.sql`) and writes one row to `public.retention_cleanup_runs` per pass. **Alert when no rows have been written in the last 90 minutes** — the cron stalled and the TTL story is no longer enforced. During an active pilot, `messages_deleted = 0` for every hour over 24h while traffic is flowing is a separate alert: the trigger that sets `expires_at` may have been disabled.

### Realtime telemetry

The realtime hook records subscribe/unsubscribe and fallback events into an in-tab counter (`getRealtimeTelemetry()`). For now it is a devtools / Sentry-breadcrumb signal; a future cron will sample it. See [`docs/adr/002-realtime-vs-polling.md`](../adr/002-realtime-vs-polling.md) Phase 3.2 follow-up.

## During The Pilot

The operating posture is calm, observable, and conservative.

- keep one technical owner on standby
- keep one moderation owner on standby
- watch for verification dropoff, session-entry failures, and escalations in tone
- do not push non-essential changes during the pilot window
- if a session becomes unsafe or technically unstable, pause rather than improvising around risk

## Abort Criteria

Pause or stop the pilot if any of the following happen:

- suspected access control failure
- suspected privacy leak or cross-cohort data exposure
- major verification failure rate
- repeated inability for participants to enter sessions
- moderator controls not behaving as expected
- partner or facilitator no longer has confidence in session safety

## After Each Session

Capture:

- session completed or not
- participants who reached the room
- duration
- incidents or escalations
- facilitator notes
- participant survey results
- follow-up actions

## Crisis alert flow (Phase 2.4)

Participants can raise an out-of-band alert from the session chrome
(see [`src/components/session/AlertFacilitatorButton.tsx`](../../src/components/session/AlertFacilitatorButton.tsx))
that bypasses the chat / message stream entirely. Three reason codes are accepted:

- `immediate_danger` — page on-call facilitator immediately.
- `request_pause` — facilitator should pause the room.
- `request_facilitator` — non-emergency, ask a facilitator to join.

**On-call response:**

1. Watch the `crisis_alerts` table (or wire a dashboard query / Slack webhook). The Phase 3.4 follow-up adds a single-pane alert dashboard; until then, query
   ```sql
   SELECT id, squad_id, reason_code, created_at FROM public.crisis_alerts
   WHERE acknowledged_at IS NULL ORDER BY created_at DESC;
   ```
2. Acknowledge by updating `acknowledged_at = now(), acknowledged_by = auth.uid()` while signed in as a moderator (RLS enforces).
3. For `immediate_danger` alerts, **acknowledge and contact the participant within 60 seconds**. Document outcome in [`incidents.md`](./incidents.md).
4. Facilitators do **not** see participant-typed details — only the reason code. Free-form context is intentionally not collected so logs stay PII-free. Coordinate via separate moderator channels if context is needed.
5. The Crisis Resources panel (`CrisisResources.tsx`) is always available in-room as a participant-side fallback. SquadRidge does **not** dispatch emergency services; remind participants of this in onboarding copy.

**Rate limits.** The `crisis-alert` Edge Function uses a separate Redis bucket (`action: 'crisis_alert'`) so chat throttling does not suppress emergencies. If you see runaway alerts, raise the cap in `rate-limit/index.ts` rather than tightening the chat limiter.

## Verification failures (facilitators)

If participants cannot complete **`verify-zk-proof`** during the pilot window:

1. Confirm **`VITE_ZK_STUB`** is **not** enabled on the deployed SPA (`false` or unset). Hash-stub builds block live squad sessions and must not be used for diligence-oriented pilots.
2. Confirm the **`verify-zk-proof`** Edge Function is deployed and reachable from the participant network (TLS, mixed content, regional blocking, or corporate proxies).
3. Capture a **safe** diagnostic: HTTP status line for `functions/v1/verify-zk-proof` only. **Do not** paste Semaphore proof bodies or attribute text into unsecured tickets or chat.
4. Escalate to the technical owner with timestamp, cohort or environment name, and anonymized reproduction steps.

Retry guidance for participants: reload the verification page once after ensuring an anonymous session is active; avoid rapid repeated attempts that may hit Edge rate limits.

## Metrics To Record

Minimum useful pilot metrics:

- invited participants
- completed onboarding
- completed verification
- reached matched or assigned session
- completed session
- repeat participation intent
- facilitator satisfaction
- participant usefulness/trust score
- incident count by severity

See [`../product/metrics-spec.md`](../product/metrics-spec.md).

## Pilot Closeout

At the end of the pilot, produce a short memo containing:

- cohort and use case
- what worked
- what broke
- key metrics
- key trust or safety observations
- whether the next pilot should expand, repeat, or pause
