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

  it('derives commitment and nullifierHash deterministically from (credentialType, rawInput)', async () => {
    // Determinism is the security-relevant property: the previous implementation
    // mixed Date.now() into commitData, which broke nullifier-style dedup even
    // on the stub path (same input -> different commitment every call).
    const a = await generateStubProof('session_attribute', 'fixed-input');
    const b = await generateStubProof('session_attribute', 'fixed-input');
    expect(a.commitment).toBe(b.commitment);
    expect(a.nullifierHash).toBe(b.nullifierHash);
  });

  it('produces different commitments when rawInput differs', async () => {
    const a = await generateStubProof('session_attribute', 'input-a');
    const b = await generateStubProof('session_attribute', 'input-b');
    expect(a.commitment).not.toBe(b.commitment);
    expect(a.nullifierHash).not.toBe(b.nullifierHash);
  });

  it('produces different commitments when credentialType differs', async () => {
    const a = await generateStubProof('citizenship', 'fixed-input');
    const b = await generateStubProof('press_credential', 'fixed-input');
    expect(a.commitment).not.toBe(b.commitment);
    expect(a.nullifierHash).not.toBe(b.nullifierHash);
  });
});
