# Operational threat model (engineering)

This document is the **engineering source of truth** for high-stakes deployment decisions. It describes trust boundaries, realistic adversaries, and **what the codebase actually does today** versus **target architecture**. Product copy and investor-facing docs must not claim stronger properties than are listed here without an explicit engineering review.

**Related:** [Data retention (ZK)](../technical/data-retention-zk.md) · [ZK implementation](../technical/zk-implementation.md) · [Security and privacy (overview)](../technical/security-privacy.md) · **§13** (after §7): Semaphore issuer groups, trusted root posture, E2E definition vs MVP

**MVP / marketing:** Public copy, landing pages, and pitch decks must not promise stronger privacy or anonymity than §5 (“Claims that hold today”) and §3 (honest-but-curious operator). If the product roadmap outpaces this document, update the threat model in the same change as the code.

---

## 1. Scope and stakes

**Goal:** Reduce risk that users in **authoritarian contexts or active conflict** are **re-identified** (linked to real identity, location, or stable real-world persona) through bugs, misuse, platform access, or metadata.

**In scope:** App behavior, Supabase schema/RLS, Edge Functions, client env flags, and operational practices (logging, exports, dashboard access).

**Out of scope unless explicitly designed in:** Tor-only access, regional hosting strategy, legal response playbooks, on-device forensic resistance.

---

## 2. Assets

### 2.1 Identity, account, and profile surfaces

| Asset | Location / mechanism | Notes |
| ----- | ---------------------- | ----- |
| Account identity | `auth.users`, `public.users.id` | Root identifier for correlation across tables and vendor logs. |
| Email / phone | Supabase Auth (magic link / OTP) | Strong real-world identifier when used. |
| Profile & routing fields | `public.profiles` | Pseudonymous; **re-identification risk** when combined (callsign uniqueness, `region_hint`, language, tags). **In-squad:** peers see a **limited projection** (callsign, role, coarse tags, region hint) via `get_squad_peer_profiles` — **no global profile directory** or cross-squad search. |

### 2.2 Messaging, matchmaking, ZK, and social graph

| Asset | Location / mechanism | Notes |
| ----- | ---------------------- | ----- |
| Matchmaking metadata | `public.match_queue` | `user_id`, `pool_key` (intent tags ± optional `|zk:` verified scope), `side`, timestamps; Realtime exposure — see migrations. |
| Social graph | `squad_members`, `squads`, `messages` | Who met whom; message timing and volume. Pseudonymous **handles in-room** are visible to squad-mates only (see §2.1). |
| Message content | `messages.payload_ciphertext` | **Not E2E-encrypted in the cryptographic sense today** — see §5. Authoritative policy redaction for outbound chat runs in the **`ingest-message`** Edge handler (`edgeHandler.ts`): decrypt squad key → **`redactOutgoingLiveMessage`** (same shared pipeline as client-side preview in `liveMessageRedaction.ts`) → re-encrypt → INSERT — redaction occurs **before** the row is stored. |
| ZK verification records | `zk_proof_submissions`, `verified_attributes` | Proof commitments and nullifiers **bound to `user_id`** server-side — see §5. |

---

## 3. Adversary tiers

Audits and residual-risk sign-off should state which tiers are assumed.

1. **Other participants** — same squad or queue: content, timing, writing style.
2. **Network observer** — ISP, local network: TLS protects content in transit; metadata (timing, volume, SNI/host) may still leak usage patterns depending on hosting and client behavior.
3. **Honest-but-curious operator** — your team, read-only dashboard, backups: can **join tables** in Postgres; RLS limits **client-to-client** abuse, not **operator** visibility.
4. **Compromised operator / breach / compelled access** — same as (3) but adversarial; includes mis-exports and long-lived backups.
5. **Platform vendor (Supabase) / subprocessors** — contractual and technical logging (e.g. auth events, IP at edge); must be documented for residual risk.

---

## 4. Trust boundaries

```mermaid
flowchart LR
  subgraph client [Browser]
    A[Semaphore / client logic]
    B[Session token]
    M[Message AES-GCM client]
  end
  subgraph edge [Edge Functions]
    C[verify-zk-proof]
    I[ingest-message]
  end
  subgraph db [Supabase Postgres]
    D[RLS for anon JWT]
    E[Tables + service role writes]
  end
  A -->|HTTPS| C
  A -->|HTTPS API| D
  M -->|ciphertext + JWT| I
  C -->|service role| E
  I -->|decrypt redact re-encrypt INSERT| E
```

- **RLS:** Constrains what **other users** can read/write via the Data API; **does not** make data unreadable to privileged DB/service-role access.
- **Edge `verify-zk-proof`:** Verifies proofs and inserts rows; holds **service role** — treat as part of TCB (trusted computing base).
- **Edge `ingest-message`:** Sole write path for live squad chat. Decrypts with the squad key, runs `redactOutgoingLiveMessage`, re-encrypts, and INSERTs with the service role. Direct authenticated INSERTs into `messages` are denied (`WITH CHECK (false)`). Part of the TCB.

### 4.1 Operator visibility (matches ModDashboard callout)

Squad message keys are **stored for this product**; moderators (and anyone with service-role or raw DB access) can read ciphertext and decrypt for review. This is **not** Signal-style operator-blind E2E.

Legitimate moderator review must call `moderator_record_decrypt_audit` with a written justification (≥ 8 characters) **before** client-side decrypt. Each successful path logs `message_plaintext_decrypt_review` in `moderation_audit_log`. The Mod dashboard surfaces this in amber copy (`src/pages/ModDashboardPage.tsx`) so operators cannot mistake audited review for operator-proof encryption.

---

## 5. Claims that hold today (verified against code)

These are **safe to treat as engineering facts** until code changes:

- **Semaphore proofs are verified server-side** for non-stub builds: shared handler in `supabase/functions/_shared/handleZkProofVerification.ts` calls `verifyProof` and binds `attribute_scope` / `credential_type` to proof fields before persistence.
- **ZK submissions are tied to the logged-in user:** `zk_proof_submissions` inserts include `user_id`. The platform **learns** “this account produced this proof / nullifier / scope,” even though raw PII from the proof ceremony is not stored as plaintext ID documents.
- **Stub mode is unsafe for real users:** `VITE_ZK_STUB=true` in `src/lib/zkAdapter.ts` skips real Semaphore and Edge verification. **Production builds refuse this** — see `vite.config.ts`.
- **Messages use AES-256-GCM at the application layer (payload v3), not end-to-end encryption against the platform.** `src/lib/messageCrypto.ts` encrypts each message body with a random 12-byte IV; ciphertext lives in `messages.payload_ciphertext` as JSON (`v`, `alg`, `iv`, `ct`). The column name reflects **ciphertext**, not a claim of operator-proof E2E. The **symmetric squad key** is stored in `squads.message_encryption_key` (32 bytes, base64 or base64url). Any member who can `SELECT` the squad row can decrypt all messages for that squad; **moderators** with `Squads_select_moderator` / `Messages_select_moderator` and anyone with **service role** or raw DB access can also read keys and ciphertext. **There is no forward secrecy:** if the squad key is compromised, historical messages decrypt. **There is no key rotation** in the product today. **New squads get a server-generated key** if the client omits it: migration `20260417150000_squads_message_encryption_key_server_default.sql` installs a `BEFORE INSERT` trigger using `pgcrypto` so matchmaking-created squads (and any insert path) are not dependent on “first client message” for key material. `ensureSquadMessageKey` in `src/lib/squadMessageKey.ts` remains a client-side fallback for empty keys. **True E2E** (unreadable by Supabase/operators) would require per-user key distribution (e.g. Signal-style / MLS) and is **not** implemented.
- **Direct client INSERT into `messages` is blocked by RLS.** Migration `20260428194500_messages_insert_edge_only.sql` replaces the permissive member INSERT policy with `WITH CHECK (false)`, so all chat persistence must go through the `ingest-message` Edge Function (decrypt squad key → server-side `redactOutgoingLiveMessage` → re-encrypt → service-role insert). pgTAP test `supabase/tests/database/messages_insert_edge_only.test.sql` enforces both the structural policy and a runtime denial as the `authenticated` role. This guarantees outbound redaction is **non-bypassable** by a custom client.
- **Moderator decrypt is audited.** Migration `20260428120000_moderator_decrypt_audit_rpc.sql` adds an RPC that an authorized moderator must call to obtain message plaintext for review; the RPC writes a `message_plaintext_decrypt_review` row to `moderation_audit_log` (with required justification ≥ 8 characters) **before** returning plaintext. This does **not** make content operator-blind — a privileged DB user can still read ciphertext + key — but it produces a tamper-resistant audit trail for legitimate moderator review and a strong signal in any breach review.
- **Squad encryption snapshot archive.** Migration `20260428123000_archive_squad_encryption_snapshot.sql` preserves the squad message key + epoch metadata when a squad is archived, so historical decrypt-for-review continues to work after a squad ends without keeping the live key indefinitely. The migration is independent of (and a prerequisite for) any future per-squad key rotation work.
- **Anonymous Supabase auth** still yields a **persistent user id** (`src/lib/squad.ts`); it is a friction shortcut, not “no account identity on the server.”
- **Email sign-in is passwordless (magic link / OTP) only** in the web app (`signInWithOtp` in `AuthContext`). There is no in-app password field; recovery is “request a new link,” not password reset.
- **Matchmaking `pool_key`** encodes sorted intent tags (truncated), stored next to `user_id` — see `src/lib/matchmakingPoolKey.ts` and `supabase/migrations/*matchmaking_queue.sql`.
- **Matchmaking operations:** periodic sweep and queue metrics are documented in [`docs/technical/matchmaking-automation.md`](../technical/matchmaking-automation.md) (cron, `matchmaking_sweep_runs`, service-role-only stats RPC).

---

## 6. Pre-deployment gate (checklist)

Use this as a **release gate** for any build aimed at high-risk users. Track completion in issues or a release ticket.

### Architecture and honesty

- [ ] User-facing and investor-facing materials reviewed against §5; no overstated anonymity claims.
- [ ] “Non-goals” documented (what the product does **not** protect against).

### Cryptography and ZK

- [ ] Production build never ships with `VITE_ZK_STUB=true` (CI + `vite` guard).
- [ ] External or internal security review of Semaphore parameters, group setup (`src/lib/zk/`), and scope/message binding in the Edge handler.

### Data minimization

- [ ] Column-level review of `profiles` and `match_queue` for re-identification; retention and TTL for queue rows after match/cancel.
- [ ] Waitlist / marketing DB exports governed — see `scripts/waitlist-export.sql`; restrict who can run exports.

### Messaging

- [ ] Either **real E2E** shipped and documented, or public positioning states **operator-readable** content until then.

### Supabase and operations

- [ ] RLS policies reviewed on all exposed tables; **views** use `security_invoker` where applicable (Postgres 15+).
- [ ] No authorization decisions based on **user-editable** `user_metadata` in JWT (use `app_metadata` / server-side roles for authz).
- [ ] Service role and dashboard access: MFA, minimal headcount, break-glass procedure.
- [ ] Logging: Edge Functions avoid logging full proof bodies; structured outcome-only logs in production.

### Incident readiness

- [ ] Severity-0 definition for suspected mass correlation or export; runbook includes key rotation and comms.

**Tracking:** Operational artifacts for pilot gate: [`break-glass-moderator-decrypt-runbook.md`](../operations/break-glass-moderator-decrypt-runbook.md), [`zk-self-assessment.md`](zk-self-assessment.md), [`public-claims-audit.md`](public-claims-audit.md), pgTAP `v2_sessions_rls.test.sql`. File GitHub issues from [`threat-model-release-checklist-issues.md`](../operations/threat-model-release-checklist-issues.md) for remaining items.

---

## 7. Revision history

| Date | Change |
| ---- | ------ |
| 2026-04-16 | Initial operational threat model aligned with current repo. |
| 2026-04-16 | §5: Documented AES-GCM v3, squad key storage, moderator/service-role access, lack of forward secrecy/E2E, and server default key trigger (`20260417150000_*`). |
| 2026-04-16 | §2: In-squad pseudonymous profile visibility via `get_squad_peer_profiles`; matchmaking `pool_key` may include `|zk:` verified scope. |
| 2026-04-22 | §2 split into §2.1 / §2.2; new §13 (Semaphore issuer groups, trusted root posture, E2E definition vs MVP). |
| 2026-04-28 | §5: Edge-only `messages` inserts (`20260428194500`), audited moderator decrypt RPC (`20260428120000`), squad encryption snapshot archive (`20260428123000`). §13.1: `VITE_SEMAPHORE_DEMO_GROUP` flag for bundled demo decoys. |
| 2026-04-28 | Audit remediation Phase 0–2: `create_demo_squad` RPC (atomic, `20260428220000`); demo squad keys rotated and client-side key generation removed (`20260428210000`); demo claim consent token (`20260428230000`); issuer-managed anonymity group implemented (`20260428240000`, RFC §13.1); structured Edge logger (`supabase/functions/_shared/log.ts`); `VITE_SEMAPHORE_DEMO_GROUP` requires `VITE_ALLOW_DEMO_DECOYS_IN_PROD` for production builds. |
| 2026-04-30 | §13.1: Client proof path now passes `issuer_group_id` to the Edge verifier when `VITE_ISSUER_GROUP_ID` / `VITE_ISSUER_MANIFEST_URL` / `VITE_ISSUER_SIGNING_KEY_BASE64URL` are configured (`src/lib/zk/issuerRegistry.ts`); RFC `rfc-issuer-managed-anonymity-group.md` status moved from Draft to Implemented v1. Manifest refresh cron remains deferred (RFC §4.3). New ledger publish workflow: squad-member draft inserts, member voting on `ledger_proposal_votes` with RLS-scoped insert, and a moderator-gated `publish-ledger-proposal` Edge Function that enforces a 2/3 participation + majority-approve threshold before flipping `status='published'`. |
| 2026-07-17 | §4 trust boundaries: add `ingest-message` to the Edge TCB diagram. New §4.1 operator-visibility note aligned with ModDashboard amber callout (keys stored; audited `message_plaintext_decrypt_review`). |

---

## 13. Semaphore groups, trusted issuance, and end-to-end messaging (roadmap vs today)

*Placed after the revision log so core sections 1–7 stay consecutive for readers; cross-reference in diligence materials may cite “§13” directly.*

This section ties **who can mint Semaphore “membership”** and **messaging key hierarchy** to what partners should assume in **diligence** and **GTM** copy. It is **not** a promise of future ship dates; it is a **trust-root map**.

### 13.1 Issuer groups (Semaphore Merkle set)

- **Production model (mandatory for pilots):** Issuer-managed anonymity groups are now implemented end-to-end (see `[docs/technical/rfc-issuer-managed-anonymity-group.md](../technical/rfc-issuer-managed-anonymity-group.md)`). The client (`src/lib/zk/buildAnonymityGroup.ts`) builds a Semaphore `Group` from the issuer's signed Merkle root manifest (`src/lib/zk/issuerManifest.ts`); the Edge verifier (`supabase/functions/_shared/handleZkProofVerification.ts`) cross-checks `proof.merkleTreeRoot` against `public.issuer_groups.current_root` and rejects proofs that do not match (`STALE_PROOF_ROOT`). Both sides verify the manifest signature with the same canonical bytes (`canonicalManifestBytes`), so a tampered or stale manifest fails closed.
- **Demo / staging fallback:** The bundled in-source decoys path (`squadridge-decoy-{a,b,c}`) collapses the anonymity set and is gated behind **two** flags: `VITE_SEMAPHORE_DEMO_GROUP=true` *and* `VITE_ALLOW_DEMO_DECOYS_IN_PROD=true` (off by default; CI prod release jobs reject the latter via `scripts/ensure-no-demo-decoys-prod.mjs` and `vite.config.ts`). Use only for controlled internal demos where every participant understands the anonymity collapse.
- **Operational note:** The `issuer_groups` table caches `current_root` + `current_root_expires_at`. v1 fails closed on cache expiry (`STALE_PROOF_ROOT`); a follow-up Edge cron will refresh the manifest proactively (RFC §4.3, §6.2). Until then, operators must rotate the row by re-fetching the issuer manifest before `current_root_expires_at`.
- **Trusted “root” registry:** There is **no** separate, documented **on-chain or org-wide “trusted root registry”** component in the MVP app beyond **Semaphore group parameters and circuit identity** as wired in code. If a partner requires a **named trust anchor** (e.g. a government list root, a humanitarian issuer DID, a smart-contract group factory), that must be **designed, deployed, and named in docs** in the same change as the code path—not implied by “ZK in the product.”

### 13.2 End-to-end messaging (definition used here)

- **E2E (target definition):** Message plaintext is readable only to **end clients** in the session; the **server never holds** material sufficient to bulk-decrypt without **active participation** of clients (e.g. Signal-style or MLS, with a clear story for key distribution and recovery).
- **Not E2E today:** As in §5, **squad symmetric keys in Postgres** mean the operator path can read content; do not describe MVP chat as E2E in **user copy**, **pitch**, or **policy decks** without an engineering review and an updated §5.
- **Decision posture:** [ADR 004](../adr/004-defer-operator-blind-e2e.md) records the explicit deferral and the triggers (partner contract, threat-model change, external review finding, sustained engineering capacity, or standards maturity) that would re-open the build decision.
- **Roadmap link:** The **pre-deployment gate** in §6 stands: either **ship and document** real E2E, or keep **operator-readable** as the public stance until then.

**Cross-refs:** [ZK implementation](../technical/zk-implementation.md) (Semaphore + Edge) · [Encryption scope](encryption-scope.md) · [ADR 004 (defer operator-blind E2E)](../adr/004-defer-operator-blind-e2e.md) · §5 in this file.
