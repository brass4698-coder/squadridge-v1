/**
 * Bytes32 string encoding matching ethers `encodeBytes32String` + Semaphore field labels.
 * Keep in sync with `src/lib/zk/semaphoreFieldEncoding.ts` (Vite client).
 *
 * Avoids importing `ethers` in Edge Functions (~tens of MB bundled).
 */
const MAX_LABEL = 31;

/** ABI `encodeBytes32String`: UTF-8 (max 31 bytes), right-padded with zeros to 32 bytes, `0x` hex. */
export function encodeBytes32String(text: string): string {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 31) {
    throw new Error('bytes32 string must be less than 32 bytes');
  }
  const padded = new Uint8Array(32);
  padded.set(bytes);
  return (
    '0x' +
    Array.from(padded)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function semaphoreFieldFromLabel(label: string): string {
  const s = label.trim().slice(0, MAX_LABEL);
  const preimage = s.length > 0 ? s : '\0';
  return BigInt(encodeBytes32String(preimage)).toString();
}
