import { describe, expect, it } from 'vitest';
import { assertNoStubFlags } from './zkRequestGuards';

describe('assertNoStubFlags', () => {
  it('accepts well-formed bodies that omit the flag', () => {
    expect(() => assertNoStubFlags({ attribute_scope: 'x', credential_type: 'y' })).not.toThrow();
  });

  it('accepts non-object bodies (handler validates shape separately)', () => {
    expect(() => assertNoStubFlags(null)).not.toThrow();
    expect(() => assertNoStubFlags(undefined)).not.toThrow();
    expect(() => assertNoStubFlags('string')).not.toThrow();
    expect(() => assertNoStubFlags(42)).not.toThrow();
  });

  it('rejects snake_case is_stub: true', () => {
    expect(() => assertNoStubFlags({ is_stub: true })).toThrow('is_stub flag is not accepted');
  });

  it('rejects camelCase isStub: true', () => {
    expect(() => assertNoStubFlags({ isStub: true })).toThrow('is_stub flag is not accepted');
  });

  it('does NOT reject is_stub: false (cannot be used to opt into stub path)', () => {
    expect(() => assertNoStubFlags({ is_stub: false })).not.toThrow();
    expect(() => assertNoStubFlags({ isStub: false })).not.toThrow();
  });

  it('rejects truthy stub flag even alongside otherwise valid fields', () => {
    expect(() =>
      assertNoStubFlags({
        attribute_scope: 'onboarding_demo',
        credential_type: 'citizenship',
        semaphore_proof: { merkleTreeRoot: 'r' },
        is_stub: true,
      }),
    ).toThrow('is_stub flag is not accepted');
  });
});
