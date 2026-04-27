/** SHA-256 hex of UTF-8 string — works in browsers and modern Node (Web Crypto). */
export async function sha256Hex(utf8: string): Promise<string> {
  const data = new TextEncoder().encode(utf8);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(digest);
}

export function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hmacSha256Hex(secretUtf8: string, messageUtf8: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretUtf8),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(messageUtf8));
  return bufferToHex(sig);
}

/** Short stable fingerprint for span text — never log full message alongside it in production. */
export async function snippetFingerprint(
  fullText: string,
  span: { start: number; end: number },
): Promise<string> {
  const slice = fullText.slice(span.start, span.end);
  const inner = await sha256Hex(`${span.start}:${span.end}:${slice}`);
  return inner.slice(0, 16);
}
