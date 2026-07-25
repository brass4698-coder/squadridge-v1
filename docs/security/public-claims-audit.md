# Public claims audit (marketing ↔ threat model §5)

Maps public-facing copy to engineering claims in `docs/security/threat-model.md` §5.
Last audited: 2026-07-25.

## Claims that hold — correctly stated in public surface

| Claim | Public location | Engineering basis |
|-------|-----------------|-------------------|
| Room content not published | Landing, About, FAQ, Security | v2 `outcome_records` + facilitator release; squad path edge-only ingest |
| Verification anchor on release (SHA-256 integrity) | Landing, How it works, FAQ, Security | `release_outcome` → `ledger_sha` |
| Not operator-proof E2E today | `faqHome.ts`, `faqFull.ts`, SecurityPage | threat-model §5 AES-GCM + squad key in Postgres |
| Facilitator controls release | About, Security, use cases | automation_architecture `must_not_automate` release |
| Ombuds-aligned confidentiality architecture (not IOA certification) | Security, About | Product architecture + [`institutional-credibility-research.md`](../product/institutional-credibility-research.md) |
| Directional anonymity on the record ≠ legal anonymity guarantee | Security | threat-model §5; Security “Not anonymity as a legal guarantee” |
| Optional AI tone / heat is advisory only | Security | `src/lib/ai/pipeline.ts`; facilitator pacing RPCs |

## Claims corrected or bounded in this audit

| Location | Issue | Resolution |
|----------|-------|------------|
| SecurityPage "TLS end-to-end" | Ambiguous with message E2E | Clarified as transport TLS only |
| IntentPage "zero-knowledge proofs" | Overbroad | Qualified where stack is live |
| Landing ledger preview | Sample labeled illustrative | LedgerIndexPage shows live + sample |
| Verification anchor “when” | Hash alone ≠ trusted time | Security + research brief: SHA-256 shipped; RFC 3161 scaffolded, not live |

## Explicitly not claimed

- IOA certification or ombuds / attorney–client privilege
- Court-admissible RFC 3161 timestamps (columns + typed scaffold only; no live TSA)
- Full anonymity from the operator
- Autonomous AI mute / enforcement
- Operator-proof E2E for current release

## Banned in public copy (enforced by `check:banned-copy`)

- "Operator-proof encryption" / "server-blind E2E" for current release
- "Full anonymity" platform-wide
- Unqualified "end-to-end encrypted" for session content

## Review cadence

Re-run this audit when changing Security page, FAQ, landing hero, institutional research brief, or threat-model §5.
