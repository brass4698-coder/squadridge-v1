# Cloudflare scaffold (non-production)

**Status:** Experimental stub only. SquadRidge production remains **Supabase + Vite (Vercel)**.

This folder sketches a future **phase 1** Worker that can fetch a public ledger artifact and verify a SHA-256 digest. It is **not** wired into CI, Vite, or deploy pipelines. Do not treat a local `wrangler dev` run as a live pilot surface.

## Why this exists

- Diligence alignment with [`docs/adr/006-cloudflare-workers-room-record.md`](../docs/adr/006-cloudflare-workers-room-record.md).
- A place for hash-verification types and a public-ledger fetch handler before any cutover.
- Explicit separation from `src/workers/` (browser Web Workers for crypto/translation).

## What is intentionally missing

- Durable Objects (room gate / pacing) — phase 2
- D1 identity mapping — phase 3
- Private R2 dialogue archive — phase 2
- Queues release assembly — phase 4
- Workers Assets frontend host — phase 5 (optional)
- Production `wrangler.toml`, secrets, or deploy scripts

## Local experiment (optional)

```bash
cp wrangler.toml.example wrangler.toml
# edit account_id / bucket bindings when you have a Cloudflare account
npx wrangler dev
```

Requires a Cloudflare account and Wrangler; neither is a repo dependency today.

## Honesty

- Operator-readable AES-GCM room keys in Postgres today ≠ DO-private dialogue.
- Public ledger integrity on the current stack is `outcome_records.ledger_sha` via Supabase — see Implementation Status `sha256_anchor`.
- Claim `cloudflare_room_do` stays **PLANNED** until phase 2 is verified in a real deploy.
