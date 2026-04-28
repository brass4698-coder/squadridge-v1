import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureSquadMessageKey, importSquadMessageKey } from './squadMessageKey';
import { generateSquadMessageKeyBase64Url } from './messageCrypto';

describe('squadMessageKey', () => {
  it('imports null when key missing', async () => {
    await expect(importSquadMessageKey(null)).resolves.toBeNull();
  });

  it('ensureSquadMessageKey uses existing key without round-tripping', async () => {
    const gen = generateSquadMessageKeyBase64Url();
    const supabase = { from: vi.fn(), rpc: vi.fn() };
    const out = await ensureSquadMessageKey(supabase as unknown as SupabaseClient, 's1', {
      message_encryption_key: gen,
    });
    expect(out.keyBase64).toBe(gen);
    expect(supabase.from).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('ensureSquadMessageKey calls get_or_create_squad_message_key RPC when missing', async () => {
    const generated = generateSquadMessageKeyBase64Url();
    const rpc = vi.fn().mockResolvedValue({ data: generated, error: null });
    const supabase = { from: vi.fn(), rpc };
    const out = await ensureSquadMessageKey(supabase as unknown as SupabaseClient, 'squad-x', {
      message_encryption_key: null,
    });
    expect(out.keyBase64).toBe(generated);
    expect(rpc).toHaveBeenCalledWith('get_or_create_squad_message_key', {
      p_squad_id: 'squad-x',
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('ensureSquadMessageKey treats an empty-string key as missing and routes to the RPC', async () => {
    const generated = generateSquadMessageKeyBase64Url();
    const rpc = vi.fn().mockResolvedValue({ data: generated, error: null });
    const supabase = { from: vi.fn(), rpc };
    const out = await ensureSquadMessageKey(supabase as unknown as SupabaseClient, 'squad-y', {
      message_encryption_key: '',
    });
    expect(out.keyBase64).toBe(generated);
    expect(rpc).toHaveBeenCalledWith('get_or_create_squad_message_key', {
      p_squad_id: 'squad-y',
    });
  });

  it('ensureSquadMessageKey surfaces RPC errors', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'not authorized', code: '42501' } });
    const supabase = { from: vi.fn(), rpc };
    await expect(
      ensureSquadMessageKey(supabase as unknown as SupabaseClient, 'squad-x', {
        message_encryption_key: null,
      }),
    ).rejects.toMatchObject({ message: 'not authorized' });
  });

  it('ensureSquadMessageKey rejects empty RPC response', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: '', error: null });
    const supabase = { from: vi.fn(), rpc };
    await expect(
      ensureSquadMessageKey(supabase as unknown as SupabaseClient, 'squad-x', {
        message_encryption_key: null,
      }),
    ).rejects.toThrow(/no key/i);
  });
});
