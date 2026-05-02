# Participant Consent Language (copy spec)

This file is a **copy spec**, not React. Each block below is the canonical text intended to be pasted into a specific participant-facing surface — invitation email, in-app onboarding, pre-session reminder, or settings — paired with the surface it belongs in. Wiring the copy into the app is a separate ticket; this document declares what that ticket should ship.

The institutional counterpart (what the partner organisation countersigns) is [`pilot-disclosure-pack.md`](./pilot-disclosure-pack.md). The two must stay consistent: changes to encryption, moderator visibility, IP posture, or incident response in the pack must propagate here in the same change.

> **Why a spec instead of direct edits?** The existing in-app copy at [`src/onboarding/app/components/onboarding/copy.ts`](../../src/onboarding/app/components/onboarding/copy.ts) is the source of truth for the onboarding flow today. This file proposes specific tightening edits and adds new copy blocks that do not yet have a host surface (invite email, pre-session reminder, withdrawal). The implementation ticket reconciles these against the existing copy and adds the missing surfaces.

---

## Block 1 — Invitation email

**Surface:** the email a partner organisation sends to invite a participant to the pilot, before they create any account. Today this email is partner-drafted and not in the repo. The partner should be given this block as a paste-in default.

**Required fields the partner fills in:** partner organisation name, cohort window dates, facilitator name (if disclosed), invite code, support contact.

```
Subject: Invitation: <cohort name> — verified-anonymous dialogue

You have been invited by <partner organisation> to take part in a small,
facilitated dialogue cohort on SquadRidge.

What this is
  - A bounded cohort of small squads, hosted between <start date> and <end date>.
  - A facilitator from <partner organisation> will run sessions; SquadRidge
    operates the platform.
  - Participation is verified-anonymous: we confirm you are eligible without
    asking for, or showing in the room, your real name.

Before you accept
  Please read these three points. If any of them is a deal-breaker for you,
  do not proceed.
  1. Squad message contents are encrypted, but they are not end-to-end
     encrypted against the platform operator. Authorised SquadRidge staff
     can read message contents under an audited, justified review when
     responding to a safety report or incident.
  2. Anonymous sign-in still creates a persistent server-side account
     identifier while your account exists. It is not visible to other
     participants in the room, but it is visible to the operator.
  3. SquadRidge does not dispatch emergency services. If you are in
     immediate danger, contact local emergency services first.

How to join
  Open <invite URL> and enter the code: <invite code>
  You will be guided through a short onboarding before your first session.

Support
  Questions or trouble joining? Contact <support contact> at <partner
  organisation>. Do not include personal identifying details.
```

**Privacy guardrails for the email itself:**

- Do not put the participant's real name in the subject line; partner-side mail systems typically log subjects to retention windows the partner does not control.
- Do not include personal data in the body beyond what the partner already knows about the participant.
- If the partner uses a marketing platform with click-tracking, **disable click tracking for this campaign**. Otherwise the platform will log per-participant click metadata against the IP they used to open the link.

---

## Block 2 — Onboarding consent (in-app, replaces "Squad chat & the operator" explainer)

**Surface:** [`src/onboarding/app/components/onboarding/copy.ts`](../../src/onboarding/app/components/onboarding/copy.ts), the `messagingPrivacyExplainer` field under `COPY.rules`.

**Today's text** (paraphrased — see file for verbatim):

> Squad messages use per-squad keys managed with the app: storage is encrypted, but the service and authorized staff can read content under policy. That is not end-to-end encryption against the platform.

**Tightening edit (proposed text to ship):**

> Squad messages are encrypted at rest with per-squad keys managed by the app. The platform is not server-blind: authorised SquadRidge staff can read message contents through an audited review path that requires a written justification before plaintext is returned. This is not end-to-end encryption against the platform. Per-message device-only encryption is on the roadmap and is not shipped today — see the Security page for the full scope.

**Why the change.** The current text says "the service and authorized staff can read content under policy" but does not name the audit. The institutional pack ([`pilot-disclosure-pack.md`](./pilot-disclosure-pack.md) §4) says decrypt requires a justification ≥ 8 chars and writes a `moderation_audit_log` row before plaintext is returned. Participants should hear the same thing.

**Word budget.** The existing field is 271 chars (see `COPY_CHAR_MANIFEST.rules.messagingPrivacyExplainer`). The new text is ~470 chars; the implementation ticket should either accept the longer body or split into two short blocks (one sentence + a "Read more" disclosure).

---

## Block 3 — Onboarding consent (in-app, paired addition for verification)

**Surface:** same file as Block 2; either extends the `verifiedAnonymityExplainer` field under `COPY.rules` or sits next to it.

**Today's text** is honest about "checks may be lighter in early phases" but does not mention that the proof-account binding is server-side. Participants should hear that detail before they verify.

**Proposed addition (after the existing `verifiedAnonymityExplainer`):**

> When you complete verification in the main app, your proof is bound to your SquadRidge account on our server. The room learns "this account is eligible" — it does not learn the underlying identifier from the verification step. The platform learns the link between your account and the proof.

**Why.** Reflects the engineering fact in [`docs/security/threat-model.md`](../security/threat-model.md) §5: "ZK submissions are tied to the logged-in user."

---

## Block 4 — Pre-session reminder (in-app banner or pre-session email)

**Surface:** new — does not yet exist as a dedicated UI surface. Implementation ticket should choose between (a) an in-app banner shown the first time the participant enters a session room in the cohort, and (b) a 24-hour pre-session email from the facilitator. Either way, the text below is the canonical version.

```
Before your session

Three reminders before you enter the room:
  - Pause is always an option. The room has a Pause control. Use it any
    time the conversation feels unsafe or you need a break.
  - Crisis alert is one tap away. The Alert Facilitator button beside the
    chat sends an out-of-band alert to the on-call facilitator. There are
    three reasons you can choose: immediate danger, request a pause, or
    request a facilitator to join. The facilitator does not see free-form
    text from this alert — only the reason.
  - In immediate physical danger, contact local emergency services first.
    SquadRidge does not dispatch emergency services. The Crisis Resources
    panel inside the room has reference numbers.

If a session is paused mid-flight, the facilitator will explain in the room
or follow up after. You can leave at any time without giving a reason.
```

**Source for these specifics:** [`docs/operations/pilot-runbook.md`](../operations/pilot-runbook.md) § "Crisis alert flow" and `[src/components/session/AlertFacilitatorButton.tsx](../../src/components/session/AlertFacilitatorButton.tsx)`.

---

## Block 5 — Withdrawal language (in-app settings + email response template)

**Surface:** Profile / Settings page (an existing surface — see [`src/pages/ProfileSettingsPage.tsx`](../../src/pages/ProfileSettingsPage.tsx)) and an email template the facilitator uses when a participant requests withdrawal out-of-band.

```
Leaving the cohort

You can leave the cohort at any time, without giving a reason. To leave:
  - Tell your facilitator (this is the fastest path), or
  - Use "Leave cohort" in Settings.

What happens when you leave
  - You stop receiving session invitations and reminders.
  - Your participation in past sessions stays on record for the facilitator
    and for SquadRidge moderation, because messages you sent in past
    sessions remain in the squads you sent them in. Other participants in
    those squads can still see them; we cannot retroactively un-send them.
  - Your account itself is not deleted by leaving the cohort. To delete the
    account, see Account → Delete account in Settings, or contact support.
  - Account deletion removes profile and routing fields; it does not delete
    messages you have already sent (same reason as above).

What we do not do
  - We do not contact your employer, school, or any third party to confirm
    your departure.
  - We do not share with other participants that you left, beyond the fact
    that you are no longer in the squad's member list.
```

**Why this exists.** Today the participant-facing flow has consent at entry but no canonical withdrawal language. The implementation ticket should also confirm the engineering reality of "leave cohort" (whether it is a single action, what tables it touches, whether there is a separate account-deletion flow) and reconcile any gaps between the copy and the code.

---

## Block 6 — Out-of-bounds phrases (do-not-use list for participant copy)

To stay consistent with [`pilot-disclosure-pack.md`](./pilot-disclosure-pack.md) §8 and the marketing-surface guard at [`scripts/check-banned-public-copy.mjs`](../../scripts/check-banned-public-copy.mjs), participant-facing copy must not use, **without an explicit negation in the same sentence or paragraph**, any of:

- "end-to-end encrypted" / "end-to-end encryption"
- "Signal-grade" / "Signal-style" (when describing what we ship)
- "server-blind"
- "operator-proof" / "operator cannot read"
- "fully anonymous" (we are verified-anonymous; "fully" overclaims)
- "we hash IPs" / "we anonymise IPs at ingest" (the application has no IP to hash — see [`docs/operations/ip-logging.md`](../operations/ip-logging.md))

If a draft participant-facing surface contains any of these, revise before shipping.

---

## Implementation ticket (out of scope of this spec)

When the implementation ticket lands, it should:

- update [`src/onboarding/app/components/onboarding/copy.ts`](../../src/onboarding/app/components/onboarding/copy.ts) with the Block 2 and Block 3 edits and refresh `COPY_CHAR_MANIFEST` accordingly;
- add a pre-session reminder surface for Block 4 (banner or email — pick one) and reference it from [`docs/operations/pilot-runbook.md`](../operations/pilot-runbook.md) § "Pre-Session Readiness Checklist";
- add the Block 5 withdrawal copy to the Profile / Settings page and confirm the engineering reality of "Leave cohort";
- give the partner the Block 1 invite email as a paste-in default during pilot kickoff (see the institutional pack §1 § "How to use this pack").

This file does not file that ticket; it declares what the ticket must contain.
