# Supabase Edge Functions (API notes)

Formal OpenAPI specs can be generated later; this document captures **intent**, auth, and example payloads for maintainers.

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

## `pull-back`

- **Role:** Idempotent retract of the caller’s own recent message (Power of Pause).
- **Client:** `src/lib/pacing/pullBack.ts` → `supabase.functions.invoke('pull-back', { body })`.
- **Body:** `{ "message_id": "<uuid>", "idempotency_key": "<optional string>" }`.
- **Success:** `{ "ok": true }` or `{ "ok": true, "already_retracted": true }` on safe retry.
- **Errors:** `400` invalid body, `401`/`403` auth, `404` missing, `409` window elapsed.
- **Privacy:** Never logs message content; intervention row is metadata-only (`pull_back_used`).

## Matching / queue (RPC and tables)

- Matchmaking uses database RPCs and Realtime on queue tables (see `src/lib/matchmakingClient.ts`, `pollMatchmakingSnapshot`). Document new RPCs here when added: parameters, stable error codes, and idempotency expectations.
