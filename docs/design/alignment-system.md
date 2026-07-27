# Marketing alignment system

SquadRidge public surfaces are **left-aligned by default**. Centering is a rare exception for short, high-level moments — never for explanation, trust, process, FAQ, forms, or evidence.

## Rules

1. **Default left** — nav, body, section intros with substance, trust/security, use cases, FAQ, ledger, forms, footer, product evidence.
2. **Center only when** all of:
   - ≤2 short lines of copy (or a single compact headline), and
   - no process/trust/evidence density, and
   - no bullets, cards, metadata rows, or forms.
3. **If a section has** >2 lines of body, multiple cards, process/trust copy, or labels+metadata → **must be left-aligned**.
4. **Containers** may be horizontally centered on the page (`mx-auto` shell width). That is not text centering. Content inside shells is `text-left`.
5. **Body measure** — use `--sr-measure-prose` / `--sr-measure-wide`; do not stretch paragraphs full-bleed.

## Utilities

| Class | Use |
|-------|-----|
| `sr-align-content` | Explicit left-aligned content stack |
| `sr-align-prose` | Left prose + max measure |
| `sr-align-cta` | Left CTA band (default) |
| `sr-align-cta-center` | Exception: short CTA only (headline ≤1 line, no long body) |

## Components

- `MarketingPageHero` — always left.
- `CTABlock` — default `align="left"`; `center` only for short headline-only bands.
- `FAQAccordion`, `TrustBoundaryBlock`, `RecordCard`, forms — always left.
- Stage connectors in splits may keep a compact centered glyph; labels stay left where readable.

## Mobile

Left alignment holds at all breakpoints. Do not center stacks on small screens “to look balanced.”
