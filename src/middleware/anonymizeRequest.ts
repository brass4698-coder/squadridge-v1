/**
 * anonymizeRequest.ts — Express-compatible request anonymizer middleware
 *
 * PURPOSE
 * -------
 * Strip or hash personally-identifiable headers from every inbound request
 * before they touch any logging, analytics, or rate-limiting code. This is
 * defence-in-depth: even if a downstream handler accidentally logs the full
 * request object, it won't see a raw IP or user-agent.
 *
 * HOW IT WORKS
 * ------------
 * 1. Read the raw IP from the request (x-forwarded-for or socket.remoteAddress).
 * 2. Compute HMAC-SHA256(rawIp, ANON_PEPPER) and truncate to 16 hex chars.
 *    This gives you a stable-enough token for rate-limiting within a key-rotation
 *    window, but not a global identifier — rotating ANON_PEPPER invalidates all
 *    tokens immediately.
 * 3. Delete the original identifying headers.
 * 4. Set x-anon-ip on both the request (for downstream middleware) and the
 *    response (optional, useful for debugging in staging).
 *
 * TRADEOFFS AND ASSUMPTIONS
 * -------------------------
 * - HMAC-SHA256 with a pepper is not perfectly anonymous: if you know the pepper
 *   and have a candidate IP, you can verify a match. Rotate the pepper regularly.
 *   See docs/security/secrets-rotation.md.
 * - The pepper MUST be a secret. Don't hard-code it; load from env.
 * - We strip x-forwarded-for before logging. Some reverse proxies re-add it
 *   after your middleware runs — make sure this middleware runs first.
 * - The hash is deterministic within a pepper rotation window. If you need
 *   complete unlinkability between sessions, also add a per-session nonce.
 * - This does NOT anonymize the request body or URL parameters. Do that
 *   separately before logging.
 *
 * DEPLOYMENT
 * ----------
 * This file is a scaffold for a Node.js/Express backend server. The current
 * SquadRidge frontend is browser-only (Vite + React), but some request paths
 * go through an Express proxy or custom server. Wire this middleware as the
 * FIRST middleware in your Express app:
 *
 *   import { makeAnonymizeRequest } from './middleware/anonymizeRequest';
 *   app.use(makeAnonymizeRequest({ pepper: process.env.ANON_PEPPER }));
 *
 * ENV VARS
 * --------
 * ANON_PEPPER  — required in production; random 32+ byte string; rotate regularly
 *
 * NEXT STEPS
 * ----------
 * - [ ] Wire in Express server (when added)
 * - [ ] Add integration test with a real Express app
 * - [ ] Add metrics: counter for stripped-header events (no raw values)
 * - [ ] Consider per-session nonce for stronger unlinkability
 */

// ─── Minimal Express-compatible interfaces ───────────────────────────────────
// We use structural typing so this file has no hard dependency on the 'express'
// package. Any object matching these shapes works — including Node's built-in
// http.IncomingMessage / http.ServerResponse.

export interface AnonymizableRequest {
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

export interface AnonymizableResponse {
  setHeader(name: string, value: string): void;
}

export type NextFunction = (err?: Error) => void;

// ─── Configuration ───────────────────────────────────────────────────────────

export interface AnonymizeRequestOptions {
  /**
   * HMAC pepper. In production this MUST come from an environment secret.
   * Defaults to '' (empty pepper) if not provided — insecure, warns at startup.
   */
  pepper?: string;

  /**
   * Lower-cased header names to delete entirely before any downstream handler
   * sees the request. Defaults to the set below; extend if you add custom
   * forwarding headers.
   */
  stripHeaders?: string[];
}

const DEFAULT_STRIP_HEADERS = [
  'user-agent',
  'x-forwarded-for',
  'x-real-ip',
  'cf-connecting-ip', // Cloudflare
  'true-client-ip', // Akamai / Cloudflare enterprise
  'x-client-ip',
  'forwarded',
  'x-cluster-client-ip',
];

// ─── HMAC helper (WebCrypto — available in Node.js 18+ and all browsers) ─────

/**
 * HMAC-SHA256 the input string with the given key. Returns the first
 * `truncateHex` hex characters (default 16 = 64 bits, sufficient for
 * rate-limiting keys; not sufficient as a collision-resistant hash).
 *
 * We use WebCrypto rather than node:crypto so this file compiles and runs in
 * both browser and Node.js 18+ without any polyfill.
 */
async function hmacTruncated(key: string, data: string, truncateHex = 16): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data));
  const hexFull = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hexFull.slice(0, truncateHex);
}

// ─── Extract the best available raw IP ───────────────────────────────────────

/**
 * Pull the leftmost IP from x-forwarded-for (first hop closest to the client),
 * or fall back to the socket address.
 *
 * IMPORTANT: If your server is not behind a trusted reverse proxy, do NOT read
 * x-forwarded-for — a malicious client can spoof it. Only trust this header
 * when the request definitely came through your own proxy.
 */
function extractRawIp(req: AnonymizableRequest): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  if (Array.isArray(xff) && xff.length > 0 && typeof xff[0] === 'string') {
    return xff[0].trim();
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

// ─── Middleware factory ───────────────────────────────────────────────────────

/**
 * Create the anonymize-request middleware with the given options.
 *
 * The returned function is an async Express-compatible middleware. Wire it as
 * the first middleware in your stack so no downstream handler ever sees the raw
 * identifying headers.
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { makeAnonymizeRequest } from './middleware/anonymizeRequest';
 *
 * const app = express();
 * app.use(makeAnonymizeRequest({ pepper: process.env.ANON_PEPPER }));
 * ```
 */
export function makeAnonymizeRequest(opts: AnonymizeRequestOptions = {}) {
  const pepper = opts.pepper ?? '';
  const stripHeaders = (opts.stripHeaders ?? DEFAULT_STRIP_HEADERS).map((h) => h.toLowerCase());

  if (!pepper) {
    // Startup diagnostic only — never includes PII. This runs once at init time,
    // not per-request, so it's safe to warn here. console.warn is in the ESLint allow-list.
    console.warn(
      '[anonymizeRequest] ANON_PEPPER is not set. ' +
        'Hashed IPs will use an empty pepper — insecure in production. ' +
        'Set ANON_PEPPER to a random 32+ byte secret.',
    );
  }

  return async function anonymizeRequest(
    req: AnonymizableRequest,
    res: AnonymizableResponse,
    next: NextFunction,
  ): Promise<void> {
    try {
      // 1. Hash before stripping (we need the raw value to hash it).
      const rawIp = extractRawIp(req);
      const anonIp = await hmacTruncated(pepper, rawIp, 16);

      // 2. Delete identifying headers. Do NOT log rawIp anywhere below this line.
      for (const header of stripHeaders) {
        delete req.headers[header];
      }

      // 3. Propagate the hashed identifier for downstream rate-limiting.
      req.headers['x-anon-ip'] = anonIp;
      res.setHeader('x-anon-ip', anonIp);
    } catch {
      // Hashing failure is unexpected (WebCrypto is always available in supported
      // environments) but should never crash the request. Pass through without
      // setting x-anon-ip so downstream can treat its absence as "unknown".
    }

    next();
  };
}

// ─── Exported types for test assertions ──────────────────────────────────────
export { DEFAULT_STRIP_HEADERS };
