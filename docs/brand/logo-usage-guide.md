# Logo Usage Guide

## Overview

The SquadRidge mark is a **split diamond vault** — a geometric diamond divided down the center.
It signals protected deliberation without figurative people, flags, or militarized iconography.

## Assets

| File | Use |
|------|-----|
| `/assets/squadridge-icon.svg` | App icon, favicon (SVG), compact chrome — **preferred** |
| `/assets/squadridge-mark.png` | Raster symbolic mark (transparent) |
| `/assets/squadridge-wordmark.svg` | Export wordmark (SQUAD/RIDGE + tagline) |
| `/assets/squadridge-wordmark-lockup.png` | Raster full lockup (mark + wordmark + tagline; dark-friendly) |
| `/assets/squadridge-lockup.svg` | Icon + wordmark for decks, print, press |
| `/assets/squadridge.svg` | Name-only wordmark for pitch-deck slides |
| `/assets/logo.png` | Square raster mark (decks / PWA-adjacent) |
| `SquadLogo` / `SquadRidgeLockup` | In-product React components |

## Colors

* **Brand teal** (`--sr-brand-mark` / `#01696F`, institutional `#0E5E63`): diamond fill; **SQUAD**
* **Ridge stone** (`--sr-brand-ridge` / `#8E7A68`): **RIDGE** and export tagline
* In UI chrome, the tagline uses theme `text-ink-secondary` so it stays legible on dark and light shells

## Tagline

**Private Deliberation Infrastructure** — use with the lockup on sign-in / hero brand moments
(`showTagline`). Compact nav may omit the tagline.

## Placement

* **Nav / sidebar / public header**: icon + two-tone “SQUADRIDGE” (`SquadRidgeLockup`, `size="sm"`)
* **Sign-in / hero brand moments**: lockup with tagline
* **Favicon / PWA**: icon SVG + PNG sizes derived from the symbolic mark
* **Pitch decks**: `/assets/logo.png` mark + `/assets/squadridge.svg` wordmark

## Minimum size & clear space

* Digital mark: ≥ 28px height in chrome; ≥ 32px where it is the sole brand signal
* Clear space around the mark ≈ half the icon diameter

## Prohibited uses

* Do not distort proportions, recolor the mark ad hoc, or add drop shadows / glow
* Do not place the colored mark on busy photography without a calm surface behind it
* Do not use the retired people-on-ridge figures as the primary brand mark
* Do not swap in flags or militaristic symbols
