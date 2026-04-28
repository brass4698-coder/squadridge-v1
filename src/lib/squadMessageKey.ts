import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { importAes256GcmKeyFromBase64Url } from './messageCrypto';

type SquadRow = Database['public']['Tables']['squads']['Row'];

export async function importSquadMessageKey(keyBase64: string | null): Promise<CryptoKey | null> {
  if (!keyBase64 || keyBase64.length === 0) return null;
  return importAes256GcmKeyFromBase64Url(keyBase64);
}

/**
 * Resolves a squad's message encryption key for client decryption / encryption.
 *
 * Key custody is fully server-side (audit Phase 0.2). Three layers cooperate:
 *
 *   1. The `BEFORE INSERT` trigger `squads_set_default_message_encryption_key`
 *      (migration `20260417150000`) generates a 32-byte AES key via
 *      `pgcrypto.gen_random_bytes` for every new `squads` row and back-fills
 *      historical NULLs. This is the common path.
 *   2. Migration `20260428210000_rotate_pre_trigger_demo_squad_keys` rotates
 *      demo squads created before the trigger so no key persisted in
 *      production traces back to an unaudited client-side CSPRNG.
 *   3. The RPC `get_or_create_squad_message_key` (migration `20260429120000`)
 *      is the slow path: row-locks the squad, authorises the caller as a
 *      member or moderator, and returns the existing or newly-generated key.
 *      Replaces the previous client-side `UPDATE squads SET ...` race.
 *
 * Fast path: if the caller already has a non-empty `message_encryption_key`
 * on the squad row (e.g. from the realtime subscription or initial fetch),
 * import it directly with no server round-trip.
 *
 * Slow path: call the RPC. We never fabricate a key client-side — that would
 * put unaudited key material into the operator's database and is exactly
 * what the audit forbade.
 */
export async function ensureSquadMessageKey(
  supabase: SupabaseClient<Database>,
  squadId: string,
  squad: Pick<SquadRow, 'message_encryption_key'> | null,
): Promise<{ key: CryptoKey; keyBase64: string }> {
  if (squad?.message_encryption_key) {
    const key = await importAes256GcmKeyFromBase64Url(squad.message_encryption_key);
    return { key, keyBase64: squad.message_encryption_key };
  }
  const { data, error } = await supabase.rpc('get_or_create_squad_message_key', {
    p_squad_id: squadId,
  });
  if (error) throw error;
  if (typeof data !== 'string' || data.length === 0) {
    throw new Error('get_or_create_squad_message_key returned no key');
  }
  const key = await importAes256GcmKeyFromBase64Url(data);
  return { key, keyBase64: data };
}
