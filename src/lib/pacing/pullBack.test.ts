import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../env', () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock('../../utils/supabase', () => ({
  supabase: {
    functions: { invoke: vi.fn() },
    from: vi.fn(),
  },
}));

import { pullBackMessage } from './pullBack';

describe('pullBackMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects empty message id', async () => {
    const result = await pullBackMessage('  ');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid');
  });

  it('succeeds locally when supabase is not configured', async () => {
    const result = await pullBackMessage('msg-1');
    expect(result).toEqual({ ok: true });
  });
});
