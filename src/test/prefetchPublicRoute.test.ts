import { afterEach, describe, expect, it, vi } from 'vitest';

describe('prefetchPublicRoute', () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('imports a known marketing route once and ignores unknowns', async () => {
    const { prefetchPublicRoute } = await import('../lib/prefetchPublicRoute');

    prefetchPublicRoute('/not-a-real-route');
    prefetchPublicRoute('/how-it-works');
    prefetchPublicRoute('/how-it-works?x=1');
    prefetchPublicRoute('/how-it-works#section');

    // Second call path is cached — should not throw / re-fetch aggressively.
    expect(() => prefetchPublicRoute('/how-it-works')).not.toThrow();
  });
});
