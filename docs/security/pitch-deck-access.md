# Pitch deck access control

## Problem

Until May 2026 every pitch deck under `public/pitch-deck-hub/` was a plain
static asset. The hub UI carried a `DeckStatus = 'external_ready'` flag and
a "readiness checklist", but neither boundary was enforced — anyone with a
URL guess could fetch the financial appendix, the technical-security deck,
or the embedded model JS that leaks the raise amount and monthly cash.

## Model

Two tiers, both gated:

- **`shareable`** — the moderator can mint a 7-day signed link for an
  external recipient. Reserved for decks whose `DeckStatus === 'external_ready'`
  AND whose deck id is not on the always-moderator-only list.
- **`moderator-only`** — viewable only through a moderator session, or a
  transient 30-second self-token minted from the hub. Never produces a
  share URL. Always-moderator-only assets are hard-coded so a future
  status change cannot accidentally promote them:
  - `financial-appendix`, `business-pricing`, `appendix-faq`
  - `investor-deck-model.json`, `investor-deck-model.embed.js`

The single source of truth is
[`src/pitch-deck-hub/deckAccessTiers.ts`](../../src/pitch-deck-hub/deckAccessTiers.ts).
The Edge mirror in
[`supabase/functions/_shared/deckAccessTiers.ts`](../../supabase/functions/_shared/deckAccessTiers.ts)
must stay in sync — a vitest parity test enforces that.

## Components

| Surface | Where | Role |
| --- | --- | --- |
| Hub UI | [`src/pages/PitchDeckHubPage.tsx`](../../src/pages/PitchDeckHubPage.tsx) | Shows the Lock / Shareable badge per deck; "View deck" routes through the gated viewer; "Copy share link (7d)" mints a share token via the Edge Function. |
| Viewer redirect | [`src/pages/admin/DeckViewerRedirectPage.tsx`](../../src/pages/admin/DeckViewerRedirectPage.tsx) | Mints a 30s self-token then `window.location.replace`s to `serve-pitch-deck`. Behind `RequireAuth + RequireModerator`. |
| Mint endpoint | [`supabase/functions/mint-deck-share/`](../../supabase/functions/mint-deck-share/index.ts) | Validates the caller's moderator role, applies tier rules, signs the JWT, persists `share` audience tokens to `pitch_deck_shares`. |
| Serve endpoint | [`supabase/functions/serve-pitch-deck/`](../../supabase/functions/serve-pitch-deck/index.ts) | Validates token (or moderator session), reads bundled HTML, inlines the financial model script, injects `<base href>` + `noindex`, returns the deck. |
| Audit table | [`supabase/migrations/20260502190000_pitch_deck_shares.sql`](../../supabase/migrations/20260502190000_pitch_deck_shares.sql) | Records every minted share token (jti, deck_id, minted_by, expires_at, revoked_at). Self-tokens are NOT persisted. |

## Token format

HMAC-SHA-256 signed JWT with claims:

```
{ deckId, aud: 'self' | 'share', exp, iat, jti, mintedBy }
```

Signed with `DECK_SHARE_SIGNING_SECRET` (≥32 chars, deployed via Supabase
secrets — see [supabase/README.md](../../supabase/README.md)). The secret is
**not** the Supabase JWT secret: blast radius of a leak is limited to deck
tokens, and rotation requires no application sign-in churn.

## Operational guidance

- **Rotate `DECK_SHARE_SIGNING_SECRET`** when a moderator account is
  compromised or a share link is suspected to have leaked. Rotation
  invalidates every outstanding share URL — coordinate before flipping.
- **Revoke a single share** by `UPDATE public.pitch_deck_shares SET
  revoked_at = now() WHERE jti = '<jti>';`. The `serve-pitch-deck`
  function checks revocation on every fetch.
- **Inspect active shares** via `SELECT deck_id, minted_by, created_at,
  expires_at FROM public.pitch_deck_shares WHERE revoked_at IS NULL AND
  expires_at > now() ORDER BY created_at DESC;` (moderator role required).
- **Promote a deck to shareable** by editing it to `external_ready` in the
  hub, then minting via the kebab menu. Decks on the always-moderator-only
  list ignore the status flip and remain ungated for share-URL minting.

## What's NOT in scope here

- **Per-share view tracking / one-time tokens.** The schema includes a
  `jti` so this can be added without migration churn — emit a `share_view`
  audit row in `serve-pitch-deck` when ready.
- **A public-safe model variant.** Once the financial figures are deemed
  safe to publish, generate a separate JSON without the raise amount and
  point public investor decks at it; remove the always-moderator-only
  asset entries for the public version.
- **Rate-limiting share-link mints.** Moderators are trusted; if abuse
  surfaces add a per-user quota in `mint-deck-share` and surface it in
  the hub.
