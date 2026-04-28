import type { SupabaseClient } from '@supabase/supabase-js';
import { importAes256GcmKeyFromBase64Url } from '../messageCrypto';
import { decodeMessagePayloadAdaptive } from '../messagePayload';
import type { Database } from '../database.types';

/**
 * Writes an audited row (no plaintext persisted), then decrypts client-side using the squad key.
 */
export async function moderatorDecryptMessageForReview(
  supabase: SupabaseClient<Database>,
  params: {
    messageId: string;
    squadId: string;
    payloadCiphertext: string;
    squadMessageKeyBase64Url: string;
    justification: string;
  },
): Promise<{ plaintext: string }> {
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

  const key = await importAes256GcmKeyFromBase64Url(params.squadMessageKeyBase64Url);
  void params.squadId; // reserved if future server verifies squad match
  const plaintext = await decodeMessagePayloadAdaptive(params.payloadCiphertext, key);
  return { plaintext };
}
