import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { isZkStubDevPathAllowed } from '../env';
import { runVerification, ZK_SESSION_CREDENTIAL_TYPE } from '../zkAdapter';

export { runVerification, ZK_SESSION_CREDENTIAL_TYPE } from '../zkAdapter';
export type { RunVerificationOptions, RunVerificationStage } from '../zkAdapter';
export type { ZKProof, CredentialType } from '../zkVerifier';

/**
 * Runs Semaphore proof generation + server verification via `verify-zk-proof`,
 * unless `VITE_ZK_STUB=true` (hash-only demo path).
 */
export async function submitVerifiedZkProof(
  supabase: SupabaseClient<Database>,
  attributeScope: string,
): Promise<void> {
  await runVerification(supabase, ZK_SESSION_CREDENTIAL_TYPE, attributeScope);
}

/**
 * Legacy dev entrypoint used by the onboarding ZK dev panel. Prefer {@link submitVerifiedZkProof}.
 */
export async function submitZkProofStub(
  supabase: SupabaseClient<Database>,
  _userId: string,
  attributeScope: string,
): Promise<void> {
  if (!isZkStubDevPathAllowed()) {
    throw new Error('ZK stub is disabled (set VITE_ZK_STUB to use the dev path).');
  }
  void _userId;
  await submitVerifiedZkProof(supabase, attributeScope);
}
