import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { importAes256GcmKeyFromBase64Url } from './messageCrypto';

type SquadRow = Database['public']['Tables']['squads']['Row'];

export async function importSquadMessageKey(keyBase64: string | null): Promise<CryptoKey | null> {
  if (!keyBase64 || keyBase64.length === 0) return null;
  return importAes256GcmKeyFromBase64Url(keyBase64);
}

/**
 * Returns the squad's AES-256-GCM key, generating one server-side if missing.
 *
 * Fast path: if the caller already has a non-empty `message_encryption_key` on the squad
 * row (e.g. from the realtime subscription or initial fetch), import it directly with no
 * server round-trip.
 *
 * Slow path: call the SECURITY DEFINER RPC `get_or_create_squad_message_key` (added in
 * migration 20260429120000), which row-locks the squad, authorises the caller as a member
 * or moderator, and returns the existing or newly-generated key. This replaces the
 * previous client-side `UPDATE squads SET message_encryption_key = …` that allowed two
 * concurrent callers to race and produce divergent keys.
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
