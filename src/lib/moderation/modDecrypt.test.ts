import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { bytesToBase64Url } from '../crypto/messageCrypto';
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

  it('records audit then returns plaintext for v1 payload via live key', async () => {
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
    expect(result.resolvedKeySource).toBe('live');
  });

  it('uses the message epoch key when key_epoch_id is present', async () => {
    const epochKey = bytesToBase64Url(new Uint8Array(32).fill(7));
    const liveKey = bytesToBase64Url(new Uint8Array(32).fill(9));
    const rpc = vi.fn().mockResolvedValue({ data: undefined, error: null });
    const from = vi.fn().mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: { encryption_key: epochKey, encryption_key_purged_at: null },
              error: null,
            }),
        }),
      }),
    });
    const supabase = { rpc, from } as unknown as SupabaseClient<Database>;

    const result = await moderatorDecryptMessageForReview(supabase, {
      messageId: 'mid',
      squadId: 'sid',
      payloadCiphertext: JSON.stringify({ v: 1, body: 'old epoch body' }),
      squadMessageKeyBase64Url: liveKey,
      keyEpochId: 'epoch-uuid-1',
      justification: 'legitimate moderator review requirement',
    });

    expect(from).toHaveBeenCalledWith('squad_key_epochs');
    expect(result.plaintext).toBe('old epoch body');
    expect(result.resolvedKeySource).toBe('epoch');
  });

  it('falls back to archived snapshot when epoch key has been purged', async () => {
    const archivedKey = bytesToBase64Url(new Uint8Array(32).fill(5));
    const liveKey = bytesToBase64Url(new Uint8Array(32).fill(9));
    const rpc = vi.fn().mockResolvedValue({ data: undefined, error: null });
    const from = vi.fn().mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: { encryption_key: null, encryption_key_purged_at: '2026-05-10T00:00:00Z' },
              error: null,
            }),
        }),
      }),
    });
    const supabase = { rpc, from } as unknown as SupabaseClient<Database>;

    const result = await moderatorDecryptMessageForReview(supabase, {
      messageId: 'mid',
      squadId: 'sid',
      payloadCiphertext: JSON.stringify({ v: 1, body: 'archived body' }),
      squadMessageKeyBase64Url: liveKey,
      keyEpochId: 'epoch-uuid-1',
      archivedKeySnapshotBase64Url: archivedKey,
      justification: 'legitimate moderator review requirement',
    });

    expect(result.plaintext).toBe('archived body');
    expect(result.resolvedKeySource).toBe('archive');
  });
});
