import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import {
  fetchIssuerMemberCommitments,
  type ManifestFetcher,
  type VerifiedIssuerManifest,
} from './issuerManifest';

/**
 * Fixed decoy members (public in source) pad the Merkle set so the proof is not a singleton.
 * In production these collapse the anonymity set: a verifier sees `{user, decoy_a, decoy_b, decoy_c}`
 * where three of four are public — anonymity ≈ 1. Production callers must supply
 * `options.issuerGroupId` (the strongly-recommended path) or `options.decoyIdentities`
 * from an issuer-managed group (see
 * `docs/technical/rfc-issuer-managed-anonymity-group.md`).
 */
const DECOY_A = new Identity('mendguild-decoy-a');
const DECOY_B = new Identity('mendguild-decoy-b');
const DECOY_C = new Identity('mendguild-decoy-c');

const DEFAULT_DECOYS = [DECOY_A, DECOY_B, DECOY_C] as const;

export type SemaphoreEnvSlice = Pick<
  ImportMetaEnv,
  'DEV' | 'MODE' | 'PROD' | 'VITE_SEMAPHORE_DEMO_GROUP' | 'VITE_ALLOW_DEMO_DECOYS_IN_PROD'
>;

/**
 * Whether bundled-in demo decoys are allowed (exported for tests and guardrails).
 *
 * Allowed environments:
 * - Vite dev server (`env.DEV`)
 * - Vitest (`env.MODE === 'test'`)
 * - Playwright preview build (`env.MODE === 'e2e'`)
 * - Any non-production build with `VITE_SEMAPHORE_DEMO_GROUP=true`
 * - Production builds *only* when **both** `VITE_SEMAPHORE_DEMO_GROUP=true`
 *   and `VITE_ALLOW_DEMO_DECOYS_IN_PROD=true` are set. CI prod builds reject the latter.
 */
export function shouldUseBuiltinSemaphoreDecoys(env: SemaphoreEnvSlice): boolean {
  if (env.DEV) return true;
  if (env.MODE === 'test') return true;
  if (env.MODE === 'e2e') return true;
  if (env.VITE_SEMAPHORE_DEMO_GROUP !== 'true') return false;
  if (env.PROD && env.VITE_ALLOW_DEMO_DECOYS_IN_PROD !== 'true') return false;
  return true;
}

export type SessionAnonymityGroupOptions = {
  /** Minimum three identities pad the Merkle set; overrides built-in demos when supplied. */
  decoyIdentities?: Identity[];
  /**
   * Production path: build the group from an issuer-published, signature-verified
   * Merkle root (see `docs/technical/rfc-issuer-managed-anonymity-group.md`).
   * Requires {@link issuerManifestFetcher} to resolve the manifest.
   */
  issuerGroupId?: string;
  /** Returns a verified manifest for `issuerGroupId`. Required when `issuerGroupId` is set. */
  issuerManifestFetcher?: ManifestFetcher;
  /** Optional fetch override for member-list retrieval (tests). Defaults to global `fetch`. */
  issuerFetchImpl?: typeof fetch;
};

export async function buildSessionAnonymityGroup(
  userIdentity: Identity,
  options?: SessionAnonymityGroupOptions,
): Promise<Group> {
  if (options?.issuerGroupId) {
    if (!options.issuerManifestFetcher) {
      throw new Error(
        'buildSessionAnonymityGroup: issuerGroupId requires issuerManifestFetcher (see docs/technical/rfc-issuer-managed-anonymity-group.md).',
      );
    }
    return buildFromIssuer(
      userIdentity,
      options.issuerGroupId,
      options.issuerManifestFetcher,
      options.issuerFetchImpl,
    );
  }

  const env = import.meta.env;
  let decoys: Identity[];

  if (options?.decoyIdentities && options.decoyIdentities.length >= 3) {
    decoys = options.decoyIdentities.slice(0);
  } else if (shouldUseBuiltinSemaphoreDecoys(env)) {
    decoys = [...DEFAULT_DECOYS];
  } else {
    throw new Error(
      'buildSessionAnonymityGroup: refusing to build a Semaphore group with bundled demo decoys. ' +
        'Production callers must pass options.issuerGroupId (preferred) or options.decoyIdentities ' +
        'from an issuer-managed set (see docs/technical/rfc-issuer-managed-anonymity-group.md). ' +
        'For controlled internal demos, set both VITE_SEMAPHORE_DEMO_GROUP=true and ' +
        'VITE_ALLOW_DEMO_DECOYS_IN_PROD=true on a non-production environment.',
    );
  }

  const group = new Group();
  for (const id of decoys) {
    group.addMember(id.commitment);
  }
  group.addMember(userIdentity.commitment);
  return group;
}

async function buildFromIssuer(
  userIdentity: Identity,
  groupId: string,
  fetcher: ManifestFetcher,
  fetchImpl?: typeof fetch,
): Promise<Group> {
  const manifest: VerifiedIssuerManifest = await fetcher(groupId);
  const commitments = await fetchIssuerMemberCommitments(manifest, fetchImpl);

  // The user's identity commitment must already be present in the issuer's set
  // — otherwise their proof would not verify against the issuer's published
  // Merkle root. This is a fail-fast sanity check; the real authority is the
  // root match assertion below.
  if (!commitments.some((c) => c === userIdentity.commitment)) {
    throw new Error(
      `buildSessionAnonymityGroup: user is not in issuer group "${groupId}" (commitment not in members list).`,
    );
  }

  const group = new Group();
  for (const c of commitments) {
    group.addMember(c);
  }

  if (group.root.toString() !== manifest.root) {
    throw new Error(
      `buildSessionAnonymityGroup: built Merkle root does not match issuer manifest root for group "${groupId}". ` +
        `Refusing to construct an unverifiable group.`,
    );
  }

  return group;
}
