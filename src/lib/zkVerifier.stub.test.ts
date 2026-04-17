import { describe, expect, it, vi } from 'vitest';
import { generateStubProof } from './zkVerifier';

describe('generateStubProof (ZK stub path)', () => {
  it('returns hash-shaped proof with isStub true', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000099');
    const proof = await generateStubProof('session_attribute', '  scope text  ');
    expect(proof.isStub).toBe(true);
    expect(proof.credentialType).toBe('session_attribute');
    expect(proof.proofId).toBe('00000000-0000-4000-8000-000000000099');
    expect(proof.nullifierHash).toMatch(/^[a-f0-9]{64}$/);
    expect(proof.commitment).toMatch(/^[a-f0-9]{64}$/);
    expect(proof.verifiedAt).toMatch(/^\d{4}-/);
    vi.restoreAllMocks();
  });
});
