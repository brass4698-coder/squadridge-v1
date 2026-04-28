/**
 * @vitest-environment node
 *
 * anonymizeRequest.test.ts — unit tests for the anonymize-request middleware
 *
 * Test strategy:
 *   1. PII headers are stripped from the request before any downstream handler
 *      sees them.
 *   2. x-anon-ip is set on both request and response after the middleware runs.
 *   3. The middleware never passes raw IP values to any logging function.
 *
 * We test with a simple mock req/res/next — no real Express app needed.
 * The logger spy asserts that no raw IP value was passed to a hypothetical
 * logger. In the production implementation, replace the spy with your actual
 * structured logger (e.g. src/lib/log.ts on the server side).
 */
import { describe, it, expect, vi } from 'vitest';
import { makeAnonymizeRequest, DEFAULT_STRIP_HEADERS } from '../../src/middleware/anonymizeRequest';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeReq(
  headers: Record<string, string | string[] | undefined> = {},
  remoteAddress = '203.0.113.1',
) {
  return {
    headers: { ...headers },
    socket: { remoteAddress },
  };
}

function makeRes() {
  const headers: Record<string, string | number> = {};
  const statusCode = { value: 200 };
  return {
    headers,
    statusCode,
    setHeader(name: string, value: string | number) {
      headers[name.toLowerCase()] = value;
    },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('makeAnonymizeRequest', () => {
  const PEPPER = 'test-pepper-32-bytes-random-data!';

  it('sets x-anon-ip on the request headers after middleware runs', async () => {
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(typeof req.headers['x-anon-ip']).toBe('string');
    // 16 hex chars truncated from HMAC-SHA256
    expect(req.headers['x-anon-ip']).toMatch(/^[0-9a-f]{16}$/);
  });

  it('sets x-anon-ip on the response too', async () => {
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(res.headers['x-anon-ip']).toMatch(/^[0-9a-f]{16}$/);
  });

  it('removes all default PII headers from the request', async () => {
    const sensitiveHeaders: Record<string, string> = {};
    for (const h of DEFAULT_STRIP_HEADERS) {
      sensitiveHeaders[h] = 'sensitive-value';
    }
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    const req = makeReq(sensitiveHeaders);
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    for (const h of DEFAULT_STRIP_HEADERS) {
      expect(req.headers[h]).toBeUndefined();
    }
  });

  it('removes user-agent specifically', async () => {
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    const req = makeReq({ 'user-agent': 'Mozilla/5.0 (Test)' });
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(req.headers['user-agent']).toBeUndefined();
  });

  it('removes x-forwarded-for specifically', async () => {
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    const req = makeReq({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1' });
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(req.headers['x-forwarded-for']).toBeUndefined();
  });

  it('produces the same hash for the same IP + pepper (deterministic)', async () => {
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    const req1 = makeReq({ 'x-forwarded-for': '203.0.113.42' });
    const req2 = makeReq({ 'x-forwarded-for': '203.0.113.42' });
    const res1 = makeRes();
    const res2 = makeRes();
    const next = vi.fn();

    await mw(req1, res1, next);
    await mw(req2, res2, next);

    expect(req1.headers['x-anon-ip']).toBe(req2.headers['x-anon-ip']);
  });

  it('produces a different hash for a different IP (pepper same)', async () => {
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    const req1 = makeReq({ 'x-forwarded-for': '203.0.113.1' });
    const req2 = makeReq({ 'x-forwarded-for': '203.0.113.2' });
    const res1 = makeRes();
    const res2 = makeRes();
    const next = vi.fn();

    await mw(req1, res1, next);
    await mw(req2, res2, next);

    expect(req1.headers['x-anon-ip']).not.toBe(req2.headers['x-anon-ip']);
  });

  it('produces a different hash for the same IP but a different pepper (pepper rotation)', async () => {
    const mw1 = makeAnonymizeRequest({ pepper: 'pepper-A-32-bytes-random-data!!' });
    const mw2 = makeAnonymizeRequest({ pepper: 'pepper-B-32-bytes-random-data!!' });
    const req1 = makeReq({ 'x-forwarded-for': '203.0.113.1' });
    const req2 = makeReq({ 'x-forwarded-for': '203.0.113.1' });
    const res1 = makeRes();
    const res2 = makeRes();
    const next = vi.fn();

    await mw1(req1, res1, next);
    await mw2(req2, res2, next);

    expect(req1.headers['x-anon-ip']).not.toBe(req2.headers['x-anon-ip']);
  });

  it('does NOT expose raw IP in any value logged via the logger spy', async () => {
    // We simulate a downstream middleware that logs the request headers.
    // The assertion is that the raw IP never appears in those log calls.
    const rawIp = '192.168.99.100';
    const logger = vi.fn();
    const mw = makeAnonymizeRequest({ pepper: PEPPER });

    const req = makeReq({ 'x-forwarded-for': rawIp });
    const res = makeRes();
    const next = vi.fn(() => {
      // Simulate downstream code logging the (now-anonymized) headers.
      logger(JSON.stringify(req.headers));
    });

    await mw(req, res, next);

    // The downstream logger should have been called...
    expect(logger).toHaveBeenCalled();
    // ...but must NOT have received the raw IP anywhere.
    const loggedValue = logger.mock.calls[0]?.[0] ?? '';
    expect(loggedValue).not.toContain(rawIp);
    // The x-anon-ip hash should be present instead.
    expect(loggedValue).toContain(req.headers['x-anon-ip']);
  });

  it('falls back to socket.remoteAddress when x-forwarded-for is absent', async () => {
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    // No x-forwarded-for header — rely on socket address
    const req = makeReq({}, '10.0.0.99');
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(req.headers['x-anon-ip']).toMatch(/^[0-9a-f]{16}$/);
  });

  it('still calls next() even if socket.remoteAddress is undefined', async () => {
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    const req = {
      headers: {} as Record<string, string | string[] | undefined>,
      socket: {},
    };
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('preserves non-PII headers (e.g. content-type, accept)', async () => {
    const mw = makeAnonymizeRequest({ pepper: PEPPER });
    const req = makeReq({
      'content-type': 'application/json',
      accept: 'application/json',
    });
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(req.headers['content-type']).toBe('application/json');
    expect(req.headers['accept']).toBe('application/json');
  });
});
