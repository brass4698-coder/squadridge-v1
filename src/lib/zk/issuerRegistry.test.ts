import { describe, expect, it } from 'vitest';
import { resolveIssuerRegistry, type IssuerRegistryEnvSlice } from './issuerRegistry';

const PRESENT: IssuerRegistryEnvSlice = {
  VITE_ISSUER_GROUP_ID: 'issuer.example/2026-04-cohort',
  VITE_ISSUER_MANIFEST_URL: 'https://issuer.example/manifest.json',
  VITE_ISSUER_SIGNING_KEY_BASE64URL: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
};

describe('resolveIssuerRegistry', () => {
  it('returns null when all three vars are unset', () => {
    expect(resolveIssuerRegistry({})).toBeNull();
  });

  it('returns null when any of the three vars is missing', () => {
    const cases: IssuerRegistryEnvSlice[] = [
      { ...PRESENT, VITE_ISSUER_GROUP_ID: undefined },
      { ...PRESENT, VITE_ISSUER_MANIFEST_URL: undefined },
      { ...PRESENT, VITE_ISSUER_SIGNING_KEY_BASE64URL: undefined },
    ];
    for (const env of cases) {
      expect(resolveIssuerRegistry(env)).toBeNull();
    }
  });

  it('treats whitespace-only values as unset', () => {
    expect(
      resolveIssuerRegistry({
        VITE_ISSUER_GROUP_ID: '   ',
        VITE_ISSUER_MANIFEST_URL: PRESENT.VITE_ISSUER_MANIFEST_URL,
        VITE_ISSUER_SIGNING_KEY_BASE64URL: PRESENT.VITE_ISSUER_SIGNING_KEY_BASE64URL,
      }),
    ).toBeNull();
  });

  it('returns a configured registry with a bound fetcher when all three are set', () => {
    const registry = resolveIssuerRegistry(PRESENT);
    expect(registry).not.toBeNull();
    expect(registry?.groupId).toBe('issuer.example/2026-04-cohort');
    expect(registry?.manifestUrl).toBe('https://issuer.example/manifest.json');
    expect(typeof registry?.fetcher).toBe('function');
  });

  it('rejects fetcher calls for a different group_id than the one configured', async () => {
    const registry = resolveIssuerRegistry(PRESENT, () =>
      Promise.resolve(new Response('{}', { status: 200 })),
    );
    await expect(registry!.fetcher('issuer.other/cohort-x')).rejects.toThrow(
      /group_id not registered/,
    );
  });
});
