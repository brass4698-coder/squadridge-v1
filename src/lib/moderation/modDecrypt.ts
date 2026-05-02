import type { SupabaseClient } from '@supabase/supabase-js';
import { importAes256GcmKeyFromBase64Url } from '../crypto/messageCrypto';
import { decodeMessagePayloadAdaptive } from '../crypto/messagePayload';
import type { Database } from '../database.types';

/**
 * Writes an audited row (no plaintext persisted), then decrypts client-side
 * using the squad key from the **right epoch**. If the message carries a
 * `key_epoch_id`, we fetch that epoch's `encryption_key` from
 * `squad_key_epochs` (RLS allows moderators to SELECT). When missing or
 * purged (Track B), we fall back to:
 *   1. `squads.archived_encryption_key_snapshot` (set on archive),
 *   2. the live `squads.message_encryption_key` (current epoch).
 *
 * If neither path yields material, we throw rather than ever decrypting with
 * the wrong key — silently returning garbled plaintext would let a moderator
 * inadvertently mark "reviewed" without actually reading the message.
 */
export async function moderatorDecryptMessageForReview(
  supabase: SupabaseClient<Database>,
  params: {
    messageId: string;
    squadId: string;
    payloadCiphertext: string;
    /** Live squads.message_encryption_key — the current-epoch fast path. */
    squadMessageKeyBase64Url: string;
    /** messages.key_epoch_id; null for legacy rows pre-dating epoch tagging. */
    keyEpochId?: string | null;
    /** squads.archived_encryption_key_snapshot, set when the squad is archived. */
    archivedKeySnapshotBase64Url?: string | null;
    justification: string;
  },
): Promise<{ plaintext: string; resolvedKeySource: 'epoch' | 'archive' | 'live' }> {
  const just = params.justification.trim();
  if (just.length < 8) {
    throw new Error('Enter at least 8 characters explaining why decryption is necessary.');
  }

  const { error: rpcError } = await supabase.rpc('moderator_record_decrypt_audit', {
    p_message_id: params.messageId,
    p_justification: just,
  });
  if (rpcError) {
    throw new Error(rpcError.message);
  }

  let keyMaterial: string | null = null;
  let resolvedKeySource: 'epoch' | 'archive' | 'live' = 'live';

  if (params.keyEpochId) {
    const { data: epochRow, error: epochErr } = await supabase
      .from('squad_key_epochs')
      .select('encryption_key, encryption_key_purged_at')
      .eq('id', params.keyEpochId)
      .maybeSingle();
    if (epochErr) {
      throw new Error(`Could not load epoch key: ${epochErr.message}`);
    }
    if (epochRow?.encryption_key) {
      keyMaterial = epochRow.encryption_key;
      resolvedKeySource = 'epoch';
    }
  }

  if (!keyMaterial && params.archivedKeySnapshotBase64Url) {
    keyMaterial = params.archivedKeySnapshotBase64Url;
    resolvedKeySource = 'archive';
  }
  if (!keyMaterial) {
    keyMaterial = params.squadMessageKeyBase64Url;
    resolvedKeySource = 'live';
  }

  if (!keyMaterial) {
    throw new Error('No squad encryption key — message cannot be decrypted.');
  }

  const key = await importAes256GcmKeyFromBase64Url(keyMaterial);
  void params.squadId;
  const plaintext = await decodeMessagePayloadAdaptive(params.payloadCiphertext, key);
  return { plaintext, resolvedKeySource };
}
