import { encodeBytes32String } from 'ethers/abi';
import { toBigInt } from 'ethers/utils';

/** Semaphore encodes short strings with ABI bytes32; max 31 UTF-8 bytes. */
const MAX_LABEL = 31;

/**
 * Matches `@semaphore-protocol/proof` string → bigint conversion for `message` / `scope`
 * (see `toBigInt` + `encodeBytes32String` in that package).
 */
export function semaphoreFieldFromLabel(label: string): string {
  const s = label.trim().slice(0, MAX_LABEL);
  return toBigInt(encodeBytes32String(s.length > 0 ? s : '\0')).toString();
}
