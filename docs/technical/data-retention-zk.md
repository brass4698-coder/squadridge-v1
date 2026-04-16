# Data retention and logging (ZK verification)

See also the **[operational threat model](../security/threat-model.md)** for trust boundaries and pre-deployment gates.

## What we store

- **`zk_proof_submissions`**: `proof_commitment` (hash of proof material + scope), `nullifier_hash` (unique, double-spend prevention), `attribute_scope`, and `user_id` (pseudonymous app account only). No raw documents, national IDs, or free-text PII from verification.
- **`verified_attributes`**: Coarse labels derived from verified scope (e.g. region bucket), updated by the same server path that inserts proof rows—not from onboarding forms.

## Retention (policy)

- Treat proof rows as **security-sensitive**: apply the shortest retention that satisfies fraud prevention and legal obligations; document any longer retention with a named purpose.
- On account deletion (`auth.users` / `public.users` cascade), proof and attribute rows are removed with the user FK.
- **Revisit** whether `verified_attributes` should be truncated or generalized further for matching-only use cases.

## Logging and analytics

- **Edge Function `verify-zk-proof`**: Do not log full request bodies, proof bytes, or public signals in production. Prefer structured logs with outcome only (`ok`, `409`, `error_code`).
- **Avoid** storing or querying **IP address + user id + proof submission** in the same analytics pipeline without strict access control, retention limits, and a documented purpose. Supabase request logs may exist at the platform layer—restrict dashboard access and use organization policy for who may view them.
- **Client**: Do not send device fingerprint or marketing identifiers with verification calls.

## Operational access

- Limit **service role** key distribution; it bypasses RLS. Edge Functions should be the only component using it for `zk_proof_submissions` / `verified_attributes` writes.

## Related code

- Server verifier: [`supabase/functions/verify-zk-proof/index.ts`](../../supabase/functions/verify-zk-proof/index.ts)
- Client (no direct table writes): [`src/lib/zk/index.ts`](../../src/lib/zk/index.ts)
