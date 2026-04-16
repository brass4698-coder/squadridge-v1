import type { SemaphoreProof } from '@semaphore-protocol/proof';

/**
 * `supabase.functions.invoke` JSON-serializes the body; Semaphore proofs may contain `bigint`
 * fields that are not JSON-safe. This normalizes the proof so the Edge `verifyProof` receives
 * the same numeric values as strings (as `@semaphore-protocol/proof` expects).
 */
export function semaphoreProofToWireFormat(proof: SemaphoreProof): SemaphoreProof {
  const json = JSON.stringify(proof, (_key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  });
  return JSON.parse(json) as SemaphoreProof;
}
