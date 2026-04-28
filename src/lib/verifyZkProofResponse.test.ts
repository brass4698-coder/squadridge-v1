import { describe, expect, it } from 'vitest';
import {
  parseVerifyZkProofErrorBody,
  parseVerifyZkProofResponse,
  VerifyZkProofParseError,
} from './verifyZkProofResponse';

describe('parseVerifyZkProofResponse', () => {
  it('accepts wrapped ok proof', () => {
    const p = parseVerifyZkProofResponse({
      ok: true,
      proof: {
        proofId: 'pid',
        credentialType: 'session_attribute',
        nullifierHash: 'n',
        commitment: 'c',
        verifiedAt: '2026-01-01T00:00:00.000Z',
        isStub: false,
      },
    });
    expect(p.proofId).toBe('pid');
    expect(p.commitment).toBe('c');
  });

  it('accepts legacy flat proof', () => {
    const p = parseVerifyZkProofResponse({
      proofId: 'pid2',
      credentialType: 'session_attribute',
      nullifierHash: 'n',
      commitment: 'c',
      verifiedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(p.proofId).toBe('pid2');
  });

  it('rejects malformed payloads', () => {
    expect(() => parseVerifyZkProofResponse({ ok: true })).toThrow(VerifyZkProofParseError);
    expect(() => parseVerifyZkProofResponse({ foo: 1 })).toThrow(VerifyZkProofParseError);
  });
});

describe('parseVerifyZkProofErrorBody', () => {
  it('parses wrapped errors', () => {
    expect(parseVerifyZkProofErrorBody({ ok: false, error: 'bad', errorCode: 'X' })).toEqual({
      message: 'bad',
      errorCode: 'X',
    });
  });
  it('parses legacy { error }', () => {
    expect(parseVerifyZkProofErrorBody({ error: 'legacy' })).toEqual({ message: 'legacy' });
  });
});
