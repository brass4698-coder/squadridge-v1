# SquadRidge — Institutional Visual System

Art direction for the public marketing site and institutional-facing materials. Targets investors, foundations, mediators, policy partners, NGOs, and enterprise buyers.

## Design intent

The site should read as **secure infrastructure**, not a startup landing page: calm, precise, audit-minded, and defensible.

## Color system

Applied via `body[data-theme='institutional']` in [`src/styles/tokens.css`](../src/styles/tokens.css):

| Token | Role | Value |
| ----- | ---- | ----- |
| `--sr-bg` | Canvas | `#0c0d0f` graphite |
| `--sr-bg-elevated` | Cards, panels | `#131417` |
| `--sr-bg-sunken` | Recessed areas | `#09090b` |
| `--sr-line` | Borders, grid | `#232428` |
| `--sr-ink` | Primary text | `#ececee` |
| `--sr-ink-secondary` | Body | `#9a9ea8` |
| `--sr-primary` | Single accent (teal-mineral) | `#4a7c78` |

**Rules:** No bright gradients, neon, or decorative blobs on marketing pages. Amber (`--sr-warning`) for pending states only.

## Typography

- **Display / major headings:** IBM Plex Serif (`font-display`) — institutional, editorial
- **UI / body:** Inter (`font-sans`) — legible, policy-grade
- **Metadata / anchors:** IBM Plex Mono (`font-mono`) — audit cues

Headlines are restrained in size (`--sr-text-display: 2.75rem` on institutional theme).

## Spacing

- Section rhythm: `--space-section: 5.5rem`
- Grid discipline: max-width `6xl`, evidence panels use `gap-px` tile borders
- Intentional whitespace — authority through restraint

## Components

Institutional primitives live in [`src/components/institutional/`](../src/components/institutional/):

| Component | Purpose |
| --------- | ------- |
| `TrustBar` | Credibility indicator strip |
| `EvidencePanel` | Three-column proof modules |
| `InstitutionalSplit` | Room vs. record document split |
| `ProcessDiagram` | Configure → Release lifecycle |
| `InterfaceEvidence` | Product UI preview (facilitator + release) |
| `StatusChip` | Approval / release / private states |

CTAs use `.btn-institutional` (rectangular, quiet) — not pill hype.

## Serious CTA language

Use:

- Request pilot access
- Read the security overview
- See the verification flow
- Request institutional briefing
- Review the model

Avoid:

- Get started free / Join now / Try it today / Let's talk

## Homepage structure

See [`src/pages/v2/LandingPage.tsx`](../src/pages/v2/LandingPage.tsx):

1. Hero + room/record split
2. Trust bar
3. Confidentiality model
4. Verification model
5. Product mechanics
6. Why it matters
7. Interface evidence
8. Security posture
9. Operational contexts
10. Ledger sample + diligence FAQ + institutional CTA

## Imagery guidance

No stock photos of handshakes, smiling teams, protest scenes, or office collaboration. Prefer **abstract architectural and document-grade metaphors** built in CSS/SVG — not raster stock.

### Visual tone

Quiet, high-trust, architectural: controlled light, layered surfaces, document-grade layouts, subtle diagrams, abstract spatial imagery. Monochrome or near-monochrome with **one disciplined accent** (`--sr-primary`).

### Use

| Motif | Application |
| ----- | ----------- |
| Thresholds, corridors, secure rooms | About hero (`ProtectedThresholdVisual`) |
| Session → gate → ledger schematics | About, homepage flagship, How it works |
| Ledger fragments, redacted previews, provenance | About mid-page, verification contexts |
| Workflow schematics (thin lines, muted accents) | Process / mechanics sections |
| Interface crops (facilitator panel, release preview) | Interface evidence blocks |

### Avoid

Bright gradient blobs, neon glows, stock teamwork photos, futuristic surveillance dashboards, CCTV / facial recognition motifs, militarized threat visuals, or anything suggesting predictive policing or early-warning monitoring.

### Brief for commissioned imagery

Institutional, calm, high-trust — never flashy or startup-generic. Prefer abstract architectural and document-grade metaphors: layered paper, controlled thresholds, secure rooms, restrained grids, provenance markers, ledger fragments, redacted previews, thin workflow schematics. Soft depth, muted surfaces, one accent. Every image should support: the room is private, the process is structured, only approved outcomes become public.

### Placement

- **About:** hero threshold visual, full-width session→ledger schematic, ledger/provenance panel between narrative sections
- **Homepage / subsystem pages:** one major visual anchor per section — avoid many small decorative graphics

### Components

See [`src/components/institutional/`](../src/components/institutional/):

| Component | Purpose |
| --------- | ------- |
| `InstitutionalVisualFrame` | Grid atmosphere + vignette container |
| `ProtectedThresholdVisual` | Abstract secure-room / threshold SVG |
| `SessionLedgerSchematic` | Private → gate → public progression |
| `LedgerProvenancePanel` | Redacted record + anchor + approval markers |
| `TrustBar` | Credibility indicator strip |
| `EvidencePanel` | Three-column proof modules |
| `InstitutionalSplit` | Room vs. record document split |
| `ProcessDiagram` | Configure → Release lifecycle (framed schematic) |
| `InterfaceEvidence` | Product UI preview (facilitator + release) |
| `StatusChip` | Approval / release / private states |

## Related

- [`full-site-visual-direction.md`](full-site-visual-direction.md) — site-wide public surface direction
- [`design-system.md`](design-system.md)
- [`../security/threat-model.md`](../security/threat-model.md)
- [`../audit/institutional-readiness-audit.md`](../audit/institutional-readiness-audit.md)

## Pages covered

The institutional theme applies automatically via `PublicShell` on all public marketing routes:

| Route | Page |
| ----- | ---- |
| `/` | Landing |
| `/how-it-works` | Process overview |
| `/security` | Security model |
| `/about` | About |
| `/use-cases` | Operational contexts |
| `/ledger`, `/ledger/:id` | Outcome ledger |
| `/faq` | Due diligence FAQ |
| `/contact` | Institutional inquiries |
| `/request-access` | Pilot intake |
| `/privacy`, `/terms` | Legal |
