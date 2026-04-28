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

Assign before launch:

- product owner
- technical owner
- moderation owner
- facilitator owner
- partner owner

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
