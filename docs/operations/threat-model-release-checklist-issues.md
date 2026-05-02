# Threat model §6 — tracking as GitHub issues

The [operational threat model](../security/threat-model.md) §6 lists release gates as checkboxes. **Do not tick boxes in the document until the work is done.** Instead, file the issues below, link the resulting issue URLs into the **Tracking** subsection of threat model §6, and link PRs into each issue when work is complete.

## How to use this file

1. Pick an issue stub below (`ZK-1` through `INC-1`).
2. Create a GitHub issue with the title, labels, and body verbatim. The bodies are written to be copy-pasteable into `gh issue create --title '<title>' --body-file <stub.md>` or directly into the GitHub UI.
3. Replace the placeholder row in [`docs/security/threat-model.md`](../security/threat-model.md) §6 § "Tracking" with the issue URL.
4. When closing the issue, leave a comment with the PR(s) that resolved it and the date a checkbox in §6 was ticked (or, if the work mooted the gate, why).

Stub IDs are stable identifiers for cross-references; they are **not** GitHub issue numbers. Keep them in commit messages and PR titles for traceability (`fix(zk-1): wire external review hand-off`).

---

## ZK-1 — External or internal security review of Semaphore parameters and verify-zk-proof Edge handler

**Title:** `[ZK-1] External or internal security review: Semaphore parameters + verify-zk-proof Edge handler`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `zk`

**Body:**

> ### Background
>
> Threat model §6 (Cryptography and ZK) requires "External or internal security review of Semaphore parameters, group setup (`src/lib/zk/`), and scope/message binding in the Edge handler" before any deployment aimed at high-risk users. This is currently the highest-priority open gate per the pilot readiness assessment.
>
> ### Scope
>
> A scoped security review covering, at minimum:
>
> - Semaphore identity / proof generation in [`src/lib/zk/`](../../src/lib/zk/) — circuit identity, parameter selection, group construction (`buildAnonymityGroup.ts`).
> - Issuer-managed anonymity group integration ([`docs/technical/rfc-issuer-managed-anonymity-group.md`](../technical/rfc-issuer-managed-anonymity-group.md)) — manifest signature verification (`issuerManifest.ts`), `current_root_expires_at` posture, fail-closed behaviour on stale roots.
> - Server-side verification in [`supabase/functions/verify-zk-proof/index.ts`](../../supabase/functions/verify-zk-proof/index.ts) and the shared handler [`supabase/functions/_shared/handleZkProofVerification.ts`](../../supabase/functions/_shared/handleZkProofVerification.ts) — proof binding to `attribute_scope` / `credential_type`, replay / nullifier handling, error paths and rate limiting.
> - Demo / staging gating of bundled in-source decoys (`squadridge-decoy-*`, `VITE_SEMAPHORE_DEMO_GROUP`, `VITE_ALLOW_DEMO_DECOYS_IN_PROD`) and the CI guards in [`scripts/ensure-no-demo-decoys-prod.mjs`](../../scripts/ensure-no-demo-decoys-prod.mjs) and [`scripts/ensure-no-zk-stub-prod.mjs`](../../scripts/ensure-no-zk-stub-prod.mjs).
> - Edge logging review against the threat model §6 logging requirement (no full proof bodies in production logs).
>
> Out of scope for this issue: per-user E2E messaging hierarchy ([ADR 004](../adr/004-defer-operator-blind-e2e.md)), Postgres RLS audit (tracked as **OPS-1**), service-role posture (tracked as **OPS-3**).
>
> ### Acceptance criteria
>
> - [ ] Reviewer agreed and statement of work signed (internal or external; named in the issue).
> - [ ] Review report delivered, filed under the diligence room and linked from this issue.
> - [ ] Each finding triaged as: blocking (must-fix before pilot), non-blocking (tracked follow-up issue), or accepted residual (documented in the threat model revision history).
> - [ ] Threat model §5 / §13 updated if the review uncovers a claim that no longer holds.
> - [ ] §6 checkbox "External or internal security review of Semaphore parameters…" ticked, with the date and reviewer captured in the §7 revision history.
>
> ### References
>
> - [`docs/security/threat-model.md`](../security/threat-model.md) §6 (Cryptography and ZK), §13.1 (issuer groups)
> - [`docs/technical/zk-implementation.md`](../technical/zk-implementation.md)
> - [ADR 001](../adr/001-use-semaphore-zk.md), [ADR 004](../adr/004-defer-operator-blind-e2e.md)
> - [`docs/partners/pilot-disclosure-pack.md`](../partners/pilot-disclosure-pack.md) §2 (this issue is named there as a precondition for partners with regulatory crypto-review requirements)
>
> ### Definition of done
>
> Review report on file, all findings disposed of, threat model updated, §6 checkbox ticked.

---

## ZK-2 — Continuous CI guard that production never ships VITE_ZK_STUB=true

**Title:** `[ZK-2] Continuous CI guard: production never ships VITE_ZK_STUB=true`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `ci`, `zk`

**Body:**

> ### Background
>
> Threat model §6 requires that production builds never ship with `VITE_ZK_STUB=true`, which would skip Semaphore + Edge verification and is a hard "no live users" condition. The guard exists today via [`scripts/ensure-no-zk-stub-prod.mjs`](../../scripts/ensure-no-zk-stub-prod.mjs), invoked by [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) and [`.github/workflows/deploy-frontend.yml`](../../.github/workflows/deploy-frontend.yml). This issue tracks the **continuous** guarantee — i.e. that the guard is not silently regressed, removed, or bypassed in a future PR — and adds a release-tag verification cadence.
>
> ### Scope
>
> - Add a release-tag check that, on each tag push to `main`, asserts `VITE_ZK_STUB` was not set during the build (e.g. by re-running `check:no-zk-stub-prod` against the build environment and recording the result alongside the release artifact).
> - Add a quarterly verification step (manual issue or scheduled workflow) that re-runs the guard against the current `main` and the most recent production deploy.
> - Document in [`docs/security/threat-model.md`](../security/threat-model.md) revision history every time the guard is touched.
>
> ### Acceptance criteria
>
> - [ ] Release-tag verification implemented and producing an artifact log per release.
> - [ ] Quarterly verification cadence captured (recurring issue template or scheduled workflow).
> - [ ] Threat model §6 revision history note added the next time the guard is touched.
>
> ### References
>
> - [`scripts/ensure-no-zk-stub-prod.mjs`](../../scripts/ensure-no-zk-stub-prod.mjs)
> - [`vite.config.ts`](../../vite.config.ts) (build-time refusal)
> - [`docs/operations/pilot-runbook.md`](../operations/pilot-runbook.md) § "Bundle integrity"
>
> ### Definition of done
>
> Release-tag verification visible on the most recent release; quarterly cadence on the calendar; §6 checkbox stays ticked with a verifiable mechanism behind it.

---

## DM-1 — Column-level review of profiles and match_queue; document TTL for queue rows

**Title:** `[DM-1] Column-level re-identification review: profiles + match_queue, with TTL documentation`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `data-minimization`

**Body:**

> ### Background
>
> Threat model §2.1 / §2.2 flag `public.profiles` and `public.match_queue` as the surfaces with the highest re-identification risk when columns are joined. §6 (Data minimization) requires a column-level review and TTL documentation for queue rows after match or cancel.
>
> ### Scope
>
> - Walk every column on `public.profiles` and `public.match_queue` and document, per column: source of value, who can read it (RLS), who can write it, retention horizon, and re-identification risk when joined with other columns.
> - For `match_queue`: confirm the actual TTL after match-or-cancel against the matchmaking automation flow ([`docs/technical/matchmaking-automation.md`](../technical/matchmaking-automation.md)). If the TTL is shorter or longer than the threat model implies, update the threat model.
> - For `profiles`: confirm `get_squad_peer_profiles` is the only path peers see profile fields and that no other RPC or view leaks more.
> - Capture findings in a short subsection in [`docs/security/threat-model.md`](../security/threat-model.md) §2 (or a sibling doc linked from there).
>
> ### Acceptance criteria
>
> - [ ] Column-by-column table for `public.profiles` published.
> - [ ] Column-by-column table for `public.match_queue` published.
> - [ ] TTL for queue rows after match / cancel documented with the migration that enforces it.
> - [ ] Any column flagged as high re-identification risk has a follow-up: drop, hash, or accept-with-justification.
> - [ ] §6 checkbox "Column-level review of `profiles` and `match_queue`…" ticked.
>
> ### References
>
> - [`docs/security/threat-model.md`](../security/threat-model.md) §2.1, §2.2, §6
> - [`docs/technical/matchmaking-automation.md`](../technical/matchmaking-automation.md)
> - [`docs/security/data-retention-zk.md`](../security/data-retention-zk.md) (retention posture for ZK-adjacent tables; useful prior-art format)
>
> ### Definition of done
>
> Both column tables published, TTL documented, follow-ups filed for any flagged columns, §6 checkbox ticked.

---

## DM-2 — Operationalize waitlist-export governance

**Title:** `[DM-2] Operationalize waitlist-export governance (restricted role, audit log, named approvers)`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `data-minimization`, `ops`

**Body:**

> ### Background
>
> [`scripts/waitlist-export.sql`](../../scripts/waitlist-export.sql) is documented as an operator-only SQL Editor query that returns waitlist emails. Threat model §6 (Data minimization) requires that waitlist / marketing DB exports be **governed** — restrict who can run the export, log every run, and require named approvers.
>
> ### Scope
>
> - Decide on access posture: dedicated DB role with read access to `public.waitlist_signups` only; not service-role-via-Studio for routine exports.
> - Wrap the export in a SQL function or RPC that writes a row to an audit table (`waitlist_export_audit_log`) capturing actor, timestamp, row count returned, and the justification supplied.
> - Named approver list (≥ 2 people) committed to [`docs/operations/pilot-owners.md`](pilot-owners.md) or a sibling ops file; export attempts by non-approvers are rejected at the SQL layer.
> - Update [`scripts/waitlist-export.sql`](../../scripts/waitlist-export.sql) to call the audited RPC instead of `SELECT email, created_at` directly. Keep the file as the canonical entry point so operators have a single place to look.
> - Document the procedure (who, when, how to request) in a new section of [`docs/operations/data-retention-operators.md`](data-retention-operators.md) or a dedicated operator note.
>
> ### Acceptance criteria
>
> - [ ] Audited RPC implemented in a migration; old direct-select path removed or routed through the RPC.
> - [ ] Audit log table created with RLS preventing tampering; review query documented for incident leads.
> - [ ] Named approvers documented; non-approvers fail at the SQL layer, not just by convention.
> - [ ] Procedure note added to operator docs.
> - [ ] §6 checkbox "Waitlist / marketing DB exports governed…" ticked.
>
> ### References
>
> - [`scripts/waitlist-export.sql`](../../scripts/waitlist-export.sql)
> - [`docs/security/threat-model.md`](../security/threat-model.md) §6
> - Prior-art for audited mediator RPC: [`supabase/migrations/20260428120000_moderator_decrypt_audit_rpc.sql`](../../supabase/migrations/20260428120000_moderator_decrypt_audit_rpc.sql)
>
> ### Definition of done
>
> Export goes through an audited RPC, every run leaves an audit row, named approvers documented, §6 checkbox ticked.

---

## MSG-1 — Maintain operator-readable disclosure across all surfaces; track ADR 004 reopening triggers

**Title:** `[MSG-1] Maintain operator-readable disclosure across all surfaces (ADR 004 trigger watch)`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `messaging`, `docs`

**Body:**

> ### Background
>
> Threat model §6 (Messaging) requires that until real per-user E2E ships, **public positioning consistently describes message contents as operator-readable**. The deferral and the triggers that would re-open the build decision are recorded in [ADR 004](../adr/004-defer-operator-blind-e2e.md). The marketing-surface guard at [`scripts/check-banned-public-copy.mjs`](../../scripts/check-banned-public-copy.mjs) catches obvious overclaims in `index.html` and `public/`; this issue tracks the ongoing operational discipline that keeps that posture intact across all surfaces.
>
> ### Scope
>
> - Confirm partner-facing copy reflects operator-readable posture: [`docs/partners/pilot-disclosure-pack.md`](../partners/pilot-disclosure-pack.md) §3 and [`docs/partners/participant-consent-language.md`](../partners/participant-consent-language.md) Block 2 / Block 6 are the canonical references.
> - Confirm in-app copy reflects operator-readable posture: [`src/onboarding/app/components/onboarding/copy.ts`](../../src/onboarding/app/components/onboarding/copy.ts) `messagingPrivacyExplainer` and [`src/pages/SecurityDisclosurePage.tsx`](../../src/pages/SecurityDisclosurePage.tsx) "Operator visibility" section.
> - Watch for ADR 004 re-evaluation triggers (partner contract, threat-model change, independent review finding, sustained engineering capacity, standards maturity). When a trigger fires, file a follow-up issue and revisit [`docs/technical/rfc-e2e-messaging-key-hierarchy.md`](../technical/rfc-e2e-messaging-key-hierarchy.md).
>
> ### Acceptance criteria
>
> - [ ] All listed copy surfaces audited; any drift filed as a doc-fix PR.
> - [ ] Recurring quarterly audit captured (issue template or calendar reminder).
> - [ ] Trigger-watch process documented in ADR 004 (or a sibling note) so the next person knows what to do when a partner asks for E2E.
> - [ ] §6 checkbox "Either real E2E shipped and documented, or public positioning states operator-readable…" remains ticked because the second clause is observably true.
>
> ### References
>
> - [ADR 004](../adr/004-defer-operator-blind-e2e.md)
> - [`scripts/check-banned-public-copy.mjs`](../../scripts/check-banned-public-copy.mjs)
> - [`docs/security/threat-model.md`](../security/threat-model.md) §5 (claims that hold today)
>
> ### Definition of done
>
> Audit of all surfaces complete; recurring cadence on the calendar; trigger-watch process documented.

---

## OPS-1 — RLS audit pass on all exposed tables; views use security_invoker (Postgres 15+)

**Title:** `[OPS-1] RLS audit on all exposed tables; views use security_invoker (Postgres 15+)`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `ops`, `database`

**Body:**

> ### Background
>
> Threat model §6 (Supabase and operations) requires a review pass on RLS policies for all exposed tables, with views using `security_invoker` where applicable (Postgres 15+). RLS limits client-to-client abuse; it does not protect against operator-level access.
>
> ### Scope
>
> - Enumerate every table in `public` exposed via the Data API and confirm RLS is enabled with policies that match the threat model's expectations.
> - For every view in `public`, confirm `security_invoker = true` (default in PG 15+ for new views, but old views may not have it) so the view executes with the calling user's permissions, not the view owner's.
> - For each table, document the expected reader / writer / no-one access in a small reference table, ideally added to [`docs/technical/security-privacy.md`](../technical/security-privacy.md) or a sibling doc.
> - Spot-check from `anon` and `authenticated` clients (not service-role) using a smoke script — surfaces should refuse the writes / reads the policies say they refuse.
>
> ### Acceptance criteria
>
> - [ ] Per-table RLS audit table published.
> - [ ] All `public` views confirmed `security_invoker = true` (or explicitly justified if not).
> - [ ] Smoke script committed under `scripts/` and runnable against the local Supabase stack.
> - [ ] Any drift filed as follow-up migrations.
> - [ ] §6 checkbox "RLS policies reviewed…" ticked.
>
> ### References
>
> - [`docs/security/threat-model.md`](../security/threat-model.md) §4 (trust boundaries), §6
> - Existing RLS-related migrations under [`supabase/migrations/`](../../supabase/migrations/)
> - [`scripts/check-prod-readiness.mjs`](../../scripts/check-prod-readiness.mjs) for the existing static-check style
>
> ### Definition of done
>
> Audit table published, views confirmed, smoke script in repo, §6 checkbox ticked.

---

## OPS-2 — Authorization decisions never read user-editable user_metadata

**Title:** `[OPS-2] Authorization decisions never read user-editable user_metadata`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `ops`, `auth`

**Body:**

> ### Background
>
> Threat model §6 requires that no authorization decision reads `user_metadata` from the JWT, since `user_metadata` is editable by the user. Authorization decisions must use server-side roles (e.g. rows in `public.moderators`), `app_metadata`, or service-role-only paths.
>
> ### Scope
>
> - Audit `src/`, `supabase/functions/`, and `supabase/migrations/` for any read of `user_metadata` that influences an access-control decision (RLS policies, RPC bodies, Edge Function gates, route guards).
> - Convert any offenders to read from `app_metadata` or a server-side role table.
> - Add a grep-based check (modelled on [`scripts/check-no-raw-console.mjs`](../../scripts/check-no-raw-console.mjs)) that fails CI when `user_metadata` is referenced in an authorization-relevant file.
> - Document the rule in [`docs/technical/security-privacy.md`](../technical/security-privacy.md) so future contributors see it.
>
> ### Acceptance criteria
>
> - [ ] Audit complete; no authorization path reads `user_metadata`.
> - [ ] CI check added and wired into [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
> - [ ] Rule documented in security-privacy doc.
> - [ ] §6 checkbox "No authorization decisions based on user-editable `user_metadata`…" ticked.
>
> ### References
>
> - [`docs/security/threat-model.md`](../security/threat-model.md) §6
> - Supabase guidance on `app_metadata` vs `user_metadata`
>
> ### Definition of done
>
> Code clean, CI guard in place, doc updated, §6 checkbox ticked.

---

## OPS-3 — Service role and dashboard access: MFA, minimal headcount, break-glass procedure

**Title:** `[OPS-3] Service role and dashboard access posture: MFA, minimal headcount, break-glass procedure`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `ops`

**Body:**

> ### Background
>
> Threat model §6 requires that service-role and Supabase dashboard access is gated by MFA, restricted to a minimal named headcount, and governed by a documented break-glass procedure. The break-glass procedure exists in [`docs/operations/incidents.md`](incidents.md) § "Service-role break-glass"; this issue tracks the **enforcement** posture (MFA, headcount, documented owners).
>
> ### Scope
>
> - Confirm Supabase project requires MFA for all dashboard accounts. Capture the Auth settings screenshot in the diligence room.
> - Enumerate every account with dashboard access and every consumer of the service-role token (Edge Functions, CI, ad-hoc operator use). Trim to minimum.
> - Document the rotation procedure in [`docs/security/secrets-rotation.md`](../security/secrets-rotation.md) (create if missing) — who can rotate, how, on what cadence, and how rotation interacts with the audited mod-decrypt RPC.
> - Confirm the break-glass procedure in [`docs/operations/incidents.md`](incidents.md) § "Service-role break-glass" is current; if it has drifted from practice, update it.
>
> ### Acceptance criteria
>
> - [ ] MFA confirmed on every dashboard account.
> - [ ] Service-role consumer inventory published.
> - [ ] [`docs/security/secrets-rotation.md`](../security/secrets-rotation.md) exists and names a rotation owner.
> - [ ] Break-glass procedure cross-checked against actual practice; updated if drifted.
> - [ ] §6 checkbox "Service role and dashboard access: MFA, minimal headcount, break-glass procedure" ticked.
>
> ### References
>
> - [`docs/operations/incidents.md`](incidents.md) § "Service-role break-glass"
> - [`docs/security/threat-model.md`](../security/threat-model.md) §6
> - [`docs/operations/pilot-runbook.md`](pilot-runbook.md) § "Key custody"
>
> ### Definition of done
>
> Inventory and procedure documented, MFA confirmed, rotation owner named, §6 checkbox ticked.

---

## OPS-4 — Edge logging audit: no full proof bodies / PII in production logs

**Title:** `[OPS-4] Edge logging audit: no full proof bodies / PII in production logs`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `ops`, `observability`

**Body:**

> ### Background
>
> Threat model §6 requires that Edge Functions avoid logging full proof bodies and emit structured outcome-only logs in production. Today, logging discipline is enforced informally via the structured logger at [`supabase/functions/_shared/log.ts`](../../supabase/functions/_shared/log.ts) and [`scripts/check-no-raw-console.mjs`](../../scripts/check-no-raw-console.mjs). This issue tracks the audit pass that confirms production logs match the policy.
>
> ### Scope
>
> - Sample production Edge Function invocation logs for `verify-zk-proof`, `ingest-message`, `crisis-alert`, `match-notify`, `rate-limit`, `csi-ingest-snapshot`, `csi-partner-export`, `publish-ledger-proposal`. Confirm none contain proof bodies, plaintext message bodies, raw email addresses, or other PII.
> - For any leak, file a follow-up PR that routes through the structured logger with explicit field allowlists.
> - Add (or reuse) a sampling job that periodically pulls a small slice of production logs and checks them against a denylist of patterns. This can be a manual quarterly task; a scheduled workflow is nicer-to-have.
> - Confirm the existing CI guard ([`scripts/check-no-raw-console.mjs`](../../scripts/check-no-raw-console.mjs)) covers all Edge Functions and is invoked by [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
>
> ### Acceptance criteria
>
> - [ ] Sample audit complete; no proof bodies, no plaintext, no PII in sampled logs.
> - [ ] Any leaks fixed via PR routed through the structured logger.
> - [ ] Sampling cadence documented (manual quarterly or scheduled workflow).
> - [ ] §6 checkbox "Logging: Edge Functions avoid logging full proof bodies; structured outcome-only logs in production" ticked.
>
> ### References
>
> - [`supabase/functions/_shared/log.ts`](../../supabase/functions/_shared/log.ts)
> - [`scripts/check-no-raw-console.mjs`](../../scripts/check-no-raw-console.mjs)
> - [`docs/security/observability-and-sentry.md`](../security/observability-and-sentry.md)
>
> ### Definition of done
>
> Sample audit on file, leaks fixed, sampling cadence captured, §6 checkbox ticked.

---

## INC-1 — Severity-0 definition for suspected mass correlation or export

**Title:** `[INC-1] Define SEV-0 for suspected mass correlation or export; runbook includes key rotation and partner comms`

**Labels:** `security`, `release-gate`, `threat-model-§6`, `incident-response`

**Body:**

> ### Background
>
> Threat model §6 requires a `SEV-0` definition for suspected mass correlation or export, with a runbook that explicitly covers key rotation and partner communications. The base severity ladder lives in [`docs/operations/incidents.md`](incidents.md) § "Severity Levels"; this issue tracks the explicit `SEV-0` case for correlation / export.
>
> ### Scope
>
> - Add a named `SEV-0` sub-case "suspected mass correlation or export" to [`docs/operations/incidents.md`](incidents.md) § "Severity Levels", including triggers (e.g. unexpected service-role read volume, anomaly in `pilot_decrypt_audit_24h`, suspicious `waitlist_export_audit_log` activity once **DM-2** lands).
> - Add containment steps tailored to correlation / export: rotate compromised secrets, rotate `squad_key_epochs` for affected squads via `rotate_squad_key`, freeze waitlist exports, freeze service-role-token-bearing automation.
> - Add a partner-comms section: who notifies which partner contact, in what window, with what level of factual detail vs hypothesis (cross-reference [`docs/partners/pilot-disclosure-pack.md`](../partners/pilot-disclosure-pack.md) §7).
> - Add a post-incident review template specific to correlation / export incidents (what evidence to retain, what to share with partners, what to write into the threat model revision history).
>
> ### Acceptance criteria
>
> - [ ] `SEV-0` sub-case added to [`docs/operations/incidents.md`](incidents.md).
> - [ ] Containment steps include explicit key rotation and export-pause actions.
> - [ ] Partner-comms section names roles and timing.
> - [ ] Post-incident review template added.
> - [ ] §6 checkbox "Severity-0 definition for suspected mass correlation or export…" ticked.
>
> ### References
>
> - [`docs/operations/incidents.md`](incidents.md)
> - [`docs/security/threat-model.md`](../security/threat-model.md) §6
> - [`docs/operations/pilot-runbook.md`](pilot-runbook.md) § "Emergency rollback steps"
> - [`docs/security/encryption-scope.md`](../security/encryption-scope.md) (key rotation primitives)
>
> ### Definition of done
>
> Incidents doc updated, partner-comms section in place, §6 checkbox ticked.

---

## After filing

After creating the issues above, replace the placeholder rows in [`docs/security/threat-model.md`](../security/threat-model.md) §6 § "Tracking" with the issue URLs. The placeholder table is intentionally minimal so an operator can fill it in without touching layout.
