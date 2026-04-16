# ZK verification — demo script (short)

**Route:** `/verify` ([`VerificationPage`](../../src/pages/VerificationPage.tsx))  
**Prerequisites:** [ZK demo staging checklist](zk-demo-staging-checklist.md) (real Semaphore + Edge, stub off).

## 1. Setup (15 seconds)

1. Open the staging URL and confirm there is **no** amber **ZK stub mode** banner at the top.
2. Say: *“We never ask for documents, email, or phone on this step—the copy on the page matches what the code does.”*

## 2. Run verification (30–60 seconds)

1. Click **Run verification**.
2. Wait for success (button returns from busy state; success copy appears).
3. Say: *“The browser generated a Semaphore proof; the `verify-zk-proof` Edge Function verified it and persisted commitments server-side—clients don’t get to INSERT verified rows directly.”*

## 3. Optional — engineering depth (if asked)

Pull from [`docs/technical/zk-implementation.md`](../technical/zk-implementation.md):

- Proof verification uses `@semaphore-protocol/proof` **`verifyProof`** on the server; scope and credential type must match the proof payload before persistence.
- **`zk_proof_submissions`** / **`verified_attributes`** are written with the **service role** after verification succeeds.

## 4. Optional — trust boundaries (if asked)

Pull from [`docs/security/threat-model.md`](../security/threat-model.md) §5:

- ZK proves statements about **attributes** without storing raw ID documents; proof records are still **bound to `user_id`** for the logged-in account—the platform learns *that this account* verified, not the underlying PII from a document upload (there isn’t one on this path).
- **Messaging** is a separate surface: ZK verification does **not** mean chat is E2E-encrypted against the operator—cite the threat model if the conversation drifts to “everything is encrypted from SquadRidge.”

## 5. Do not claim (accuracy)

- **zkTLS**-style extraction from TLS-protected websites is **research / roadmap**, not shipped—see [`docs/technical/rfc-zktls-attribute-proofs.md`](../technical/rfc-zktls-attribute-proofs.md). If `VITE_ZKTLS_LABS` is on, the page shows a labs notice; treat it as **not** a product feature.

## 6. Ledger narrative (investor-style, separate beat)

The **Ledger** demo proposal uses **“ZK-attested summary · demo fixture”** as a **labeled scenario**—it is not a live on-chain attestation. Use it to explain *why* attested outcomes matter civically, not as proof of a second technical pipeline.
