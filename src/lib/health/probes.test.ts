import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../env', () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn() },
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

import { isSupabaseConfigured } from '../env';
import { runHealthProbes } from './probes';

describe('runHealthProbes', () => {
  beforeEach(() => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
  });

  it('reports env failure and skips dependent probes when unconfigured', async () => {
    const results = await runHealthProbes();
    expect(results[0]?.id).toBe('env');
    expect(results[0]?.ok).toBe(false);
    expect(results.some((r) => r.detail.includes('Skipped'))).toBe(true);
  });
});
