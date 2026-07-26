# Public claims audit (marketing ↔ threat model §5)

Maps public-facing copy to engineering claims in `docs/security/threat-model.md` §5.

**Machine-readable SoT for UI badges:** [`src/data/implementationStatus.ts`](../../src/data/implementationStatus.ts) (Implementation Status Registry). Security, Home, How it works, and Ledger must render LIVE / SCAFFOLDED / PLANNED from that module — not from ad-hoc copy.

Partner-facing packet: [`trust-diligence-packet.md`](./trust-diligence-packet.md) · public download `/diligence/trust-diligence-packet.md`.

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
| Optional AI tone / heat is advisory only | Security | `src/lib/ai/pipeline.ts`; facilitator pacing RPCs; participant room labels the local nudge as an in-browser suggestion |
| Approvals are bound to the exact released wording | Security (“Live today”, reviewer appendix), facilitator release page | `outcome_approvals.reviewed_content_sha` + reset trigger (`20260725220000`) |
| Release requires a facilitator authorship attestation | Security, facilitator release page | `facilitator_attest_outcome_authorship`; `release_outcome` refuses without a current attestation |
| Room content is operator-readable | Security (“Who can read the room”), homepage TrustBoundaryBlock | `session_messages.body` is plaintext; threat-model §5 |
| Facilitator notes are not published | Security, ledger record page | Column-level grants exclude `facilitator_notes`; `facilitator_get_outcome_notes` for facilitators |
| Ledger holds no live public releases yet | LedgerIndexPage empty state, record page, home specimen | No published `outcome_records` rows; every displayed entry is a labelled specimen |

## Claims corrected or bounded in this audit

| Location | Issue | Resolution |
|----------|-------|------------|
| SecurityPage "TLS end-to-end" | Ambiguous with message E2E | Clarified as transport TLS only |
| IntentPage "zero-knowledge proofs" | Overbroad | Qualified where stack is live |
| Landing ledger preview | Sample labeled illustrative | LedgerIndexPage shows live + sample |
| Verification anchor “when” | Hash alone ≠ trusted time | Security + research brief: SHA-256 shipped; RFC 3161 scaffolded, not live |
| Specimen ledger entries | A sample dossier read like a released record | Specimen banner, watermarked surface, “not verifiable” anchor label, citation prefixed `ILLUSTRATIVE SPECIMEN` |
| Security page roadmap | Planned work could read as shipped | Explicit “Live today, and what is not” split; planned rows say what exists (columns, interfaces) and what does not run |
| Homepage TrustBoundaryBlock “moderator keys can decrypt” | Implied encrypted v2 room + audited decrypt | Rewrote to operator-readable plaintext for v2 rooms; legacy AES-GCM + audited decrypt stays scoped to Mod dashboard / threat model §5 |

## Explicitly not claimed

- IOA certification or ombuds / attorney–client privilege
- Court-admissible RFC 3161 timestamps (columns + typed scaffold only; no live TSA)
- Full anonymity from the operator
- Autonomous AI mute / enforcement
- Operator-proof E2E for current release
- A live pilot, named partner organisations, user counts, or outcome metrics
- Any live public ledger release (the register is empty and says so)
- That the verification anchor proves authorship, identity, or time of release
- That v2 facilitated rooms use application-layer encryption or “moderator decrypt” (that path is legacy squad chat only)

## Banned in public copy (enforced by `check:banned-copy`)

- "Operator-proof encryption" / "server-blind E2E" for current release
- "Full anonymity" platform-wide
- Unqualified "end-to-end encrypted" for session content
- "moderator keys can decrypt" on public marketing surfaces (legacy Mod path only)

## Review cadence

Re-run this audit when changing Security page, FAQ, landing hero, institutional research brief, or threat-model §5.
