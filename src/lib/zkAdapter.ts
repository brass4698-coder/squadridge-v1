import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { CredentialType, ZKProof } from './zkVerifier';

/** When true, uses fast hash-only stubs (no Semaphore, no Edge verification). */
const USE_HASH_STUB = import.meta.env.VITE_ZK_STUB === 'true';

/** Same credential kind as Semaphore `scope` preimage (must match Edge `credential_type`). */
export const ZK_SESSION_CREDENTIAL_TYPE = 'session_attribute';

/**
 * Generates a Semaphore proof in-browser and verifies it via `verify-zk-proof`,
 * unless `VITE_ZK_STUB=true` (hash-only demo path).
 */
export async function runVerification(
  supabase: SupabaseClient<Database>,
  credentialType: CredentialType,
  rawInput: string,
): Promise<ZKProof> {
  if (USE_HASH_STUB) {
    const { generateStubProof } = await import('./zkVerifier');
    return generateStubProof(credentialType, rawInput);
  }

  const { generateSemaphoreProof } = await import('./zkVerifier');
  const semaphoreProof = await generateSemaphoreProof(credentialType, rawInput.trim());

  const { data, error } = await supabase.functions.invoke('verify-zk-proof', {
    body: {
      attribute_scope: rawInput.trim(),
      credential_type: credentialType,
      semaphore_proof: semaphoreProof,
    },
  });

  if (error) {
    throw new Error(`Verification failed: ${error.message}`);
  }
  if (data && typeof data === 'object' && data !== null && 'error' in data && (data as { error?: string }).error) {
    throw new Error(String((data as { error: string }).error));
  }

  return data as ZKProof;
}
