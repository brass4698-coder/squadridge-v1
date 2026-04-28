/**
 * anonymizeRequest.test.ts
 *
 * Unit tests for src/middleware/anonymizeRequest.ts
 *
 * We test:
 *  1. IP headers are removed from the output Headers object.
 *  2. User-Agent is removed.
 *  3. x-anon-ip is set to a hash (24 hex chars), not the raw IP.
 *  4. The hash is consistent (same IP + pepper → same hash).
 *  5. The hash changes when the pepper changes (compartmentalization).
 *  6. Non-PII headers are preserved.
 *  7. If no IP header is present, anonIp is 'unknown'.
 *  8. The original Headers object is not mutated.
 *
 * Logger non-leakage: we assert that the test never emits the raw IP
 * string to console by spying on console.warn and console.error.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { anonymizeHeaders, extractClientIp, hashIpWithPepper } from './anonymizeRequest';

const TEST_IP = '203.0.113.42'; // TEST-NET-3, safe for docs
const TEST_PEPPER = 'test-pepper-do-not-use-in-prod';

describe('extractClientIp', () => {
  it('returns first IP from a single-entry x-forwarded-for', () => {
    expect(extractClientIp('203.0.113.42')).toBe('203.0.113.42');
  });

  it('returns first (client) IP from a chain', () => {
    expect(extractClientIp('203.0.113.42, 10.0.0.1, 172.16.0.1')).toBe('203.0.113.42');
  });

  it('trims whitespace', () => {
    expect(extractClientIp('  203.0.113.42  ')).toBe('203.0.113.42');
  });

  it('returns null for null input', () => {
    expect(extractClientIp(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractClientIp('')).toBeNull();
  });
});

describe('hashIpWithPepper', () => {
  it('returns a 24-character lowercase hex string', async () => {
    const hash = await hashIpWithPepper(TEST_IP, TEST_PEPPER);
    expect(hash).toHaveLength(24);
    expect(/^[0-9a-f]{24}$/.test(hash)).toBe(true);
  });

  it('is deterministic for the same IP and pepper', async () => {
    const a = await hashIpWithPepper(TEST_IP, TEST_PEPPER);
    const b = await hashIpWithPepper(TEST_IP, TEST_PEPPER);
    expect(a).toBe(b);
  });

  it('changes when the pepper changes (compartmentalization)', async () => {
    const a = await hashIpWithPepper(TEST_IP, 'pepper-a');
    const b = await hashIpWithPepper(TEST_IP, 'pepper-b');
    expect(a).not.toBe(b);
  });

  it('changes when the IP changes', async () => {
    const a = await hashIpWithPepper('203.0.113.1', TEST_PEPPER);
    const b = await hashIpWithPepper('203.0.113.2', TEST_PEPPER);
    expect(a).not.toBe(b);
  });

  it('does not embed the raw IP string in the output', async () => {
    const hash = await hashIpWithPepper(TEST_IP, TEST_PEPPER);
    expect(hash).not.toContain('203.0.113.42');
    expect(hash).not.toContain('203');
  });
});

describe('anonymizeHeaders', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console output to assert the raw IP never leaks to logs.
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes x-forwarded-for', async () => {
    const input = new Headers({ 'x-forwarded-for': TEST_IP, 'content-type': 'application/json' });
    const { headers } = await anonymizeHeaders(input, TEST_PEPPER);
    expect(headers.get('x-forwarded-for')).toBeNull();
  });

  it('removes x-real-ip', async () => {
    const input = new Headers({ 'x-real-ip': TEST_IP });
    const { headers } = await anonymizeHeaders(input, TEST_PEPPER);
    expect(headers.get('x-real-ip')).toBeNull();
  });

  it('removes user-agent', async () => {
    const input = new Headers({ 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const { headers } = await anonymizeHeaders(input, TEST_PEPPER);
    expect(headers.get('user-agent')).toBeNull();
  });

  it('removes cf-connecting-ip (Cloudflare)', async () => {
    const input = new Headers({ 'cf-connecting-ip': TEST_IP });
    const { headers } = await anonymizeHeaders(input, TEST_PEPPER);
    expect(headers.get('cf-connecting-ip')).toBeNull();
  });

  it('sets x-anon-ip to a 24-char hex hash, not the raw IP', async () => {
    const input = new Headers({ 'x-forwarded-for': TEST_IP });
    const { headers, anonIp } = await anonymizeHeaders(input, TEST_PEPPER);
    expect(headers.get('x-anon-ip')).toBe(anonIp);
    expect(anonIp).toHaveLength(24);
    expect(/^[0-9a-f]{24}$/.test(anonIp)).toBe(true);
    expect(anonIp).not.toContain('203.0.113.42');
  });

  it('returns anonIp=unknown when no IP header is present', async () => {
    const input = new Headers({ 'content-type': 'application/json' });
    const { anonIp, headers } = await anonymizeHeaders(input, TEST_PEPPER);
    expect(anonIp).toBe('unknown');
    expect(headers.get('x-anon-ip')).toBe('unknown');
  });

  it('preserves non-PII headers', async () => {
    const input = new Headers({
      'content-type': 'application/json',
      authorization: 'Bearer some-token',
      'x-forwarded-for': TEST_IP,
    });
    const { headers } = await anonymizeHeaders(input, TEST_PEPPER);
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('authorization')).toBe('Bearer some-token');
  });

  it('does not mutate the original Headers object', async () => {
    const input = new Headers({ 'x-forwarded-for': TEST_IP, 'user-agent': 'test-ua' });
    await anonymizeHeaders(input, TEST_PEPPER);
    // Original must still have the original headers.
    expect(input.get('x-forwarded-for')).toBe(TEST_IP);
    expect(input.get('user-agent')).toBe('test-ua');
  });

  it('does not leak the raw IP to console (logger spy)', async () => {
    const input = new Headers({ 'x-forwarded-for': TEST_IP });
    await anonymizeHeaders(input, TEST_PEPPER);
    const allWarnCalls = warnSpy.mock.calls.flat().join(' ');
    const allErrorCalls = errorSpy.mock.calls.flat().join(' ');
    expect(allWarnCalls).not.toContain(TEST_IP);
    expect(allErrorCalls).not.toContain(TEST_IP);
  });
});
