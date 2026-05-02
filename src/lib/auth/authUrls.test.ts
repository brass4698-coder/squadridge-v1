import { describe, expect, it, vi } from 'vitest';
import { getAuthCallbackUrl } from './authUrls';

describe('getAuthCallbackUrl', () => {
  it('builds /auth/callback on site origin', () => {
    vi.stubGlobal('window', { location: { origin: 'https://app.example.com' } });
    vi.stubEnv('VITE_SITE_URL', 'https://app.example.com');
    expect(getAuthCallbackUrl()).toBe('https://app.example.com/auth/callback');
  });

  it('appends next when path is safe', () => {
    vi.stubEnv('VITE_SITE_URL', 'https://app.example.com');
    expect(getAuthCallbackUrl('/find-squad')).toBe(
      'https://app.example.com/auth/callback?next=%2Ffind-squad',
    );
  });

  it('ignores unsafe next paths', () => {
    vi.stubEnv('VITE_SITE_URL', 'https://app.example.com');
    expect(getAuthCallbackUrl('//evil.com')).toBe('https://app.example.com/auth/callback');
    expect(getAuthCallbackUrl('https://evil.com')).toBe('https://app.example.com/auth/callback');
  });
});
