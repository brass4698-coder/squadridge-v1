# Design System

## Overview

The SquadRidge design system uses a dark, calm **global civic** aesthetic: clarity, neutrality, and accessibility for structured dialogue and de-escalation. Visual language should feel stable and supportive — never alarmist, punitive, or militarized.

Implementation flows through **`src/styles/tokens.css`** (`--sr-*` variables) and Tailwind aliases. Do not scatter raw hex values in components.

## Visual Identity

- **Surfaces**: deep indigo/navy tokens (`--sr-bg`, `--sr-bg-elevated`, `--sr-line`) — see tokens.css Phase 6 palette.
- **Accent**: teal `--sr-primary` for primary actions; restrained violet `--sr-accent-alt` for decorative highlights only.
- **Semantic states**: `--sr-success`, `--sr-warning`, `--sr-danger`, `--sr-info` — always pair color with text, icon, or shape (WCAG AA).
- **Avoid**: flags, militaristic symbols, weapons, or inflammatory visual metaphors.

## Typography

Fonts are tokenized in `tokens.css`:

| Token | Stack | Use |
|-------|-------|-----|
| `--sr-font-body` | Inter | Body, forms, tables, metadata |
| `--sr-font-heading` | IBM Plex Sans | Section headings, UI chrome |
| `--sr-font-display` | IBM Plex Serif | Marketing hero, ledger display |
| `--sr-font-mono` | IBM Plex Mono | Ledger, code, verification anchors |

Use Tailwind `font-sans`, `font-heading`, `font-display`, `font-mono`. App chrome (`/app/*`) uses the compact scale (`--sr-text-page-title` … `--sr-text-meta`); marketing uses `--sr-text-display` … `--sr-text-h3` with `clamp()` where responsive scaling helps.

## Component Library and UI Patterns

Components are built with Tailwind CSS and must meet **WCAG AA** (4.5:1 normal text, 3:1 large text and UI boundaries).

Every interactive component defines: default, hover, focus-visible, active, disabled, loading, and error states where relevant.

### Buttons

- Primary actions use `--sr-primary` token variants.
- Destructive/warning actions differ by label, icon, and hierarchy — not color alone.
- De-escalation controls (“Slow down”, “Pull back”) need generous tap targets and calm copy.

### SVG and iconography

- Consistent stroke weight and visual density.
- Icons support comprehension; critical workflows keep visible text labels.
- No violent, nationalistic, or weapon motifs.

## Accessibility and Localization

- Support `prefers-reduced-motion`; avoid decorative looping animation in safety/moderation flows.
- Design for intermittent connectivity: show reconnecting, unsynced, retry, and failed-to-send states (`useRealtimeMessages`, `useOnlineStatus`).
- AI-assisted translation is optional — core messaging must work when translation fails.

## References

- Cursor rules: `.cursor/rules/component-rules.mdc`, `.cursor/rules/squadridge.mdc`
- Tokens: `src/styles/tokens.css`
- Threat model (privacy claims): `docs/security/threat-model.md`
