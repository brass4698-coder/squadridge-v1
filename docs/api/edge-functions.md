# Supabase Edge Functions (API notes)

Formal OpenAPI specs can be generated later; this document captures **intent**, auth, and example payloads for maintainers.

## `serve-deck`

- **Role:** Serve invite-only pitch briefing HTML/CSS/JS after JWT auth + `has_deck_access()`.
- **Client:** `src/lib/deckAssetFetch.ts` → `GET /functions/v1/serve-deck?path=<basename>` with user Bearer token.
- **Assets:** `supabase/functions/serve-deck/static/` (not Vite `public/`).
- **Errors:** `401 NOT_AUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `400 INVALID_PATH`.

## `verify-zk-proof`

- **Role:** Verify a Semaphore proof for a scoped attribute.
- **Client:** `src/lib/zkAdapter.ts` → `supabase.functions.invoke('verify-zk-proof', { body })`.
- **Example body (shape):**
  ```json
  {
    "attribute_scope": "string",
    "credential_type": "session_attribute",
    "semaphore_proof": {}
  }
  ```
- **Success:** Returns proof metadata expected by `ZKProof` consumers; errors surface as `error.message` or JSON `{ "error": "..." }`.

## Matching / queue (RPC and tables)

- Matchmaking uses database RPCs and Realtime on queue tables (see `src/lib/matchmakingClient.ts`, `pollMatchmakingSnapshot`). Document new RPCs here when added: parameters, stable error codes, and idempotency expectations.
