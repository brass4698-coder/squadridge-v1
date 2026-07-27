# SquadRidge — Full-site visual direction

> Companion to [`institutional-visual-system.md`](./institutional-visual-system.md). Prefer the institutional doc for day-to-day marketing edits; this file holds site-wide constraints and anti-patterns.

Site-wide art direction for the public marketing surface. Use with [`institutional-visual-system.md`](institutional-visual-system.md) when editing Home, About, How It Works, Security, Ledger, Request Access, and related pages.

---

## Product constraints (do not contradict)

- Institutional dialogue infrastructure — facilitator-led **written** sessions
- Private room; only approved outcomes may become public
- Release is deliberate; provenance and record credibility matter
- Not surveillance, predictive policing, or continuous early-warning monitoring
- Not a generic collaboration or chat product

Copy anchor: *"not a surveillance or early-warning product"* — visuals must match.

---

## Goal

One coherent visual language across public pages: calm civic/process infrastructure for protected dialogue and verifiable outcomes.

**Fits:** restrained, structured, archival, high-trust, specific to room → release → ledger.

**Does not fit:** startup-generic SaaS kits, purple gradient blobs, cyberpunk glow, surveillance dashboards, messaging-app hero patterns, stock handshake photography.

## Visual thesis

> There is a protected room, a governed process, and a credible public record.

Reinforce: protected interior → process → release gate → public record → provenance.

## Language and motifs

Architectural thresholds, enclosed rooms, layered dockets, thin-line schematics, ledger fragments, verification markers, redaction contrast, matte/paper textures.

**Avoid:** neon orbs, CCTV/biometrics cues, live-data theater, lazy lock/shield icon grids, repetitive three-column marketing cards, decorative filler.

## Color and type

- Use `--sr-*` tokens only; one accent; composition over decoration
- Editorial left-aligned layouts; varied density; no cookie-cutter section kits

## Page anchors

| Page | Visual anchor |
| ---- | ------------- |
| **Home** | Threshold or room/record split; session → gate → ledger schematic |
| **About** | Threshold hero; session → ledger schematic; provenance panel |
| **How It Works** | Process diagram; procedural layout |
| **Security** | Trust-boundary schematic; provenance; no cyber branding |
| **Ledger** | Archive/docket visual; document-grade list |
| **Request Access** | Selective pilot tone; calm process visual beside the form |

## Decision filter

Keep a visual only if it strengthens privacy, structure, facilitator control, release governance, provenance, record credibility, or institutional trust. Otherwise remove it.

## Implementation components

| Component | Path | Use |
| --------- | ---- | --- |
| `InstitutionalVisualFrame` | `src/components/institutional/` | Grid atmosphere container |
| `ProtectedThresholdVisual` | ↑ | About/Home threshold hero |
| `SessionLedgerSchematic` | ↑ | Private → gate → public flow |
| `LedgerProvenancePanel` | ↑ | Redacted record + anchor |
| `TrustBoundarySchematic` | ↑ | Security access layers |
| `LedgerArchiveVisual` | ↑ | Ledger index archival stack |
| `ProcessDiagram` | ↑ | Configure → Release |
| `InstitutionalSplit` | ↑ | Room vs record documents |

## Message architecture

Canonical copy and CTAs: [`src/data/siteMessaging.ts`](../../src/data/siteMessaging.ts)  
Cross-page evaluator path: `src/components/shared/EvaluatorPath.tsx`
