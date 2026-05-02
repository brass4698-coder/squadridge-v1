/**
 * Pure request-shape guards for the verify-zk-proof / zk-verify Edge handlers.
 *
 * Kept dependency-free (no Deno globals, no esm.sh URLs) so it can be unit
 * tested under Vitest alongside the rest of the codebase.
 */

/**
 * Defense in depth: the Edge verifier MUST never accept a stub-flavoured
 * payload, even though the documented `ZkVerifyRequestBody` type does not
 * declare an `is_stub` / `isStub` field. A future client regression that
 * starts forwarding the field should fail closed at the trust boundary.
 *
 * Throws an `Error('is_stub flag is not accepted')` when either casing of the
 * flag is truthy on the request body. Callers map the message through
 * `zkErrorCodeForMessage` to a stable `INVALID_REQUEST` code.
 */
export function assertNoStubFlags(body: unknown): void {
  if (typeof body !== 'object' || body === null) return;
  const rec = body as Record<string, unknown>;
  if (rec.is_stub === true || rec.isStub === true) {
    throw new Error('is_stub flag is not accepted');
  }
}
