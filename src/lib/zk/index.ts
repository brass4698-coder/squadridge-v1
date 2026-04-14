import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { isZkVerifierStubEnabled } from '../env';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Development stub: stores a proof *commitment* hash only (no raw PII).
 * Replace with Semaphore proof verification against your verifier service.
 */
export async function submitZkProofStub(
  supabase: SupabaseClient<Database>,
  userId: string,
  attributeScope: string,
): Promise<void> {
  if (!isZkVerifierStubEnabled()) {
    throw new Error('ZK stub is disabled (set VITE_ZK_STUB to use the dev path).');
  }

  const commitment = await sha256Hex(`${userId}:${attributeScope}:${crypto.randomUUID()}`);

  const { error: proofError } = await supabase.from('zk_proof_submissions').insert({
    user_id: userId,
    proof_commitment: commitment,
    attribute_scope: attributeScope,
  });
  if (proofError) throw proofError;

  const { error: attrError } = await supabase.from('verified_attributes').upsert(
    {
      user_id: userId,
      attribute_type: 'citizenship',
      attribute_value: 'demo_region',
    },
    { onConflict: 'user_id,attribute_type' },
  );
  if (attrError) throw attrError;
}
