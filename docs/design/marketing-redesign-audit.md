# Marketing redesign audit (2026-07)

> **Archive / historical.** Decisions below are locked into the live system; do not treat this file as the source of truth. Canonical: [`institutional-visual-system.md`](./institutional-visual-system.md), [`squadridge-trust-ui-kit.md`](./squadridge-trust-ui-kit.md).

Living guide for the institutional marketing surface redesign. Complements
[`institutional-visual-system.md`](institutional-visual-system.md) and
[`full-site-visual-direction.md`](full-site-visual-direction.md).

## Problems found

1. **Hero composition** — Home hero was center-aligned SaaS; docs require editorial left alignment.
2. **Repetitive section kit** — Most pages: `MarketingSection` + uppercase label + `text-h2` + equal card grids.
3. **Trust as feature grid** — Four equal tiles undersold the architectural room / gate / record boundary.
4. **Token drift** — Tailwind hard-coded `ink` colors; institutional theme did not fully paint `text-ink`.
5. **Width / spacing dual systems** — `max-w-6xl` vs `1200px` shell tokens; ad-hoc hero clamps vs `--sr-text-display`.
6. **System model under-emphasized** — Strong component competed with weaker surrounding chrome.
7. **Footer / nav** — Flat link dump; weak mobile nav; primary CTA less intentional than needed.

## Locked decisions

- Institutional **dark graphite** + muted mineral teal remains marketing primary.
- Left-aligned editorial default; asymmetry for room → gate → record.
- One accent; `.btn-institutional`; no glow gradients or icon-circle feature grids.
- Scope: PublicShell marketing/legal pages + shared primitives. Authenticated app: token inheritance only.

## Page targets

| Page | Visual priority |
|------|-----------------|
| Home | Left hero + dominant system model + trust boundary (not 4-up grid) |
| How it works | Process diagram, procedural density |
| Use cases | Case-file rows / editorial list |
| Security | Boundary schematic + documented limits first |
| Ledger | Archival index + citable record |
| About | Threshold + mission without startup fluff |
| FAQ | Dense accordion, shared slim hero |
| Request access | Split process + form; high-trust intake |
| Contact / legal | Prose measure + clear H2 hierarchy |

## Opinionated composition pass (follow-up)

Weak patterns removed deliberately:

- Homepage FAQ and TrustBar strip (redundant with System Model + Security)
- How-it-works duplicate lifecycle / workflow / “inside the room” stacks
- Security 2-column safeguard feature grid; limits now lead the page
- Use-cases equal card stack → flagship + expandable index
- Request-access hero + fit + form trilogy → single sticky intake composition
- Ledger MarketingPageHero kit → archive title bar + docket
- FAQ / About decorative EvaluatorPath and schematic fillers
