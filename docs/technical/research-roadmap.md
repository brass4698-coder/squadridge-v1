# Research roadmap (not blocking MVP)

These initiatives are documented in product materials but are **not** end-to-end in the app until dedicated code lands:

- **zkTLS-style attribute extraction** — [`zk-implementation.md`](zk-implementation.md), [`onboarding-flow.md`](../product/onboarding-flow.md) step 3.
- **True end-to-end messaging** (operator cannot decrypt content) — requires a different key hierarchy than shared `squads.message_encryption_key`; see [`threat-model.md`](../security/threat-model.md) §5.
- **Public Ledger** beyond demo fixtures — content model and editorial workflow; current UI: [`LedgerPage.tsx`](../../src/pages/LedgerPage.tsx).

Shipped verification today: Semaphore + `verify-zk-proof` Edge Function, as described in the threat model.
