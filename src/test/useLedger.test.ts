import { describe, expect, it, vi, beforeEach } from 'vitest';

const fromMock = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

vi.mock('../lib/env', () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

import { isSupabaseConfigured } from '../lib/env';
import { renderHook, waitFor } from '@testing-library/react';
import { useLedger } from '../hooks/useLedger';

function chainResult(data: unknown, error: { message: string } | null) {
  const result = { data, error };
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.select = vi.fn(self);
  api.eq = vi.fn(self);
  api.order = vi.fn(self);
  api.ilike = vi.fn(self);
  api.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return api;
}

describe('useLedger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it('treats successful empty list as no error', async () => {
    fromMock.mockReturnValue(chainResult([], null));
    const { result } = renderHook(() => useLedger());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.entries).toEqual([]);
  });

  it('surfaces a distinct error on query failure', async () => {
    fromMock.mockReturnValue(chainResult(null, { message: 'column does not exist' }));
    const { result } = renderHook(() => useLedger());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/column does not exist/i);
    expect(result.current.entries).toEqual([]);
  });

  it('returns calm empty state when Supabase is not configured', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    const { result } = renderHook(() => useLedger());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fromMock).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.entries).toEqual([]);
  });
});
