# SquadRidge Trust UI Kit

Concrete design kit for marketing + product surfaces. Aesthetic target: **civic-grade confidentiality** — not cybersecurity neon, not generic SaaS.

**Implemented in:** `src/styles/tokens.css` (`body[data-theme='institutional']`), `src/styles/globals.css` (`.sr-mode-*`, `.sr-evidence-*`, buttons), landing evidence components.

---

## Palette

**App chrome (`:root`)** — deep navy vault for signed-in operations.

| Role | Token | Value |
| ---- | ----- | ----- |
| Background | `--sr-bg` | `#08091F` deep navy |
| Surface / cards | `--sr-bg-elevated` | `#141833` charcoal-navy |
| Primary (app) | `--sr-primary` | `#14B8A6` teal |

**Marketing (`body[data-theme='institutional']`)** — warm mineral / parchment. Restored light institutional system; not Spotify-dark.

| Role | Token | Value |
| ---- | ----- | ----- |
| Canvas | `--sr-bg` | `#F5F3EE` warm mineral |
| Elevated panels | `--sr-bg-elevated` | `#FBFAF7` cream |
| Sunken / room | `--sr-bg-sunken` | `#EBE8E1` |
| Ink | `--sr-ink` | `#1F2423` |
| Secondary ink | `--sr-ink-secondary` | `#5F6A67` |
| Primary | `--sr-primary` | `#0E5E63` deep ink-teal |
| Secondary accent | `--sr-accent-alt` | `#8E7A68` muted bronze (sparingly) |
| Warning | `--sr-warning` | `#A15A37` clay |
| Verify | `--sr-verify` | `#3D7A67` integrity only |

Utilities: `.sr-page-glow` (soft mineral wash on institutional), `.sr-vault-card`, `.sr-shell-sidebar`, `.sr-shell-panel`, `.sr-form-atmosphere` / `.sr-form-panel`.

Do **not** use Spotify green, purple neon, or near-black full-page backgrounds on PublicShell marketing. Printable ledger may still use `.theme-light` where required.

---

## Type

| Context | Face | Token |
| ------- | ---- | ----- |
| Marketing headlines only | Instrument Serif | `--sr-font-display` |
| Body / UI / controls | Inter (+ Public Sans fallback) | `--sr-font-body` / `--sr-font-heading` |
| Metadata, IDs, anchors | IBM Plex Mono | `--sr-font-mono` |

Rules: serif only at page/section display sizes. Product workflows stay sans + tabular nums.

Comfortable marketing scale (everyone, not a toggle): root `17px` / `18px` ≥1280px via `html:has(body[data-theme='institutional'])`. Labels floor at `--text-label: 0.75rem`; body ~`--text-body: 1.0625rem`; display uses larger `clamp()`.

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
- Ease: `--sr-ease-governed` / `--sr-ease-spring` (procedural settle, no bounce)
- Utilities: `.sr-press`, `.sr-lift`, `.sr-fade-rise`, `details[open] > .sr-details-body`
- React: `GovernedPanel`, `ApprovalCount` in `src/components/motion/`
- Celebrate verification/release with restraint only; respect `prefers-reduced-motion`

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

1. Hero: private deliberation infrastructure + room → gate → ledger diagram
2. Why overview (+ safer than chat/email)
3. Privacy boundaries (doctrine + table)
4. Facilitator governance (process stages + evidence)
5. Buyer-track teasers
6. Ledger specimen (public integrity registry)
7. Pilot intake (`#pilot`)
