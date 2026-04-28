import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { bytesToBase64Url } from '../messageCrypto';
import { moderatorDecryptMessageForReview } from './modDecrypt';
import type { Database } from '../database.types';

describe('moderatorDecryptMessageForReview', () => {
  it('rejects short justification without calling RPC', async () => {
    const rpc = vi.fn();
    const supabase = { rpc } as unknown as SupabaseClient<Database>;
    await expect(
      moderatorDecryptMessageForReview(supabase, {
        messageId: 'm',
        squadId: 's',
        payloadCiphertext: '{}',
        squadMessageKeyBase64Url: bytesToBase64Url(new Uint8Array(32).fill(1)),
        justification: 'short',
      }),
    ).rejects.toThrow(/8 characters/i);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('records audit then returns plaintext for v1 payload', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: undefined, error: null });
    const supabase = { rpc } as unknown as SupabaseClient<Database>;
    const key = bytesToBase64Url(new Uint8Array(32).fill(9));
    const result = await moderatorDecryptMessageForReview(supabase, {
      messageId: 'mid',
      squadId: 'sid',
      payloadCiphertext: JSON.stringify({ v: 1, body: 'plain body' }),
      squadMessageKeyBase64Url: key,
      justification: 'legitimate moderator review requirement',
    });
    expect(rpc).toHaveBeenCalledWith('moderator_record_decrypt_audit', {
      p_message_id: 'mid',
      p_justification: 'legitimate moderator review requirement',
    });
    expect(result.plaintext).toBe('plain body');
  });
});
