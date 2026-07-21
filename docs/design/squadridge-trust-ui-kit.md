# SquadRidge Trust UI Kit

Concrete design kit for marketing + product surfaces. Aesthetic target: **civic-grade confidentiality** — not cybersecurity neon, not generic SaaS.

**Implemented in:** `src/styles/tokens.css` (`body[data-theme='institutional']`), `src/styles/globals.css` (`.sr-mode-*`, `.sr-evidence-*`, buttons), landing evidence components.

---

## Palette (institutional marketing)

| Role | Token | Value |
| ---- | ----- | ----- |
| Background | `--sr-bg` | `#F5F3EE` warm mineral |
| Surface | `--sr-bg-elevated` | `#FBFAF7` |
| Sunken / room | `--sr-bg-sunken` | `#EBE8E1` |
| Ink | `--sr-ink` | `#1F2423` |
| Secondary | `--sr-ink-secondary` | `#5F6A67` |
| Primary action | `--sr-primary` | `#0E5E63` deep ink-teal |
| Integrity | `--sr-verify` | `#3D7A67` (anchors, approvals complete only) |
| Caution | `--sr-warning` | `#A15A37` clay (documented limits) |

App chrome (`:root`) remains dark for signed-in operations. Marketing routes set `data-theme="institutional"` via `PublicShell`.

---

## Type

| Context | Face | Token |
| ------- | ---- | ----- |
| Marketing headlines only | Instrument Serif | `--sr-font-display` |
| Body / UI / controls | Inter (+ Public Sans fallback) | `--sr-font-body` / `--sr-font-heading` |
| Metadata, IDs, anchors | IBM Plex Mono | `--sr-font-mono` |

Rules: serif only at page/section display sizes. Product workflows stay sans + tabular nums.

---

## Governed state language

| State | Class | Feel |
| ----- | ----- | ---- |
| Private room | `.sr-mode-room` | Enclosed, sunken, soft perimeter |
| Release gate | `.sr-mode-gate` | Accent-tinted, elevated threshold |
| Public ledger | `.sr-mode-ledger` | Flatter, open, integrity marks |

Evidence layout primitives: `.sr-evidence-frame`, `.sr-evidence-rail`, `.sr-evidence-pane`, `.sr-integrity-mark`, `.sr-approval-count`, `.sr-threshold-elevate`.

---

## Components

### Buttons
- Primary: solid `--sr-primary`, low shadow, 1px press on active — no gradient/glow
- Ghost: surface + quiet border
- Irreversible: same structure; clay/warning only when necessary

### Badges
Keep sparse: Verified · Pending · Released · Not public · Documented limit. Border + type over saturated fills. Use `StatusBadge` variants.

### Record / instrument cards
Title → metadata block → status row → anchor footer. Prefer `.sr-evidence-frame` + `.sr-mode-ledger`.

### Forms
Labels above fields; focus via `--sr-focus-ring` (teal). Validation reads as operational notes.

---

## Motion

- 160–220ms (`--sr-duration-governed`)
- Ease: `--sr-ease-governed` (procedural, no bounce)
- Celebrate verification/release with restraint only

---

## Trust UI checklist

1. Can a user tell private room vs release gate vs public record at a glance?
2. Are irreversible actions visually heavier than routine actions?
3. Do verified / approved / published feel structurally different?
4. Are security claims backed by boundaries and integrity marks, not icon theater?
5. Is decoration subordinate to content and state?
6. Does the UI feel like governed infrastructure, not a collab chat product?

---

## Homepage direction

1. Hero: copy + system model diagram (room → gate → ledger modes)
2. Single process module (no duplicate framing)
3. Boundary table with honesty micro-summary
4. Evidence sequence using three modes
5. Mediation flagship + teaser contexts
6. Ledger specimen + plain-language anchor note
7. Pilot intake as the funnel end (`#pilot`)
