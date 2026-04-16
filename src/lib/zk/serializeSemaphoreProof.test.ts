import { describe, expect, it } from 'vitest';
import { semaphoreProofToWireFormat } from './serializeSemaphoreProof';

describe('semaphoreProofToWireFormat', () => {
  it('converts bigint fields to JSON-safe strings for Edge invoke', () => {
    const proof = {
      merkleTreeDepth: 2,
      merkleTreeRoot: 123n,
      message: 456n,
      nullifier: 789n,
      scope: 1n,
      points: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ],
    };
    const wired = semaphoreProofToWireFormat(proof as never);
    expect(() => JSON.stringify(wired)).not.toThrow();
    expect(wired.merkleTreeRoot).toBe('123');
    expect(wired.message).toBe('456');
    expect(JSON.parse(JSON.stringify(wired))).toEqual(wired);
  });
});
