import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { generateSquadMessageKeyBase64Url, importAes256GcmKeyFromBase64Url } from './messageCrypto';

type SquadRow = Database['public']['Tables']['squads']['Row'];

export async function importSquadMessageKey(keyBase64: string | null): Promise<CryptoKey | null> {
  if (!keyBase64 || keyBase64.length === 0) return null;
  return importAes256GcmKeyFromBase64Url(keyBase64);
}

/**
 * Ensures the squad row has a message encryption key; generates and persists one if missing.
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
  const keyBase64 = generateSquadMessageKeyBase64Url();
  const { error } = await supabase.from('squads').update({ message_encryption_key: keyBase64 }).eq('id', squadId);
  if (error) throw error;
  const key = await importAes256GcmKeyFromBase64Url(keyBase64);
  return { key, keyBase64 };
}
