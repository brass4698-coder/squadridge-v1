import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('demoLogin helpers', () => {
  const prevProd = import.meta.env.PROD;
  const prevFlag = import.meta.env.VITE_ENABLE_DEMO_LOGIN;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    import.meta.env.PROD = prevProd;
    import.meta.env.VITE_ENABLE_DEMO_LOGIN = prevFlag;
  });

  it('builds demo sign-in paths with optional next', async () => {
    const { demoSignInPath } = await import('../lib/demoLogin');
    expect(demoSignInPath()).toBe('/sign-in?demo=1');
    expect(demoSignInPath('/app/facilitator')).toBe('/sign-in?demo=1&next=%2Fapp%2Ffacilitator');
    expect(demoSignInPath('https://evil.example')).toBe('/sign-in?demo=1');
  });

  it('routes unauthenticated hub visitors through demo sign-in when enabled', async () => {
    import.meta.env.PROD = false;
    import.meta.env.VITE_ENABLE_DEMO_LOGIN = undefined;
    const { demoAppEntryPath } = await import('../lib/demoLogin');
    expect(demoAppEntryPath('/app/participant')).toBe('/sign-in?demo=1&next=%2Fapp%2Fparticipant');
    expect(demoAppEntryPath('/app/participant', { hasSession: true })).toBe('/app/participant');
  });
});
