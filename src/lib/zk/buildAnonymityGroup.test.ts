import { describe, expect, it } from 'vitest';
import { Identity } from '@semaphore-protocol/identity';
import { buildSessionAnonymityGroup } from './buildAnonymityGroup';

describe('buildSessionAnonymityGroup', () => {
  it('includes the user commitment with decoy members', () => {
    const user = new Identity();
    const group = buildSessionAnonymityGroup(user);
    expect(group.members).toHaveLength(4);
    expect(group.members).toContain(user.commitment);
  });
});
