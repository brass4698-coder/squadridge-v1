/**
 * SHA-256 helpers for public ledger verification (Web Crypto).
 * Stub-safe: no dialogue, no identity fields.
 */

const encoder = new TextEncoder();

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Hash-chain step: H(prev || "" + "\\n" + contentSha256). */
export async function chainStepSha256(
  prevChainSha256: string | null | undefined,
  contentSha256: string,
): Promise<string> {
  const prev = prevChainSha256 ?? '';
  return sha256Hex(`${prev}\n${contentSha256}`);
}
