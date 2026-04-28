import { describe, expect, it } from 'vitest';
import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import {
  buildSessionAnonymityGroup,
  shouldUseBuiltinSemaphoreDecoys,
  type SemaphoreEnvSlice,
} from './buildAnonymityGroup';
import type { ManifestFetcher, VerifiedIssuerManifest } from './issuerManifest';

describe('shouldUseBuiltinSemaphoreDecoys', () => {
  it('allows dev and test without flag', () => {
    expect(
      shouldUseBuiltinSemaphoreDecoys({
        DEV: true,
        MODE: 'development',
        PROD: false,
      } as SemaphoreEnvSlice),
    ).toBe(true);
    expect(
      shouldUseBuiltinSemaphoreDecoys({
        DEV: false,
        MODE: 'test',
        PROD: false,
      } as SemaphoreEnvSlice),
    ).toBe(true);
  });

  it('allows the Playwright preview e2e mode without the prod escape hatch', () => {
    expect(
      shouldUseBuiltinSemaphoreDecoys({
        DEV: false,
        MODE: 'e2e',
        PROD: true,
        VITE_SEMAPHORE_DEMO_GROUP: 'true',
      } as SemaphoreEnvSlice),
    ).toBe(true);
  });

  it('refuses production builds even with the demo flag set, unless the explicit prod escape hatch is on', () => {
    expect(
      shouldUseBuiltinSemaphoreDecoys({
        DEV: false,
        MODE: 'production',
        PROD: true,
        VITE_SEMAPHORE_DEMO_GROUP: '',
      } as SemaphoreEnvSlice),
    ).toBe(false);
    expect(
      shouldUseBuiltinSemaphoreDecoys({
        DEV: false,
        MODE: 'production',
        PROD: true,
        VITE_SEMAPHORE_DEMO_GROUP: 'true',
      } as SemaphoreEnvSlice),
    ).toBe(false);
    expect(
      shouldUseBuiltinSemaphoreDecoys({
        DEV: false,
        MODE: 'production',
        PROD: true,
        VITE_SEMAPHORE_DEMO_GROUP: 'true',
        VITE_ALLOW_DEMO_DECOYS_IN_PROD: 'true',
      } as SemaphoreEnvSlice),
    ).toBe(true);
  });

  it('staging-style non-prod modes still require the demo flag', () => {
    expect(
      shouldUseBuiltinSemaphoreDecoys({
        DEV: false,
        MODE: 'staging',
        PROD: false,
        VITE_SEMAPHORE_DEMO_GROUP: 'true',
      } as SemaphoreEnvSlice),
    ).toBe(true);
    expect(
      shouldUseBuiltinSemaphoreDecoys({
        DEV: false,
        MODE: 'staging',
        PROD: false,
      } as SemaphoreEnvSlice),
    ).toBe(false);
  });
});

describe('buildSessionAnonymityGroup (decoy paths)', () => {
  it('includes the user commitment with decoy members', async () => {
    const user = new Identity();
    const group = await buildSessionAnonymityGroup(user);
    expect(group.members).toHaveLength(4);
    expect(group.members).toContain(user.commitment);
  });

  it('accepts custom decoys in lieu of builtins', async () => {
    const user = new Identity();
    const d1 = new Identity('custom-a');
    const d2 = new Identity('custom-b');
    const d3 = new Identity('custom-c');
    const group = await buildSessionAnonymityGroup(user, { decoyIdentities: [d1, d2, d3] });
    expect(group.members).toHaveLength(4);
  });
});

describe('buildSessionAnonymityGroup (issuer path)', () => {
  function makeIssuerFixture(memberSeeds: string[]) {
    const members = memberSeeds.map((s) => new Identity(s));
    const tempGroup = new Group();
    for (const id of members) tempGroup.addMember(id.commitment);

    const manifest: VerifiedIssuerManifest = {
      group_id: 'issuer.test/cohort-1',
      tree_depth: 20,
      root: tempGroup.root.toString(),
      members_url: 'https://issuer.test/members.json',
      issued_at: '2026-04-28T00:00:00Z',
      expires_at: '2099-01-01T00:00:00Z',
      signature: 'ed25519:placeholder',
      fetched_at: '2026-04-28T00:00:00Z',
    };

    const fetchImpl: typeof fetch = (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      if (url.includes('members.json')) {
        const body = JSON.stringify(members.map((m) => m.commitment.toString()));
        return Promise.resolve(
          new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } }),
        );
      }
      return Promise.resolve(new Response('not found', { status: 404 }));
    };

    const fetcher: ManifestFetcher = (gid) => {
      if (gid !== manifest.group_id) {
        return Promise.reject(new Error(`unknown group_id ${gid}`));
      }
      return Promise.resolve(manifest);
    };

    return { manifest, members, fetcher, fetchImpl };
  }

  it('builds the group from the issuer-published members and verifies the root', async () => {
    const user = new Identity('member-a');
    const { fetcher, fetchImpl, manifest } = makeIssuerFixture([
      'member-a',
      'member-b',
      'member-c',
      'member-d',
    ]);

    const group = await buildSessionAnonymityGroup(user, {
      issuerGroupId: manifest.group_id,
      issuerManifestFetcher: fetcher,
      issuerFetchImpl: fetchImpl,
    });

    expect(group.members).toHaveLength(4);
    expect(group.members).toContain(user.commitment);
    expect(group.root.toString()).toBe(manifest.root);
  });

  it('refuses if the user is not in the issuer members list', async () => {
    const stranger = new Identity('not-enrolled');
    const { fetcher, fetchImpl, manifest } = makeIssuerFixture([
      'member-a',
      'member-b',
      'member-c',
    ]);

    await expect(
      buildSessionAnonymityGroup(stranger, {
        issuerGroupId: manifest.group_id,
        issuerManifestFetcher: fetcher,
        issuerFetchImpl: fetchImpl,
      }),
    ).rejects.toThrow(/not in issuer group/);
  });

  it('refuses if a tampered members list yields a different Merkle root than the manifest', async () => {
    const user = new Identity('member-a');
    const { fetcher, manifest } = makeIssuerFixture(['member-a', 'member-b', 'member-c']);

    // Substitute a fetch that returns one fewer member than the manifest signed for.
    // The group's root will not match `manifest.root` and we must refuse the proof.
    const tamperedFetch: typeof fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify([new Identity('member-a').commitment.toString()]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    await expect(
      buildSessionAnonymityGroup(user, {
        issuerGroupId: manifest.group_id,
        issuerManifestFetcher: fetcher,
        issuerFetchImpl: tamperedFetch,
      }),
    ).rejects.toThrow(/Merkle root does not match/);
  });

  it('requires both issuerGroupId and issuerManifestFetcher together', async () => {
    const user = new Identity();
    await expect(
      buildSessionAnonymityGroup(user, { issuerGroupId: 'issuer.test/cohort-1' }),
    ).rejects.toThrow(/issuerManifestFetcher/);
  });
});
