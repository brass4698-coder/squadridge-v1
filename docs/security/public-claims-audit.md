# Public claims audit (marketing ↔ threat model §5)

Maps public-facing copy to engineering claims in `docs/security/threat-model.md` §5.
Last audited: 2026-07-08.

## Claims that hold — correctly stated in public surface

| Claim | Public location | Engineering basis |
|-------|-----------------|-------------------|
| Room content not published | Landing, About, FAQ, Security | v2 `outcome_records` + facilitator release; squad path edge-only ingest |
| Verification anchor on release | Landing, How it works, FAQ | `useOutcomeRecord.publishToLedger` / `release_outcome` RPC |
| Not operator-proof E2E today | `faqHome.ts`, `faqFull.ts`, SecurityPage | threat-model §5 AES-GCM + squad key in Postgres |
| Facilitator controls release | About, Security, use cases | automation_architecture `must_not_automate` release |
| Semaphore verified server-side | Security page (if stated) | handleZkProofVerification |

## Claims corrected or bounded in this audit

| Location | Issue | Resolution |
|----------|-------|------------|
| SecurityPage "TLS end-to-end" | Ambiguous with message E2E | Clarified as transport TLS only |
| IntentPage "zero-knowledge proofs" | Overbroad | Qualified where stack is live |
| Landing ledger preview | Sample labeled illustrative | LedgerIndexPage shows live + sample |

## Banned in public copy (enforced by `check:banned-copy`)

- "Operator-proof encryption" / "server-blind E2E" for current release
- "Full anonymity" platform-wide
- Unqualified "end-to-end encrypted" for session content

## Review cadence

Re-run this audit when changing Security page, FAQ, landing hero, or threat-model §5.
