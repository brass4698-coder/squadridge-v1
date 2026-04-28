import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';

/**
 * Fixed decoy members (public in source) pad the Merkle set so the proof is not a singleton.
 * In production, using these without an explicit opt-in flag is unsafe for anonymity; prefer
 * `options.decoyIdentities` from an issuer-maintained set (see docs/technical/zk-implementation.md).
 */
const DECOY_A = new Identity('squadridge-decoy-a');
const DECOY_B = new Identity('squadridge-decoy-b');
const DECOY_C = new Identity('squadridge-decoy-c');

const DEFAULT_DECOYS = [DECOY_A, DECOY_B, DECOY_C] as const;

export type SemaphoreEnvSlice = Pick<
  ImportMetaEnv,
  'DEV' | 'MODE' | 'PROD' | 'VITE_SEMAPHORE_DEMO_GROUP'
>;

/**
 * Whether bundled-in demo decoys are allowed (exported for tests and guardrails).
 * Production SPA must set `VITE_SEMAPHORE_DEMO_GROUP=true` explicitly to retain demo behavior,
 * or pass `decoyIdentities` from an issuer/integration path.
 */
export function shouldUseBuiltinSemaphoreDecoys(env: SemaphoreEnvSlice): boolean {
  if (env.DEV) return true;
  if (env.MODE === 'test') return true;
  return env.VITE_SEMAPHORE_DEMO_GROUP === 'true';
}

export type SessionAnonymityGroupOptions = {
  /** Minimum three identities pad the Merkle set; overrides built-in demos when supplied. */
  decoyIdentities?: Identity[];
};

export function buildSessionAnonymityGroup(
  userIdentity: Identity,
  options?: SessionAnonymityGroupOptions,
): Group {
  const env = import.meta.env;
  let decoys: Identity[];

  if (options?.decoyIdentities && options.decoyIdentities.length >= 3) {
    decoys = options.decoyIdentities.slice(0);
  } else if (shouldUseBuiltinSemaphoreDecoys(env)) {
    if (env.PROD && env.VITE_SEMAPHORE_DEMO_GROUP === 'true') {
      console.warn(
        '[zk] VITE_SEMAPHORE_DEMO_GROUP=true — using bundled Semaphore decoys (not issuer-managed). Replace with issuer group for real pilots.',
      );
    }
    decoys = [...DEFAULT_DECOYS];
  } else {
    throw new Error(
      'buildSessionAnonymityGroup: production requires options.decoyIdentities (issuer-managed, ≥3) or explicitly set VITE_SEMAPHORE_DEMO_GROUP=true for controlled demos only.',
    );
  }

  const group = new Group();
  for (const id of decoys) {
    group.addMember(id.commitment);
  }
  group.addMember(userIdentity.commitment);
  return group;
}
