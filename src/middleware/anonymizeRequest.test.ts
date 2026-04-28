/**
 * @vitest-environment jsdom
 *
 * Unit tests for the request-anonymisation utilities.
 *
 * Asserts that:
 *  - Sensitive headers (IP, User-Agent, Cookie, Authorization, etc.) are removed.
 *  - The raw IP is never present in the returned context.
 *  - The anonIp is a 16-character hex string (truncated HMAC hash).
 *  - Extra headers supplied by the caller are also redacted.
 *  - Non-sensitive headers pass through unchanged.
 *  - Works with both plain Record<string,string> and Fetch-API Headers objects.
 *  - Works with a Fetch-API Request object.
 */
import { describe, expect, it } from 'vitest';
import { anonymizeRequest, anonymizeRequestHeaders, hashWithPepper } from './anonymizeRequest';

// ── hashWithPepper ────────────────────────────────────────────────────────────

describe('hashWithPepper', () => {
  it('returns a 16-character hex string', async () => {
    const result = await hashWithPepper('192.168.1.1', 'test-pepper');
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });

  it('returns a 16-character hex string when pepper is empty', async () => {
    const result = await hashWithPepper('10.0.0.1', '');
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });

  it('produces a different hash for different IPs (same pepper)', async () => {
    const h1 = await hashWithPepper('1.2.3.4', 'pepper');
    const h2 = await hashWithPepper('5.6.7.8', 'pepper');
    expect(h1).not.toBe(h2);
  });

  it('produces a different hash for same IP with different pepper', async () => {
    const h1 = await hashWithPepper('1.2.3.4', 'pepper-a');
    const h2 = await hashWithPepper('1.2.3.4', 'pepper-b');
    expect(h1).not.toBe(h2);
  });

  it('is deterministic (same input → same output)', async () => {
    const h1 = await hashWithPepper('1.2.3.4', 'stable-pepper');
    const h2 = await hashWithPepper('1.2.3.4', 'stable-pepper');
    expect(h1).toBe(h2);
  });

  it('never returns the raw IP in the hash output', async () => {
    const ip = '203.0.113.1';
    const result = await hashWithPepper(ip, 'test');
    expect(result).not.toContain(ip);
    expect(result).not.toContain('203');
  });
});

// ── anonymizeRequestHeaders ──────────────────────────────────────────────────

describe('anonymizeRequestHeaders (plain record)', () => {
  const sensitiveHeaders: Record<string, string> = {
    'content-type': 'application/json',
    'user-agent': 'Mozilla/5.0 (Test)',
    cookie: 'session=abc123',
    authorization: 'Bearer eyJhbGc...',
    'x-forwarded-for': '203.0.113.1, 10.0.0.1',
    'cf-connecting-ip': '203.0.113.1',
    'x-real-ip': '203.0.113.1',
    'accept-language': 'en-US',
  };

  it('removes user-agent from headers', async () => {
    const ctx = await anonymizeRequestHeaders(sensitiveHeaders, '203.0.113.1');
    expect(ctx.headers).not.toHaveProperty('user-agent');
  });

  it('removes cookie from headers', async () => {
    const ctx = await anonymizeRequestHeaders(sensitiveHeaders, '203.0.113.1');
    expect(ctx.headers).not.toHaveProperty('cookie');
  });

  it('removes authorization from headers', async () => {
    const ctx = await anonymizeRequestHeaders(sensitiveHeaders, '203.0.113.1');
    expect(ctx.headers).not.toHaveProperty('authorization');
  });

  it('removes x-forwarded-for from headers', async () => {
    const ctx = await anonymizeRequestHeaders(sensitiveHeaders, null);
    expect(ctx.headers).not.toHaveProperty('x-forwarded-for');
  });

  it('removes cf-connecting-ip from headers', async () => {
    const ctx = await anonymizeRequestHeaders(sensitiveHeaders, null);
    expect(ctx.headers).not.toHaveProperty('cf-connecting-ip');
  });

  it('removes x-real-ip from headers', async () => {
    const ctx = await anonymizeRequestHeaders(sensitiveHeaders, null);
    expect(ctx.headers).not.toHaveProperty('x-real-ip');
  });

  it('keeps non-sensitive headers (content-type, accept-language)', async () => {
    const ctx = await anonymizeRequestHeaders(sensitiveHeaders, null);
    expect(ctx.headers['content-type']).toBe('application/json');
    expect(ctx.headers['accept-language']).toBe('en-US');
  });

  it('returns anonIp as a 16-char hex string when IP is provided', async () => {
    const ctx = await anonymizeRequestHeaders(sensitiveHeaders, '203.0.113.1', {
      pepper: 'unit-test-pepper',
    });
    expect(ctx.anonIp).toMatch(/^[0-9a-f]{16}$/);
  });

  it('does not include the raw IP in anonIp', async () => {
    const ip = '198.51.100.42';
    const ctx = await anonymizeRequestHeaders({}, ip, { pepper: 'p' });
    expect(ctx.anonIp).not.toContain(ip);
    expect(ctx.anonIp).not.toContain('198');
  });

  it('returns anonIp null when no IP provided', async () => {
    const ctx = await anonymizeRequestHeaders({}, null);
    expect(ctx.anonIp).toBeNull();
  });

  it('redacts extra sensitive headers specified by caller', async () => {
    const ctx = await anonymizeRequestHeaders(
      { 'x-custom-secret': 'topsecret', 'content-type': 'text/plain' },
      null,
      { extraSensitiveHeaders: ['x-custom-secret'] },
    );
    expect(ctx.headers).not.toHaveProperty('x-custom-secret');
    expect(ctx.headers['content-type']).toBe('text/plain');
  });
});

describe('anonymizeRequestHeaders (Fetch Headers object)', () => {
  it('removes sensitive headers from a Headers instance', async () => {
    const headers = new Headers({
      'user-agent': 'TestBot/1.0',
      cookie: 'tok=xyz',
      'x-request-id': 'req-001',
    });
    const ctx = await anonymizeRequestHeaders(headers, null);
    expect(ctx.headers).not.toHaveProperty('user-agent');
    expect(ctx.headers).not.toHaveProperty('cookie');
    expect(ctx.headers['x-request-id']).toBe('req-001');
  });
});

// ── anonymizeRequest (Fetch Request) ────────────────────────────────────────

describe('anonymizeRequest (Fetch Request)', () => {
  it('extracts IP from cf-connecting-ip and hashes it', async () => {
    const req = new Request('https://example.com/api', {
      headers: {
        'cf-connecting-ip': '203.0.113.99',
        'user-agent': 'CF-Worker/1',
      },
    });
    const ctx = await anonymizeRequest(req, { pepper: 'edge-pepper' });
    expect(ctx.anonIp).toMatch(/^[0-9a-f]{16}$/);
    expect(ctx.anonIp).not.toContain('203');
    expect(ctx.headers).not.toHaveProperty('user-agent');
    expect(ctx.headers).not.toHaveProperty('cf-connecting-ip');
  });

  it('falls back to x-forwarded-for first hop when cf-connecting-ip absent', async () => {
    const req = new Request('https://example.com/', {
      headers: {
        'x-forwarded-for': '10.0.0.1, 192.168.1.1',
      },
    });
    const ctx = await anonymizeRequest(req, { pepper: 'p' });
    // Should hash the first hop (10.0.0.1), not the full string
    expect(ctx.anonIp).toMatch(/^[0-9a-f]{16}$/);
  });

  it('returns anonIp null when no IP headers present', async () => {
    const req = new Request('https://example.com/');
    const ctx = await anonymizeRequest(req);
    expect(ctx.anonIp).toBeNull();
  });

  it('logs do not contain raw IP (simulated log assertion)', async () => {
    const rawIp = '198.51.100.7';
    const req = new Request('https://example.com/', {
      headers: { 'cf-connecting-ip': rawIp },
    });
    const ctx = await anonymizeRequest(req, { pepper: 'logtest' });

    // Simulate what a logger would record
    const logEntry = JSON.stringify({
      ip: ctx.anonIp,
      headers: ctx.headers,
    });

    expect(logEntry).not.toContain(rawIp);
    expect(logEntry).not.toContain('198.51.100');
  });
});
