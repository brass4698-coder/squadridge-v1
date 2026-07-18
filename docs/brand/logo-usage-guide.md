# Logo Usage Guide

## Overview

The SquadRidge mark shows three figures meeting at a stone ridge under a protective circle —
facilitator-led dialogue that stays inside a governed room. Avoid flags, weapons, or militarized
iconography.

## Assets

| File | Use |
|------|-----|
| `/assets/squadridge-icon.svg` | App icon, favicon, compact chrome |
| `/assets/logo.png` | Raster fallback / pitch-deck mark |
| `/assets/squadridge-wordmark.svg` | Export wordmark (name + tagline) |
| `/assets/squadridge-lockup.svg` | Icon + wordmark for decks, print, press |
| `SquadLogo` / `SquadRidgeLockup` | In-product React components |

## Colors

* **Brand teal** (`--sr-brand-mark` / `#01696F`): icon stroke and export wordmark ink
* **Ridge stone** (`--sr-brand-ridge` / `#8E7A68`): bridge/footing fills
* In UI chrome, wordmark text uses theme `text-ink` so it stays legible on dark and light shells

## Placement

* **Nav / sidebar / public header**: icon + “SquadRidge” (`SquadRidgeLockup`, `size="sm"`)
* **Sign-in / hero brand moments**: lockup with tagline “Facilitator Led Rooms”
* **Favicon / PWA**: icon SVG + PNG sizes from the same source
* **Pitch decks**: `/assets/logo.png` mark; keep deck wordmark contrast appropriate for the slide background

## Minimum size & clear space

* Digital mark: ≥ 28px height in chrome; ≥ 32px where it is the sole brand signal
* Clear space around the mark ≈ half the icon diameter

## Prohibited uses

* Do not distort proportions, recolor the mark ad hoc, or add drop shadows / glow
* Do not place the colored mark on busy photography without a calm surface behind it
* Do not swap in flags or militaristic symbols
