import { describe, expect, it } from 'vitest';
import {
  canonicalManifestBytes,
  createManifestFetcher,
  fetchIssuerMemberCommitments,
  verifyManifestSignature,
  type IssuerManifest,
  type VerifiedIssuerManifest,
} from './issuerManifest';

const SAMPLE_MANIFEST: IssuerManifest = {
  group_id: 'issuer.test/cohort-A',
  tree_depth: 20,
  root: '12345',
  members_url: 'https://issuer.test/members.json',
  issued_at: '2026-04-28T00:00:00Z',
  expires_at: '2099-01-01T00:00:00Z',
  signature: 'ed25519:placeholder',
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

describe('canonicalManifestBytes', () => {
  it('produces deterministic JSON sorted by key, excluding the signature field', () => {
    const a = canonicalManifestBytes(SAMPLE_MANIFEST);
    const b = canonicalManifestBytes({ ...SAMPLE_MANIFEST, signature: 'ed25519:something-else' });
    expect(new TextDecoder().decode(a)).toBe(new TextDecoder().decode(b));
    expect(new TextDecoder().decode(a)).toContain('"group_id":"issuer.test/cohort-A"');
    expect(new TextDecoder().decode(a)).not.toContain('signature');
  });
});

describe('verifyManifestSignature (Web Crypto Ed25519 round-trip)', () => {
  it('accepts a valid signature and rejects a tampered manifest', async () => {
    const keyPair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
      'sign',
      'verify',
    ])) as CryptoKeyPair;

    const pubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey));
    const pubB64u = bytesToBase64Url(pubRaw);

    const bytes = canonicalManifestBytes(SAMPLE_MANIFEST);
    const sig = new Uint8Array(await crypto.subtle.sign('Ed25519', keyPair.privateKey, bytes));
    const signed: IssuerManifest = {
      ...SAMPLE_MANIFEST,
      signature: `ed25519:${bytesToBase64Url(sig)}`,
    };

    await expect(verifyManifestSignature(signed, pubB64u)).resolves.toBeUndefined();

    const tampered: IssuerManifest = { ...signed, root: '99999' };
    await expect(verifyManifestSignature(tampered, pubB64u)).rejects.toThrow(
      /signature verification failed/,
    );
  });

  it('rejects a manifest whose signature does not start with "ed25519:"', async () => {
    const bad: IssuerManifest = { ...SAMPLE_MANIFEST, signature: 'rsa:abc' };
    await expect(
      verifyManifestSignature(bad, bytesToBase64Url(new Uint8Array(32))),
    ).rejects.toThrow(/must start with "ed25519:"/);
  });
});

describe('createManifestFetcher', () => {
  it('rejects unregistered group ids', async () => {
    const fetcher = createManifestFetcher({ registry: {} });
    await expect(fetcher('issuer.test/unknown')).rejects.toThrow(/not registered/);
  });

  it('rejects a manifest whose group_id does not match the request', async () => {
    const keyPair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
      'sign',
      'verify',
    ])) as CryptoKeyPair;
    const pubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey));
    const pubB64u = bytesToBase64Url(pubRaw);

    const wrongIdManifest: IssuerManifest = {
      ...SAMPLE_MANIFEST,
      group_id: 'issuer.test/different',
    };
    const sigBytes = new Uint8Array(
      await crypto.subtle.sign(
        'Ed25519',
        keyPair.privateKey,
        canonicalManifestBytes(wrongIdManifest),
      ),
    );
    const signed: IssuerManifest = {
      ...wrongIdManifest,
      signature: `ed25519:${bytesToBase64Url(sigBytes)}`,
    };

    const fetchImpl: typeof fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify(signed), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const fetcher = createManifestFetcher({
      registry: {
        'issuer.test/cohort-A': {
          manifest_url: 'https://issuer.test/manifest.json',
          signing_key_base64url: pubB64u,
        },
      },
      fetchImpl,
    });

    await expect(fetcher('issuer.test/cohort-A')).rejects.toThrow(/group_id mismatch/);
  });

  it('rejects an expired manifest before checking the signature', async () => {
    const expired: IssuerManifest = {
      ...SAMPLE_MANIFEST,
      expires_at: '2000-01-01T00:00:00Z',
    };
    const fetchImpl: typeof fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify(expired), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const fetcher = createManifestFetcher({
      registry: {
        'issuer.test/cohort-A': {
          manifest_url: 'https://issuer.test/manifest.json',
          signing_key_base64url: bytesToBase64Url(new Uint8Array(32)),
        },
      },
      fetchImpl,
    });

    await expect(fetcher('issuer.test/cohort-A')).rejects.toThrow(/expired/);
  });
});

describe('fetchIssuerMemberCommitments', () => {
  it('returns an array of BigInt commitments', async () => {
    const manifest: VerifiedIssuerManifest = {
      ...SAMPLE_MANIFEST,
      fetched_at: '2026-04-28T00:00:00Z',
    };
    const fetchImpl: typeof fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify(['100', '200', '300']), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    const out = await fetchIssuerMemberCommitments(manifest, fetchImpl);
    expect(out).toEqual([100n, 200n, 300n]);
  });

  it('rejects non-decimal entries', async () => {
    const manifest: VerifiedIssuerManifest = {
      ...SAMPLE_MANIFEST,
      fetched_at: '2026-04-28T00:00:00Z',
    };
    const fetchImpl: typeof fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify(['100', 'abc']), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    await expect(fetchIssuerMemberCommitments(manifest, fetchImpl)).rejects.toThrow(
      /not a non-negative decimal/,
    );
  });

  it('rejects non-array payloads', async () => {
    const manifest: VerifiedIssuerManifest = {
      ...SAMPLE_MANIFEST,
      fetched_at: '2026-04-28T00:00:00Z',
    };
    const fetchImpl: typeof fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify({ members: ['100'] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    await expect(fetchIssuerMemberCommitments(manifest, fetchImpl)).rejects.toThrow(
      /not a JSON array/,
    );
  });
});
