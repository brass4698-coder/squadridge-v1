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

## Matching / queue (RPC and tables)

- Matchmaking uses database RPCs and Realtime on queue tables (see `src/lib/matchmakingClient.ts`, `pollMatchmakingSnapshot`). Document new RPCs here when added: parameters, stable error codes, and idempotency expectations.
