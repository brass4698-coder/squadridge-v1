# Pilot Disclosure Pack (institutional)

This document is the **pre-pilot honesty pack** for partner organisations evaluating SquadRidge for a bounded cohort. It is not a contract and it does not replace counsel review. It is the canonical summary of what the platform does and does not do today, written so a partner can make an informed go/no-go decision before any participant is onboarded.

If a partner-facing claim made elsewhere (sales conversation, deck, email) conflicts with this pack, **this pack is correct and the other claim is wrong**. The engineering source of truth behind every section is [`docs/security/threat-model.md`](../security/threat-model.md); this pack is the operator-curated summary of that document for partner conversations.

> **Counterpart:** participant-facing language for in-app consent and onboarding email is in [`participant-consent-language.md`](./participant-consent-language.md). The two documents are designed to be consistent — when this pack changes, the participant copy must change with it.

---

## How to use this pack

1. Share with the partner's primary contact (named in [`docs/operations/pilot-owners.md`](../operations/pilot-owners.md) under "partner owner") **before** any cohort design conversation.
2. Walk through Sections 2–7 with the partner; capture any objections in writing.
3. Have the partner countersign the block in Section 9 before the pilot's first session.
4. File the countersigned copy with the pilot's evidence pack (see [`docs/operations/evidence-collection.md`](../operations/evidence-collection.md)).

---

## 1. What SquadRidge is today

SquadRidge is a pilot-stage platform for verified-anonymous, facilitator-led cross-border dialogue in small squads. It is appropriate for:

- bounded cohorts (single partner organisation; named participants invited by code)
- one to three structured sessions
- facilitator-staffed and operator-monitored use
- partners who want a more verified and structured surface than general-purpose chat or meeting tools

It is **not** appropriate (today) for: broad self-serve onboarding of high-risk populations, deployments where any operator-readable content is unacceptable, or any pilot whose go/no-go depends on Signal-style server-blind encryption. Those positionings are explicitly out of scope per [`CURRENT_STATUS.md`](../../CURRENT_STATUS.md) "Demo Only Or Requires Extra Validation".

---

## 2. Verification model

What the partner gets:

- A **Semaphore-style zero-knowledge membership proof** is generated in the participant's browser and verified server-side by the [`verify-zk-proof`](../../supabase/functions/verify-zk-proof/index.ts) Edge Function (shared logic in [`supabase/functions/_shared/handleZkProofVerification.ts`](../../supabase/functions/_shared/handleZkProofVerification.ts)).
- The proof property the room learns is **group membership without revealing identifier** — a participant proves they belong to an issuer-managed anonymity group, the room learns the eligibility scope and not the underlying credential.
- Production builds refuse to ship with the development hash stub (`VITE_ZK_STUB`) enabled. CI enforces this via [`scripts/ensure-no-zk-stub-prod.mjs`](../../scripts/ensure-no-zk-stub-prod.mjs).
- Issuer-managed anonymity groups (`public.issuer_groups`) are the production trust root. Bundled in-source decoys exist for internal demos only and are double-gated behind two environment flags ([`docs/security/threat-model.md`](../security/threat-model.md) §13.1).

What the partner must understand:

- ZK submissions are **bound to the authenticated `user_id`** server-side. The platform learns "this account produced this proof, against this scope, with this nullifier." It does not learn the underlying real-world identifier from the proof ceremony.
- Issuer-group manifests have an expiry (`current_root_expires_at`); operator rotation is currently manual. A failure to rotate fails closed (proofs are rejected with `STALE_PROOF_ROOT`) — it does not silently weaken anonymity.
- The Semaphore stack and the `verify-zk-proof` handler have not yet had an external security review. Tracking issue: see [`docs/operations/threat-model-release-checklist-issues.md`](../operations/threat-model-release-checklist-issues.md) issue **ZK-1**. Partners with a regulatory or contractual requirement for an independent crypto review should treat that issue as a precondition.

---

## 3. Encryption posture (the disclosure that drives most partner decisions)

This is the section where most partner conversations either accept the pilot scope or escalate to "we need server-blind first." Read it carefully.

**What is shipped today:**

- Each squad message body is encrypted with **AES-256-GCM** at the application layer (random 12-byte IV per message). Ciphertext lives in `messages.payload_ciphertext`.
- The symmetric key per squad is organised into per-squad **epochs** (`public.squad_key_epochs`). The current epoch is referenced by `squads.current_epoch_id`; each message stamps its `key_epoch_id`.
- A moderator-callable, audited rotation RPC (`public.rotate_squad_key`) mints a new 32-byte AES key, retires the previous epoch, and writes a `moderation_audit_log` row.
- A daily pg_cron job purges retired-epoch key material for live squads after 30 days. Archiving a squad immediately purges per-epoch keys and keeps a single recovery surface (`squads.archived_encryption_key_snapshot`).
- Outbound message redaction runs **before** the row is stored — direct authenticated INSERTs into `messages` are blocked by RLS (`WITH CHECK (false)`) per migration `20260428194500_messages_insert_edge_only.sql`. Every chat write goes through the `ingest-message` Edge Function. A custom client cannot persist un-redacted ciphertext.

**The disclosure obligation (this is the part to read out loud to a partner):**

- This is **not** Signal-style end-to-end encryption against the platform operator.
- The squad symmetric key sits in Postgres alongside ciphertext. Anyone with **service-role** access, or a **moderator** invoking the audited decrypt RPC with a written justification, can read message contents.
- Moderator decrypt is **audited** — it writes a `message_plaintext_decrypt_review` row to `moderation_audit_log` (with required justification ≥ 8 characters) **before** plaintext is returned. It is not server-blind.
- The interim purge of retired-epoch keys bounds the **future-DB-snapshot** attack window. It does not protect against an operator who copies a live key, and it is not a substitute for a per-message ratchet.

The decision to ship operator-readable encryption today, instead of a partial server-blind build, is recorded explicitly in [ADR 004](../adr/004-defer-operator-blind-e2e.md) along with the named triggers that would re-open the build decision (partner contract, threat-model change, independent review finding, sustained engineering capacity, standards maturity). Reference both [`docs/security/encryption-scope.md`](../security/encryption-scope.md) and [`docs/security/threat-model.md`](../security/threat-model.md) §5 for the engineering detail.

---

## 4. Moderator visibility and access

- **Audited decrypt path.** Moderators (rows in `public.moderators`) read message plaintext via the `moderator_decrypt_message_for_review` RPC, surfaced in the Mod dashboard at `/admin/csi`. The justification (free-text, ≥ 8 chars, must name an incident or ticket) is recorded with the actor `user_id` and the message `id` in `moderation_audit_log` **before** plaintext is returned. The full procedure, including what is not permitted (curiosity reads, bulk decrypt), is in [`docs/operations/incidents.md`](../operations/incidents.md) § "Moderator decrypt-for-review".
- **No raw transcript export.** By design — even facilitators cannot pull a full transcript out of the platform. The most attractive artifact in any future compromise does not exist.
- **Service-role break-glass.** Direct privileged DB access is the **last resort** during a `SEV-0` / `SEV-1` incident, requires dual control, MFA, narrowly scoped reads, and is captured in the incident timeline. Procedure in [`docs/operations/incidents.md`](../operations/incidents.md) § "Service-role break-glass".
- **Moderator activity caps.** Per-moderator decrypt rate limits are enforced in SQL; cohort-wide spikes are watched via the `pilot_decrypt_audit_24h` view, with documented alert thresholds in [`docs/operations/pilot-runbook.md`](../operations/pilot-runbook.md).
- **Partners can request the audit log** for their cohort's window as part of pilot closeout (see Section 7).

---

## 5. IP and metadata posture

The application database stores **no IP addresses** in any table. Application-layer rate limits key on the authenticated `user.id`, not IP. Application-layer logs (Edge Functions, Sentry) do not collect IPs — Sentry has `sendDefaultPii: false` and the user identifier sent to Sentry is a salted SHA-256 hash.

IPs **do** appear at platform edges that we do not control directly. They are governed by retention settings on each surface; this is the standard SaaS posture. Surfaces, what we configure, and what to confirm before a partner-quoting conversation are catalogued in [`docs/operations/ip-logging.md`](../operations/ip-logging.md).

For partner-facing copy, the verbatim block to use is:

> SquadRidge does not store IP addresses in the application database. Platform edge logs (Supabase, hosting provider, CDN) may capture IPs for operational reasons; those logs follow the platforms' retention settings and are accessible only to a small named operator group.

Do not say "we hash IPs" or "we anonymise IPs at ingest." The application has no IP to hash. If a partner contract requires a documented hashing pipeline owned by SquadRidge, that is an engineering project, not a doc-only change — see [`docs/operations/ip-logging.md`](../operations/ip-logging.md) § "When you would need to revisit this".

Other metadata partners should know about:

- **Matchmaking metadata** (`public.match_queue`) records `user_id`, a sorted-tags `pool_key`, side, and timestamps while a participant is waiting. Rows are deleted after match or cancel; retention review is tracked as **DM-1** in [`docs/operations/threat-model-release-checklist-issues.md`](../operations/threat-model-release-checklist-issues.md).
- **In-room peer profile projection** is restricted: peers see callsign, role, coarse tags, and region hint via `get_squad_peer_profiles`. There is no global profile directory and no cross-squad search.

---

## 6. Account identity and authentication

- Sign-in is **passwordless** — magic link or OTP via Supabase Auth, or anonymous sign-in for friction-light onboarding. There is **no in-app password field**; account recovery is "request a new link," not password reset.
- **Anonymous Supabase auth still yields a persistent server-side `user_id`.** It is a friction shortcut, not "no account identity on the server." Partners running cohorts that require deniable participation should use anonymous sign-in **and** understand that the persistent `user_id` is operator-visible while the account exists.
- **No social sign-in.** No third-party OAuth providers are wired in production.
- **Magic-link emails** are delivered via Supabase's mailer or a configured SMTP provider; if that mailer logs IPs of click-through events, that surface is documented in [`docs/operations/ip-logging.md`](../operations/ip-logging.md) and turned off in production unless a partner accepts that surface in writing.

---

## 7. Incident response and partner communications

- Roles, severity ladder (`SEV-0` through `SEV-3`), and the first-30-minutes flow are in [`docs/operations/incidents.md`](../operations/incidents.md).
- The named incident lead and partner contact for an active pilot window are in [`docs/operations/pilot-owners.md`](../operations/pilot-owners.md). A pilot must not start until that file has real names, emails, phone or chat handles, and backup contacts for every required role.
- For `SEV-0` and `SEV-1` events the partner contact is notified during the first 30 minutes; the standard cadence after that is documented in the runbook.
- Partner-facing communications are factual and avoid stronger privacy claims than this pack supports — see [`docs/operations/incidents.md`](../operations/incidents.md) § "Communication Rules".
- Crisis-alert flow (participant-raised, out-of-band, three reason codes) is described in [`docs/operations/pilot-runbook.md`](../operations/pilot-runbook.md) § "Crisis alert flow". SquadRidge **does not dispatch emergency services**; this must appear in any partner onboarding that mentions safety. The Crisis Resources panel in-room is a participant-side fallback.

---

## 8. Limits we will not claim (for partner copy parity)

The following claims are out of bounds for any partner-facing material until separately demonstrated and documented in [`CURRENT_STATUS.md`](../../CURRENT_STATUS.md):

- "full anonymity"
- "operator-proof encryption"
- "Signal-grade" or server-blind messaging
- "proven peace impact at scale"
- "global early-warning infrastructure"
- automated CSI ingestion at scale, public CSI maps or feeds, or quantitative "lives saved" claims

If a partner draft contains any of these, it must be revised before signature. The vocabulary check in [`scripts/check-banned-public-copy.mjs`](../../scripts/check-banned-public-copy.mjs) is the canonical guard for marketing surfaces; this section is the partner-facing equivalent.

---

## 9. Partner sign-off

The partner contact named in [`docs/operations/pilot-owners.md`](../operations/pilot-owners.md) (role: **partner owner**) confirms the following before the pilot's first session:

```
Pilot: <YYYY-MM-DD> — <partner / cohort name>
Partner organisation: <name>
Partner contact: <name>, <role / title>
Date: <YYYY-MM-DD>

I confirm on behalf of <organisation> that I have read this disclosure pack
and that the points below are understood by the people at <organisation>
who will sponsor or run the pilot:

  [ ] §3 Encryption posture — squad message contents are not Signal-style
      end-to-end encrypted against the platform operator. Authorised staff
      can decrypt under audited justification.
  [ ] §4 Moderator visibility — moderator decrypt is audited but is not
      server-blind. No raw transcript export exists.
  [ ] §5 IP and metadata posture — application DB stores no IPs; platform
      edge logs may capture IPs and are governed by platform retention.
  [ ] §6 Account identity — anonymous sign-in still yields a persistent,
      operator-visible server-side user_id while the account exists.
  [ ] §7 Incident response — the partner contact in pilot-owners.md is
      reachable during the agreed on-call window for SEV-0 / SEV-1 events.
  [ ] §8 Limits we will not claim — partner-facing materials produced by
      <organisation> will not contain the out-of-bounds claims listed.

Agreed abort criteria for this pilot (mirroring pilot-runbook.md and any
quantitative thresholds set in pilot-preregistration-template.md):
  - <partner adds any partner-side abort criteria>

Signature: ______________________  Date: ______________
```

File the countersigned copy with the pilot evidence pack ([`docs/operations/evidence-collection.md`](../operations/evidence-collection.md)). Do not start the pilot's first session before this is on file.

---

## See also

- [`docs/security/threat-model.md`](../security/threat-model.md) — engineering source of truth.
- [`docs/security/encryption-scope.md`](../security/encryption-scope.md) — what is and is not protected by the message-layer encryption.
- [ADR 004](../adr/004-defer-operator-blind-e2e.md) — explicit deferral of operator-blind E2E and the triggers that re-open it.
- [`docs/operations/incidents.md`](../operations/incidents.md) — severity ladder, audited moderator-decrypt path, service-role break-glass.
- [`docs/operations/ip-logging.md`](../operations/ip-logging.md) — IP surfaces and per-platform configuration.
- [`docs/operations/pilot-owners.md`](../operations/pilot-owners.md) — named contacts for the active pilot window.
- [`docs/operations/pilot-runbook.md`](../operations/pilot-runbook.md) — pre-pilot, in-pilot, abort, and closeout flow.
- [`docs/operations/pilot-preregistration-template.md`](../operations/pilot-preregistration-template.md) — per-pilot success thresholds and abort criteria.
- [`participant-consent-language.md`](./participant-consent-language.md) — paired participant-facing copy spec.
