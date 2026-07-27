# Diligence Architecture One-Pager

**Audience:** technical investors, security reviewers, partner IT  
**Last updated:** July 2026  
**Honesty:** Rooms are **operator-readable today**. Do not read this as Signal-grade E2E or audit-complete.

Deeper references: [`../security/threat-model.md`](../security/threat-model.md) · Implementation registry: [`../../src/data/implementationStatus.ts`](../../src/data/implementationStatus.ts) · ADRs: [`../adr/005-operator-blind-room-encryption-options.md`](../adr/005-operator-blind-room-encryption-options.md) · [`../adr/006-cloudflare-workers-room-record.md`](../adr/006-cloudflare-workers-room-record.md)

---

## Narrative (v2 spine)

```text
Client (React SPA)
    │  magic-link / invite tokens
    ▼
Edge Functions + Supabase Auth
    │  invite validate, verification upload, session RPCs
    ▼
Postgres + RLS
    │  session_messages (room) · profiles · audit metadata
    │  outcome drafts · hash-bound approvals
    ▼
Facilitator release gate
    │  attestation + approvals → release_outcome
    ▼
SHA-256 ledger / private anchored memo
       (public ledger only if organisation opts in)
```

**Enclosed → Release gate → Published** maps to Configure → Verify → Facilitate → Release.

---

## Layer notes

| Layer | Role today | Diligence note |
| ----- | ---------- | -------------- |
| **Client** | Facilitator `/app/*`, participant `/p/*`, public marketing + `/ledger` | Invite-only; no open self-serve for pilot scopes |
| **Auth / Edge** | Magic link; role-scoped invite tokens; Edge Functions for invites / verification upload / health | Bearer tokens are sensitive; treat as credentials |
| **Postgres + RLS** | Session lifecycle, messages, outcomes, metadata audit trail | RLS is mandatory; service-role / operator paths remain powerful |
| **Release gate** | Facilitator-authored instrument; approvals bound to hash; attestation required | Room dialogue is **not** imported into the public record |
| **Integrity anchor** | LIVE SHA-256 of approved text; `/ledger/:id/verify` recomputation path | Proves **integrity of released file**, not court-admissible time |

---

## Operator-readable today vs planned

| Capability | Status | Source |
| ---------- | ------ | ------ |
| Room message bodies readable by platform operator (with privileged access) | **Today** | Threat model; ADR 004/005 |
| Application-layer protections + TLS + RLS | **Today** | Threat model |
| SHA-256 release anchor | **LIVE** | `implementationStatus.ts` → `sha256_anchor` |
| RFC 3161 TimeStampToken at release | **SCAFFOLDED** | `rfc3161_timestamp` |
| Operator-blind room encryption | **PLANNED** | `operator_blind_e2e`; design options in ADR 005 |
| Full-platform ZK / Signal-grade E2E | **Not claimed** | Soft-retired legacy ZK paths; not the v2 story |

---

## What this architecture is for

- Bounded **private deliberation** (NGO / board / HR memo first)  
- A **hard line** between conversation and citable outcome  
- Diligence that can recompute a released hash without learning who said what in the room  

## What this architecture is not

- Not operator-proof E2E today  
- Not a guarantee of legal privilege  
- Not a finished external audit artifact (see [`../security/external-review.md`](../security/external-review.md))  
- **Not a Cloudflare Durable Objects / D1 / R2 production deployment today** — see Target runtime below  

---

## Target runtime (Cloudflare)

**Today:** Supabase + Vite (Vercel). **Target (ADR only):** Cloudflare Workers fullstack — Durable Objects for room gate/pacing/dialogue storage, D1 for identity mapping, private R2 for encrypted dialogue archive, public R2 + SHA-256 hash chain for released artifacts, KV for tokens, Queues for async release assembly.

The **product property** already matches that design: room ≠ record; only a facilitator-approved instrument is published as a new artifact with no path back to dialogue. Operator-readable AES-GCM room keys in Postgres are **not** DO-private dialogue; the Cloudflare DO path is the operator-isolation / single-writer consistency target, related to [ADR 005](../adr/005-operator-blind-room-encryption-options.md).

Full mapping, mermaid target diagram, migration phases 0–5, and “when not to migrate mid-pilot”: [`../adr/006-cloudflare-workers-room-record.md`](../adr/006-cloudflare-workers-room-record.md). Non-production stub: [`../../cloudflare/README.md`](../../cloudflare/README.md).

Full stack map (current): [`./architecture-overview.md`](./architecture-overview.md)
