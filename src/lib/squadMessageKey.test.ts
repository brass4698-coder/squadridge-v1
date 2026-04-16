import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureSquadMessageKey, importSquadMessageKey } from './squadMessageKey';
import { generateSquadMessageKeyBase64Url } from './messageCrypto';

describe('squadMessageKey', () => {
  it('imports null when key missing', async () => {
    await expect(importSquadMessageKey(null)).resolves.toBeNull();
  });

  it('ensureSquadMessageKey uses existing key without updating', async () => {
    const gen = generateSquadMessageKeyBase64Url();
    const supabase = { from: vi.fn() };
    const out = await ensureSquadMessageKey(supabase as unknown as SupabaseClient, 's1', {
      message_encryption_key: gen,
    });
    expect(out.keyBase64).toBe(gen);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('ensureSquadMessageKey generates and persists when missing', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    const supabase = {
      from: vi.fn(() => ({ update })),
    };
    const out = await ensureSquadMessageKey(supabase as unknown as SupabaseClient, 'squad-x', {
      message_encryption_key: null,
    });
    expect(out.keyBase64.length).toBeGreaterThan(10);
    expect(supabase.from).toHaveBeenCalledWith('squads');
    expect(update).toHaveBeenCalledWith({ message_encryption_key: out.keyBase64 });
    expect(eq).toHaveBeenCalledWith('id', 'squad-x');
  });
});
