import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';

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
