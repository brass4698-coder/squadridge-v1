import { describe, expect, it } from 'vitest';
import { ZK_SESSION_CREDENTIAL_TYPE } from './zkAdapter';

describe('zkAdapter', () => {
  it('uses session_attribute as Edge credential_type', () => {
    expect(ZK_SESSION_CREDENTIAL_TYPE).toBe('session_attribute');
  });
});
