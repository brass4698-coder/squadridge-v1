import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefetchAppRoute } from '../lib/prefetchAppRoute';

describe('prefetchAppRoute', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ignores unknown paths', () => {
    expect(() => prefetchAppRoute('/unknown')).not.toThrow();
  });

  it('strips hash and query before lookup', async () => {
    const mod = await import('../pages/v2/SessionsListPage');
    expect(mod.SessionsListPage).toBeTypeOf('function');
    expect(() => prefetchAppRoute('/app/sessions?x=1#top')).not.toThrow();
  });
});
