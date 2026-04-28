import { describe, expect, it } from 'vitest';
import { Identity } from '@semaphore-protocol/identity';
import {
  buildSessionAnonymityGroup,
  shouldUseBuiltinSemaphoreDecoys,
  type SemaphoreEnvSlice,
} from './buildAnonymityGroup';

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

  it('requires explicit flag in prod mode', () => {
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
    ).toBe(true);
  });
});

describe('buildSessionAnonymityGroup', () => {
  it('includes the user commitment with decoy members', () => {
    const user = new Identity();
    const group = buildSessionAnonymityGroup(user);
    expect(group.members).toHaveLength(4);
    expect(group.members).toContain(user.commitment);
  });

  it('accepts custom decoys in lieu of builtins', () => {
    const user = new Identity();
    const d1 = new Identity('custom-a');
    const d2 = new Identity('custom-b');
    const d3 = new Identity('custom-c');
    const group = buildSessionAnonymityGroup(user, { decoyIdentities: [d1, d2, d3] });
    expect(group.members).toHaveLength(4);
  });
});
