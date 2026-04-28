import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Obtain a transfer code while signed in as the anonymous/demo user.
 * Verified sign-in completes the hand-off with {@link finalizeDemoSessionClaim}.
 */
export async function createDemoSessionClaim(supabase: SupabaseClient<Database>): Promise<string> {
  const { data, error } = await supabase.rpc('create_demo_session_claim');
  if (error) throw error;
  return data;
}

/** Apply a claim code after verifying — migrates squad_members rows where there is no conflict. */
export async function finalizeDemoSessionClaim(
  supabase: SupabaseClient<Database>,
  claimCode: string,
): Promise<{ ok: boolean; migrated_memberships?: number }> {
  const { data, error } = await supabase.rpc('finalize_demo_session_claim', {
    p_claim_code: claimCode.trim(),
  });
  if (error) throw error;
  const row = data as Record<string, unknown>;
  const n = row.migrated_memberships;
  return {
    ok: row.ok === true,
    migrated_memberships: typeof n === 'number' ? n : Number(n),
  };
}
