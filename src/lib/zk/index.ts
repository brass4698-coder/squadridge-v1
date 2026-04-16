import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { isZkVerifierStubEnabled } from '../env';
import { runVerification, ZK_SESSION_CREDENTIAL_TYPE } from '../zkAdapter';

export { runVerification, ZK_SESSION_CREDENTIAL_TYPE } from '../zkAdapter';
export type { ZKProof, CredentialType } from '../zkVerifier';

/**
 * Runs environment-aware verification and (in production) persists via `zk-verify`.
 * In dev stub mode, uses local `generateProof` only — no Edge Function.
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
  if (!isZkVerifierStubEnabled()) {
    throw new Error('ZK stub is disabled (set VITE_ZK_STUB to use the dev path).');
  }
  void _userId;
  await submitVerifiedZkProof(supabase, attributeScope);
}
