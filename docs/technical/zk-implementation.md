# Zero-Knowledge Implementation

## Overview

The zero-knowledge (ZK) implementation in SquadRidge is the foundational technology that enables verified-anonymous, cross-border dialogue [1]. Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), this system allows users to cryptographically prove attributes without exposing raw personally identifiable information (PII) [1].

## The Role of Zero-Knowledge Proofs

Participants in authoritarian or active conflict zones face real danger if their identities, locations, or stated views are exposed [3]. General platforms like Zoom or Google Workspace do not offer meaningful anonymization or prevent state-level surveillance [3].

SquadRidge addresses this by utilizing Semaphore-based zero-knowledge proofs (ZKPs) [1]. ZKPs allow a "prover" (the user) to demonstrate to a "verifier" (the platform) that a specific statement is true (e.g., "I am a verified citizen of Region A") without revealing any other information about the statement or the prover's identity [3].

## Implementation Details

### Client and Edge Functions (current codebase)

The browser does **not** write ZK rows to Postgres directly. Two Edge Functions exist; they serve different request shapes:

| Function | Who calls it | Request body (summary) | Role |
| -------- | ------------- | ------------------------ | ---- |
| **`zk-verify`** | React app via `supabase.functions.invoke('zk-verify', …)` from [`src/lib/zkAdapter.ts`](../../src/lib/zkAdapter.ts) when **not** in Vite dev stub mode | `credentialType`, `rawInput` | Production SPA path: auth-required; persists via service role. When `ZK_DEV_SKIP_VERIFY` is not `false`, uses a **stub** hash path (`isStub: true` in the response). When set to `false` without Semaphore keys wired, responds **503** (placeholder until `verifyProof` is integrated). |
| **`verify-zk-proof`** | Callers that post a full Semaphore-shaped payload (e.g. future client or tooling) | `attribute_scope`, `proof`, `public_signals` | Same **`ZK_DEV_SKIP_VERIFY`** contract as `zk-verify`: stub shape validation and DB writes when not `false`; **503** when `false` until real `verifyProof` + keys are deployed. |

**`VITE_ZK_STUB` matrix (client bundle)**

| Context | Typical `VITE_ZK_STUB` | What runs |
| ------- | -------------------- | ---------- |
| Vite dev (`npm run dev`) | Any (ignored for Edge routing) | [`zkAdapter`](../../src/lib/zkAdapter.ts) always uses local `generateProof` — no Edge call. |
| Production build | Unset or `false` | Invokes **`zk-verify`** (unless Edge returns 503; see above). |
| Production build | `true` | Local `generateProof` bundled — use only for demos / emergency fallback. |

**Vite dev vs production build**

- **Vite dev** (`import.meta.env.DEV === true`): [`zkAdapter`](../../src/lib/zkAdapter.ts) always uses local `generateProof` from [`zkVerifier`](../../src/lib/zkVerifier.ts) — no Edge Function call, regardless of `VITE_ZK_STUB`.
- **Production build**: invokes **`zk-verify`** unless `VITE_ZK_STUB=true` (which keeps the local proof path in the bundle).

**Legacy guard:** [`isZkVerifierStubEnabled()`](../../src/lib/env.ts) (`VITE_ZK_STUB !== 'false'`) gates older dev helpers such as `submitZkProofStub`; it does not override the dev-server behavior above.

**Deploy (CI):** [`.github/workflows/deploy-supabase-production.yml`](../../.github/workflows/deploy-supabase-production.yml) runs `supabase functions deploy` when `supabase/functions/*/index.ts` exists — **all** Edge Functions under [`supabase/functions/`](../../supabase/functions/) deploy together (including `zk-verify` and `verify-zk-proof`). There is no per-function toggle in that workflow.

**Onboarding copy:** Phase 1 onboarding states that the ZK gate is **simulated** and that proofs stay on-device until released — see [`src/onboarding/app/components/onboarding/copy.ts`](../../src/onboarding/app/components/onboarding/copy.ts) (`verification.leadLine1`, `verification.leadLine2`, `verification.zkGateEmphasis`, `verification.zkGateRest`). That matches dev stub + optional Edge behavior above.

Commitments are derived from proof material and scope—**not** from embedding the user id in the preimage. See also [data retention and logging](data-retention-zk.md).

### 1. Semaphore-Based Proofs

Semaphore is a ZK-based signaling framework that enables applications where users can prove group membership without exposing their identity [3]. In SquadRidge, Semaphore is used to verify attributes like citizenship or organizational roles [1].

When a user onboards, they generate a cryptographic proof based on their attributes. This proof is submitted to the platform, which verifies it against a public key infrastructure without ever accessing the underlying PII.

### 2. zkTLS for Data Extraction

To obtain the necessary attributes for verification, SquadRidge utilizes zkTLS (Zero-Knowledge Transport Layer Security) [2]. zkTLS allows users to extract private data from secure web sources (e.g., legal identity, education records) and bring it on-chain as a privacy-preserving proof [2].

This mechanism ensures that the platform can verify a user's background (e.g., their citizenship or professional credentials) without requiring them to upload sensitive documents or link their actions to biometric data [3].

## Security and Anonymity

The ZK implementation in SquadRidge strictly decouples a user's verified attributes from their public identity. This verified anonymity is crucial for protecting users from state retaliation while ensuring they are matched into appropriate dialogue sessions [1].

The platform's architecture ensures that even if the database is compromised, the raw dialogue and user identities remain secure, as the ZK proofs only confirm attributes, not the individuals behind them [1].

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
