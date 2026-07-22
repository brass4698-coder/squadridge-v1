# SquadRidge — Institutional Visual System

Art direction for the public marketing site and institutional-facing materials. Targets investors, foundations, mediators, policy partners, NGOs, and enterprise buyers.

## Design intent

**Civic-grade confidentiality** — secure infrastructure, not a cybersecurity or SaaS landing page. Calm, precise, audit-minded. Wow comes from restraint, alignment, and governed depth — never neon, purple gradients, or AI-security spectacle.

Pasteable kit (tokens, components, motion, checklist): [`squadridge-trust-ui-kit.md`](squadridge-trust-ui-kit.md).

## Color system

Applied via `body[data-theme='institutional']` in [`src/styles/tokens.css`](../../src/styles/tokens.css):

| Token | Role | Value |
| ----- | ---- | ----- |
| `--sr-bg` | Canvas | `#F5F3EE` warm mineral |
| `--sr-bg-elevated` | Cards, panels | `#FBFAF7` |
| `--sr-bg-secondary` | Lifted panels | `#F0EEE8` |
| `--sr-bg-sunken` | Recessed / room | `#EBE8E1` |
| `--sr-line` | Borders, grid | `#DDD8CE` |
| `--sr-ink` | Primary text | `#1F2423` |
| `--sr-ink-secondary` | Body / metadata | `#5F6A67` |
| `--sr-primary` | Action (ink-teal) | `#0E5E63` |
| `--sr-verify` | Integrity only | `#3D7A67` |
| `--sr-warning` | Documented limits | `#A15A37` clay |

**Rules:** No bright gradients, neon, or decorative blobs on marketing pages. Clay warning for documented limits and cautionary notices — not alarm red. Verification color is rare — ledger anchors and approval confirmations only. App chrome stays on dark `:root`; this theme is PublicShell marketing only.

## Governed visual modes

Recurring modes for the room → gate → ledger sequence (CSS: `.sr-mode-room`, `.sr-mode-gate`, `.sr-mode-ledger`):

| Mode | Feel | Surface |
| ---- | ---- | ------- |
| **Private room** | Soft, enclosed, subdued metadata | Warm sunken / inset perimeter |
| **Release gate** | Highest structure, deliberate threshold | Ink-teal tint + elevate |
| **Public ledger** | Flatter, open, integrity cues | Clean elevated panel, minimal chrome |

## Trust UI checklist

- [ ] One accent for actions; verification color only on integrity states
- [ ] Labels before icons; mono for metadata and anchors
- [ ] Thin document rules over card shadows / floating chrome
- [ ] Gate surfaces tinted, not neon-bordered
- [ ] Motion is procedural (`--sr-ease-governed`); no bounce
- [ ] Evidence frames use `.sr-evidence-frame` / `.sr-evidence-rail`
- [ ] Released records show a sparse integrity mark (`.sr-integrity-mark`)

## Typography

- **Display / major headings (marketing only):** Instrument Serif (`font-display`)
- **UI / body / controls:** Inter (`font-sans`) — legible, policy-grade
- **Metadata / anchors:** IBM Plex Mono (`font-mono`) — audit cues, tabular nums for counts

Do not overuse serif inside product workflows — controlled workflow, not editorial flourish.

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

See [`src/pages/v2/LandingPage.tsx`](../../src/pages/v2/LandingPage.tsx):

1. Editorial hero + system model diagram (room → gate → ledger)
2. Process stage panel — three governed states (single module)
3. Trust boundary table + honesty micro-summary
4. Product evidence sequence (three visual modes)
5. Mediation flagship + context teasers
6. Released record specimen + pilot intake (`#pilot`)

Also see [`marketing-redesign-audit.md`](marketing-redesign-audit.md) and
[`alignment-system.md`](alignment-system.md) (left-first alignment rules).

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
- **Security (`/security`):** schematic + document-instrument only — `TrustBoundarySchematic` in the hero and `LedgerProvenancePanel` at the anchor section. No decorative illustration system, lifestyle photos, or cybersecurity icon packs. Typography and docket lists carry the rest.

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
