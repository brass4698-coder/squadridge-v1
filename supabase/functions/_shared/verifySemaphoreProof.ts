/**
 * Semaphore proof verification only — matches `@semaphore-protocol/proof` `verifyProof`
 * without pulling `generateProof` / `@zk-kit/artifacts` (circomkit, etc.), which blows up Edge bundle size.
 */
import { unpackGroth16Proof } from 'npm:@zk-kit/utils@1.3.0/proof-packing';
import { keccak_256 } from 'npm:@noble/hashes@1.3.2/sha3';
import { groth16 } from 'npm:snarkjs@0.7.5';
import { semaphoreVerificationKeys } from './semaphoreVerificationKeys.ts';

const MIN_DEPTH = 1;
const MAX_DEPTH = 32;

/** `ethers` `toBeHex(getUint(value), width)` for bigints (matches `@semaphore-protocol/proof` inputs). */
function toBeHex(value: bigint, width: number): string {
  let hex = value.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  if (width * 2 < hex.length) {
    throw new TypeError(`value exceeds width (${width} bytes)`);
  }
  while (hex.length < width * 2) hex = '0' + hex;
  return '0x' + hex;
}

/** Same as `ethers` `keccak256` on a hex string (and as `hash()` in `@semaphore-protocol/proof`). */
function keccak256Hex(dataHex: string): string {
  const hex = dataHex.slice(2);
  const data = new Uint8Array(hex.length / 2);
  for (let i = 0; i < data.length; i++) {
    data[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  const hash = keccak_256(data);
  return '0x' + [...hash].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Same as `hash` in `@semaphore-protocol/proof` (keccak field element). */
function semaphoreHash(message: string): string {
  return (BigInt(keccak256Hex(toBeHex(BigInt(message), 32))) >> 8n).toString();
}

export type SemaphoreWireProof = {
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  message: string;
  nullifier: string;
  scope: string;
  points: [string, string, string, string, string, string, string, string];
};

export async function verifySemaphoreProof(proof: SemaphoreWireProof): Promise<boolean> {
  const { merkleTreeDepth, merkleTreeRoot, nullifier, message, scope, points } = proof;
  if (merkleTreeDepth < MIN_DEPTH || merkleTreeDepth > MAX_DEPTH) {
    throw new TypeError(`The tree depth must be a number between ${MIN_DEPTH} and ${MAX_DEPTH}`);
  }
  const verificationKey = {
    ...semaphoreVerificationKeys,
    vk_delta_2: semaphoreVerificationKeys.vk_delta_2[merkleTreeDepth - 1],
    IC: semaphoreVerificationKeys.IC[merkleTreeDepth - 1],
  };
  return groth16.verify(
    verificationKey,
    [merkleTreeRoot, nullifier, semaphoreHash(message), semaphoreHash(scope)],
    unpackGroth16Proof(points),
  );
}
