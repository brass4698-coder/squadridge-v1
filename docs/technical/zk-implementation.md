# Zero-Knowledge Implementation

See also the **[operational threat model](../security/threat-model.md)** for trust boundaries, server-side linkage of proofs to `user_id`, and release gates.

## Overview

The zero-knowledge (ZK) implementation in SquadRidge is the foundational technology that enables verified-anonymous, cross-border dialogue [1]. Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), this system allows users to cryptographically prove attributes without exposing raw personally identifiable information (PII) [1].

## The Role of Zero-Knowledge Proofs

Participants in authoritarian or active conflict zones face real danger if their identities, locations, or stated views are exposed [3]. General platforms like Zoom or Google Workspace do not offer meaningful anonymization or prevent state-level surveillance [3].

SquadRidge addresses this by utilizing Semaphore-based zero-knowledge proofs (ZKPs) [1]. ZKPs allow a "prover" (the user) to demonstrate to a "verifier" (the platform) that a specific statement is true (e.g., "I am a verified citizen of Region A") without revealing any other information about the statement or the prover's identity [3].

## Implementation Details

### Client and Edge Functions (current codebase)

**Database writes:** Clients do **not** INSERT into `zk_proof_submissions` or `verified_attributes` for verified paths. Migration [`20250414100000_zk_server_verified_insert.sql`](../../supabase/migrations/20250414100000_zk_server_verified_insert.sql) removed direct client INSERT policies; the Edge Function uses the **service role** after `verifyProof` succeeds (see [`supabase/functions/_shared/handleZkProofVerification.ts`](../../supabase/functions/_shared/handleZkProofVerification.ts)).

**Shared handler:** `handleZkProofPost` validates the caller’s JWT (`Authorization: Bearer`), parses JSON, runs `@semaphore-protocol/proof`’s `verifyProof` on `semaphore_proof`, checks that proof `message` / `scope` match `attribute_scope` and `credential_type`, then calls `verifyAndPersistZkProof` to insert a row and upsert `verified_attributes`. There is **no** `ZK_DEV_SKIP_VERIFY` (or similar) branch in this handler—older docs that referenced it are obsolete.

**Edge Function entrypoints:**

| Function | Implementation | Caller |
| -------- | ---------------- | ------ |
| **`verify-zk-proof`** | [`supabase/functions/verify-zk-proof/index.ts`](../../supabase/functions/verify-zk-proof/index.ts) → `Deno.serve(handleZkProofPost)` | **Production path:** [`runVerification`](../../src/lib/zkAdapter.ts) via `supabase.functions.invoke('verify-zk-proof', …)`. |
| **`zk-verify`** | [`supabase/functions/zk-verify/index.ts`](../../supabase/functions/zk-verify/index.ts) — same `handleZkProofPost` | Deprecated alias for older clients; **prefer `verify-zk-proof`**. |

**Request body (both functions):** `{ attribute_scope: string, credential_type: string, semaphore_proof: SemaphoreProofBody }` — see `SemaphoreProofBody` / `ZkVerifyRequestBody` in the shared module.

**JSON response contract (`verify-zk-proof` / `zk-verify`):** The Edge handler returns a **wrapped success** shape so clients can distinguish failures without guessing field presence:

| Shape | Meaning |
| ----- | ------- |
| **`{ ok: true, proof: { proofId, credentialType, nullifierHash, commitment, verifiedAt, isStub? } }`** | Preferred — parsed by [`parseVerifyZkProofResponse`](../../src/lib/verifyZkProofResponse.ts). |
| **Legacy flat proof object** (same fields at top level, without `ok`) | Still accepted by the parser for older deploys. |
| **`{ ok: false, error: string, errorCode?: string }`** | Verification failed — client maps `errorCode` where present (unknown shapes → treated as generic rejection). |
| **`{ error: string }`** only | Legacy error body without `ok`. |

Client code **must not** trust arbitrary JSON shapes: [`parseVerifyZkProofResponse`](../../src/lib/verifyZkProofResponse.ts) validates with **zod** and fails closed.

**SPA flow:**

1. [`src/lib/zkAdapter.ts`](../../src/lib/zkAdapter.ts) `runVerification`: if `VITE_ZK_STUB === 'true'`, returns [`generateStubProof`](../../src/lib/zkVerifier.ts) (no Edge call; not shippable in production builds — [`vite.config.ts`](../../vite.config.ts)).
2. Otherwise [`generateSemaphoreProof`](../../src/lib/zkVerifier.ts) (identity + group helpers under [`src/lib/zk/`](../../src/lib/zk/)), then [`semaphoreProofToWireFormat`](../../src/lib/zk/serializeSemaphoreProof.ts) for JSON-safe transport, then **`verify-zk-proof`** with the Semaphore-shaped body.

**`VITE_ZK_STUB` matrix (client)**

| `VITE_ZK_STUB` | Dev (`npm run dev`) | Production (`npm run build`) |
| -------------- | -------------------- | ----------------------------- |
| **`true`** | Hash-only stub in [`zkVerifier`](../../src/lib/zkVerifier.ts); **no** Edge call. | **Build fails** — cannot ship. |
| **Unset or `false`** | Semaphore + `verify-zk-proof` (needs network and a deployed function). | Same: Semaphore + `verify-zk-proof`. |

Dev does **not** automatically skip the Edge Function—only `VITE_ZK_STUB=true` avoids it. With the stub enabled, [`SessionAccess`](../../src/components/session/SessionAccess.tsx) also blocks live `/session/:id` routes so cohort pilots do not enter encrypted squad chat while verification is hash-only (use the offline demo route documented in-app).

**Legacy helper:** [`isZkStubDevPathAllowed()`](../../src/lib/env.ts) (formerly `isZkVerifierStubEnabled`) gates [`submitZkProofStub`](../../src/lib/zk/index.ts) only; it does not change `runVerification` / `zkAdapter` behavior. Verified scopes in `verified_attributes` can be mixed into matchmaking `pool_key` segments (`|zk:…`); see [`matchmakingPoolKey.ts`](../../src/lib/matchmakingPoolKey.ts) and migration `20260418130000_squad_peer_profiles_and_zk_pool.sql`.

**Deploy (CI):** [`.github/workflows/deploy-supabase-production.yml`](../../.github/workflows/deploy-supabase-production.yml) runs `supabase functions deploy` for all functions under [`supabase/functions/`](../../supabase/functions/). [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs frontend build/test but does not deploy Edge Functions.

**Demos / recordings:** Staging checklist and short script for partner or investor walkthroughs — [`zk-demo-staging-checklist.md`](../operations/zk-demo-staging-checklist.md), [`zk-verify-demo-script.md`](../operations/zk-verify-demo-script.md).

**Onboarding copy:** See [`copy.ts`](../../src/onboarding/app/components/onboarding/copy.ts) — verification step explains Semaphore + Edge; stub mode is documented as dev-only.

Proof **commitments** hash proof material and scope; they are stored alongside **`user_id`** for the logged-in account (see [threat model](../security/threat-model.md)). See also [data retention and logging](data-retention-zk.md).

### 1. Semaphore-Based Proofs

Semaphore is a ZK-based signaling framework that enables applications where users can prove group membership without exposing their identity [3]. In SquadRidge, Semaphore is used to verify attributes like citizenship or organizational roles [1].

When a user completes verification in-app, they generate a Semaphore proof bound to labels (`attribute_scope`, `credential_type`). The Edge verifier checks the proof; **raw ID documents are not** stored in Postgres for this path.

**Group construction and trust roots:** The client builds a small Merkle group (see `buildSessionAnonymityGroup` in `src/lib/zk/buildAnonymityGroup.ts`) for valid proofs in development; **issuer-maintained anonymity sets** and any **named trusted root registry** are a **diligence / deployment** topic—see [threat model §13](../security/threat-model.md).

### 2. zkTLS for Data Extraction (roadmap)

Product materials reference **zkTLS** for extracting attributes from secure web sources [2]. That pipeline is **not implemented in this repository**; current verification uses in-browser Semaphore proving over configured scopes (see [`src/lib/zk/`](../../src/lib/zk/)) and server-side `verifyProof`. Treat zkTLS as **future / research** unless a dedicated integration lands in `src/` and Edge code.

## Security and Anonymity

Semaphore proofs in this stack hide **secret witness / group membership** from verifiers in the usual Semaphore sense, while the service still stores **which account** (`user_id`) verified **which scope**—see the [threat model](../security/threat-model.md). That is a different guarantee than “the operator cannot tell who verified.”

**Messages and dialogue** are a separate surface: until true end-to-end encryption ships, assume the database operator can read MVP message payloads ([`src/lib/messagePayload.ts`](../../src/lib/messagePayload.ts)). ZK verification does not encrypt squad chat.

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
