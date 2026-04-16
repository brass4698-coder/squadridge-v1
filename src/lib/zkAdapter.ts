import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { CredentialType, ZKProof } from './zkVerifier';

const IS_DEV_STUB =
  import.meta.env.VITE_ZK_STUB === 'true' || import.meta.env.DEV === true;

/** Same credential kind as `zk-verify` / `generateProof` preimage. */
export const ZK_SESSION_CREDENTIAL_TYPE = 'session_attribute';

/**
 * Environment-aware verification: local `generateProof` in dev stub mode, otherwise `zk-verify` Edge Function.
 */
export async function runVerification(
  supabase: SupabaseClient<Database>,
  credentialType: CredentialType,
  rawInput: string,
): Promise<ZKProof> {
  if (IS_DEV_STUB) {
    const { generateProof } = await import('./zkVerifier');
    return generateProof(credentialType, rawInput);
  }

  const { data, error } = await supabase.functions.invoke('zk-verify', {
    body: { credentialType, rawInput },
  });

  if (error) {
    throw new Error(`Verification failed: ${error.message}`);
  }
  if (data && typeof data === 'object' && data !== null && 'error' in data && (data as { error?: string }).error) {
    throw new Error(String((data as { error: string }).error));
  }
  return data as ZKProof;
}
