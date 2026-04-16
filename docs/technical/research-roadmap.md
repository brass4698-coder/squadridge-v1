# Research roadmap (not blocking MVP)

These initiatives are documented in product materials but are **not** end-to-end in the app until dedicated code lands:

- **zkTLS-style attribute extraction** — [`zk-implementation.md`](zk-implementation.md), [`onboarding-flow.md`](../product/onboarding-flow.md) step 3. RFC: [`rfc-zktls-attribute-proofs.md`](rfc-zktls-attribute-proofs.md); optional env `VITE_ZKTLS_LABS` (see [`src/lib/env.ts`](../../src/lib/env.ts)).
- **True end-to-end messaging** (operator cannot decrypt content) — requires a different key hierarchy than shared `squads.message_encryption_key`; see [`threat-model.md`](../security/threat-model.md) §5. RFC: [`rfc-e2e-messaging-key-hierarchy.md`](rfc-e2e-messaging-key-hierarchy.md).
- **Public Ledger** beyond demo fixtures — [`ledger_proposals`](../../supabase/migrations/20260416183000_ledger_proposals.sql) table + [`LedgerPage.tsx`](../../src/pages/LedgerPage.tsx).

Shipped verification today: Semaphore + `verify-zk-proof` Edge Function, as described in the threat model.
