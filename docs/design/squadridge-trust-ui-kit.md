# SquadRidge Trust UI Kit

Concrete design kit for marketing + product surfaces. Aesthetic target: **civic-grade confidentiality** — not cybersecurity neon, not generic SaaS.

**Implemented in:** `src/styles/tokens.css` (unified `:root` + theme scope aliases), `src/styles/globals.css` (`.sr-mode-*`, `.sr-evidence-*`, `.sr-surface-card`, buttons), landing evidence components.

---

## Palette

**One cool near-black elevation system** for app chrome and marketing. Theme attributes (`institutional`, `ledger-dark`) are layout/scope aliases — they do **not** switch to a cream parchment light theme.

| Role | Token | Value |
| ---- | ----- | ----- |
| Canvas | `--sr-bg` | `#0A0B0D` near-black |
| Elevated panels | `--sr-bg-elevated` | `#14161A` |
| Secondary / sunken | `--sr-bg-secondary` | `#101114` |
| Hover | `--sr-bg-hover` | `#1B1E23` |
| Ink | `--sr-ink` | `#F5F5F7` |
| Secondary ink | `--sr-ink-secondary` | `#A1A1A6` |
| Interactive accent | `--sr-primary` | `#1F8A7A` teal |
| Verification accent | `--sr-verify` | `#3FE0C5` (badges/dots only) |
| Lines | `--sr-line` | `rgba(255,255,255,0.08)` |

Utilities: `.sr-surface-card` / `.sr-surface-card--soft` (elevated fill + soft shadow), `.sr-mode-*`, `.sr-evidence-*`, `.sr-vault-card`, `.sr-shell-sidebar`, `.sr-shell-panel`.

Prefer **elevation** (`bg-surface-elevated` + `shadow-sr-card`) over hard boxed `border border-line` chrome on trust panels. Do **not** use Spotify green, purple neon, or warm cream marketing canvases.

---

## Type

| Context | Face | Token |
| ------- | ---- | ----- |
| Body / UI / headings | Inter | `--sr-font-body` / `--sr-font-heading` / `--sr-font-display` |
| Metadata, IDs, anchors, labels | IBM Plex Mono | `--sr-font-mono` |

Rules: no display serif default (Instrument Serif / IBM Plex Serif retired from the token stack). Product workflows stay sans + mono tabular nums.

Comfortable marketing scale: root `17px` / `18px` ≥1280px via institutional scope where applied. Labels floor at `--text-label`; body ~`--text-body`; display uses larger `clamp()`.

---

## Governed state language

| State | Class | Feel |
| ----- | ----- | ---- |
| Private room | `.sr-mode-room` | Enclosed, secondary fill, soft perimeter |
| Release gate | `.sr-mode-gate` | Accent-tinted, elevated threshold |
| Public ledger | `.sr-mode-ledger` | Flatter canvas, integrity marks |

Evidence layout primitives: `.sr-evidence-frame`, `.sr-evidence-rail`, `.sr-evidence-pane`, `.sr-integrity-mark`, `.sr-approval-count`, `.sr-threshold-elevate`.

---

## Components

### Buttons
- Primary: solid `--sr-primary`, low shadow, 1px press on active — no gradient/glow
- Ghost: surface + quiet border
- Irreversible: same structure; warning only when necessary

### Badges
Keep sparse: Verified · Pending · Released · Not public · Documented limit. Border + type over saturated fills. Use `StatusBadge` variants. Verification accent only on verified / live / released.

### Record / instrument cards
Title → metadata block → status row → anchor footer. Prefer `.sr-evidence-frame` + elevated surface shadows.

### Forms
Labels above fields; focus via `--sr-focus-ring` (verify soft ring on inputs). Validation reads as operational notes.

---

## Motion

Governed ease (`--sr-ease-governed`); respect `prefers-reduced-motion`. Motion for hierarchy and feedback, not spectacle.

---

## Checklist

- [ ] Tokens only — no raw hex in components
- [ ] Interactive teal ≠ verification cyan
- [ ] Inter + IBM Plex Mono only
- [ ] Elevated cards over boxed chrome on trust surfaces
- [ ] Theme aliases left intact for route switching
