# SquadRidge — Trust & Diligence Packet

**Registry version:** 2026.07.26  
**Source:** Synchronized with `src/data/implementationStatus.ts` and `docs/security/trust-diligence-packet.md`.

## Current vs planned (summary)

| Capability | Status |
| ---------- | ------ |
| SHA-256 verification anchor | LIVE |
| Hash-bound approvals | LIVE |
| Facilitator authorship attestation | LIVE |
| Metadata-only audit trail | LIVE |
| Magic-link auth; role-scoped invites | LIVE |
| Manual intake review (aim: about one week) | LIVE |
| Ledger release mechanism (approved outcomes only; specimens until first live publish) | LIVE |
| Application-layer room encryption (AES-GCM) | LIVE (operator-readable keys) |
| RFC 3161 trusted timestamping | SCAFFOLDED (not live) |
| Operator-blind room encryption | PLANNED (keys still operator-readable) |
| IOA certification / legal privilege / court-admissible time | NOT CLAIMED |

## Honest bounds

- Room dialogue is encrypted at the application layer for facilitators and admitted participants; operators with database access can still decrypt (not Signal-grade E2E).
- SHA-256 proves integrity of approved release text — not independently attested time.
- Public ledger shows released records only; specimens are labeled illustrative and not verifiable.

## Data residency & subprocessors

Typical stack: Supabase (DB/Auth/Edge), Vercel (frontend), optional Resend (email), optional Sentry (errors without message bodies). Confirm region in the pilot MOU.

## Incident & deletion

- Acknowledge security incidents affecting pilot data within 72 hours of confirmed awareness (pilot target; contract may tighten).
- On termination: delete/archive session and token data per retention policy; discuss any deliberately published ledger rows before release.

## Full packet

See `docs/security/trust-diligence-packet.md` in the repository for the complete narrative, ADR links, and process notes. Web: `/security#diligence-packet` and `/diligence/trust-diligence-packet.md`.
