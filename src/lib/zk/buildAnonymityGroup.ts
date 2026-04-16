import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';

/**
 * Fixed decoy members (public in source) pad the Merkle set so the proof is not a singleton.
 * Real deployments should use an issuer-maintained group; this preserves valid Semaphore proofs end-to-end.
 */
const DECOY_A = new Identity('squadridge-decoy-a');
const DECOY_B = new Identity('squadridge-decoy-b');
const DECOY_C = new Identity('squadridge-decoy-c');

export function buildSessionAnonymityGroup(userIdentity: Identity): Group {
  const group = new Group();
  group.addMember(DECOY_A.commitment);
  group.addMember(DECOY_B.commitment);
  group.addMember(DECOY_C.commitment);
  group.addMember(userIdentity.commitment);
  return group;
}
