import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { addZkProofBreadcrumb } from './sentry';
import type { CredentialType, ZKProof } from './zkVerifier';

/** When true, uses fast hash-only stubs (no Semaphore, no Edge verification). */
const USE_HASH_STUB = import.meta.env.VITE_ZK_STUB === 'true';

/** Same credential kind as Semaphore `scope` preimage (must match Edge `credential_type`). */
export const ZK_SESSION_CREDENTIAL_TYPE = 'session_attribute';

export async function runVerification(
  supabase: SupabaseClient<Database>,
  credentialType: CredentialType,
  rawInput: string,
): Promise<ZKProof> {
  if (USE_HASH_STUB) {
    addZkProofBreadcrumb('stub_hash', 'start', { credentialType });
    try {
      const { generateStubProof } = await import('./zkVerifier');
      const proof = await generateStubProof(credentialType, rawInput);
      addZkProofBreadcrumb('stub_hash', 'success', { credentialType });
      return proof;
    } catch (e) {
      addZkProofBreadcrumb('stub_hash', 'error', {
        credentialType,
        message: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }

  addZkProofBreadcrumb('generate_local', 'start', { credentialType });
  const { generateSemaphoreProof } = await import('./zkVerifier');
  const { semaphoreProofToWireFormat } = await import('./zk/serializeSemaphoreProof');
  let semaphoreProof;
  try {
    const rawProof = await generateSemaphoreProof(credentialType, rawInput.trim());
    semaphoreProof = semaphoreProofToWireFormat(rawProof);
    addZkProofBreadcrumb('generate_local', 'success', { credentialType });
  } catch (e) {
    addZkProofBreadcrumb('generate_local', 'error', {
      credentialType,
      message: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }

  addZkProofBreadcrumb('invoke_verify_edge', 'start', { credentialType });
  const { data, error } = await supabase.functions.invoke('verify-zk-proof', {
    body: {
      attribute_scope: rawInput.trim(),
      credential_type: credentialType,
      semaphore_proof: semaphoreProof,
    },
  });

  if (error) {
    addZkProofBreadcrumb('invoke_verify_edge', 'error', { credentialType, message: error.message });
    throw new Error(`Verification failed: ${error.message}`);
  }
  if (
    data &&
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    (data as { error?: string }).error
  ) {
    addZkProofBreadcrumb('invoke_verify_edge', 'error', {
      credentialType,
      message: String((data as { error: string }).error),
    });
    throw new Error(String((data as { error: string }).error));
  }

  addZkProofBreadcrumb('invoke_verify_edge', 'success', { credentialType });
  return data as ZKProof;
}
