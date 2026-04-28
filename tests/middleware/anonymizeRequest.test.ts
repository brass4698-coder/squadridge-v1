/**
 * tests/middleware/anonymizeRequest.test.ts
 *
 * Unit tests for the anonymizeRequest middleware.
 * These tests assert that PII (IP, user-agent, forwarding headers) is never
 * written to the request object where downstream handlers or loggers can read it.
 *
 * Run with: npm test (vitest)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  anonymizeRequest,
  hashWithPepper,
  isPrivateIp,
  type MinimalRequest,
  type MinimalResponse,
} from '../../src/middleware/anonymizeRequest';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeReq(overrides: Partial<MinimalRequest> = {}): MinimalRequest {
  return {
    ip: '203.0.113.42',
    headers: {
      'user-agent': 'Mozilla/5.0 (Test)',
      'x-forwarded-for': '203.0.113.42, 10.0.0.1',
      'x-real-ip': '203.0.113.42',
      'cf-connecting-ip': '203.0.113.42',
      'content-type': 'application/json',
    },
    ...overrides,
  };
}

const mockRes: MinimalResponse = {};
const noopNext = vi.fn();

// ---------------------------------------------------------------------------
// isPrivateIp
// ---------------------------------------------------------------------------

describe('isPrivateIp', () => {
  it('returns true for 127.0.0.1', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
  });

  it('returns true for ::1', () => {
    expect(isPrivateIp('::1')).toBe(true);
  });

  it('returns true for IPv4-mapped loopback', () => {
    expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true);
  });

  it('returns true for 10.x.x.x', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true);
  });

  it('returns true for 192.168.x.x', () => {
    expect(isPrivateIp('192.168.1.100')).toBe(true);
  });

  it('returns true for 172.16.x.x–172.31.x.x', () => {
    expect(isPrivateIp('172.16.0.1')).toBe(true);
    expect(isPrivateIp('172.31.255.255')).toBe(true);
  });

  it('returns false for 172.15.x.x (not RFC-1918)', () => {
    expect(isPrivateIp('172.15.0.1')).toBe(false);
  });

  it('returns false for a public IP', () => {
    expect(isPrivateIp('203.0.113.42')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isPrivateIp('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hashWithPepper
// ---------------------------------------------------------------------------

describe('hashWithPepper', () => {
  it('returns a non-empty string', () => {
    expect(hashWithPepper('1.2.3.4').length).toBeGreaterThan(0);
  });

  it('returns a string of 16 hex characters', () => {
    const h = hashWithPepper('1.2.3.4');
    expect(h).toMatch(/^[0-9a-f]{16}$/);
  });

  it('produces different hashes for different inputs', () => {
    expect(hashWithPepper('1.2.3.4')).not.toBe(hashWithPepper('5.6.7.8'));
  });

  it('is deterministic for the same input and pepper', () => {
    expect(hashWithPepper('1.2.3.4')).toBe(hashWithPepper('1.2.3.4'));
  });

  it('does NOT return the original IP in the hash', () => {
    const ip = '203.0.113.42';
    expect(hashWithPepper(ip)).not.toContain(ip);
  });
});

// ---------------------------------------------------------------------------
// anonymizeRequest middleware
// ---------------------------------------------------------------------------

describe('anonymizeRequest middleware', () => {
  it('calls next()', () => {
    const next = vi.fn();
    anonymizeRequest(makeReq(), mockRes, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('attaches anonMeta to the request', () => {
    const req = makeReq();
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.anonMeta).toBeDefined();
    expect(typeof req.anonMeta!.anonIp).toBe('string');
    expect(req.anonMeta!.anonIp.length).toBeGreaterThan(0);
  });

  it('anonIp does NOT contain the raw IP', () => {
    const req = makeReq({ ip: '203.0.113.42' });
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.anonMeta!.anonIp).not.toContain('203.0.113.42');
  });

  it('marks private IPs as isPrivateNetwork: true', () => {
    const req = makeReq({ ip: '192.168.1.1' });
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.anonMeta!.isPrivateNetwork).toBe(true);
  });

  it('marks public IPs as isPrivateNetwork: false', () => {
    const req = makeReq({ ip: '203.0.113.42' });
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.anonMeta!.isPrivateNetwork).toBe(false);
  });

  it('removes user-agent header', () => {
    const req = makeReq();
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.headers['user-agent']).toBeUndefined();
  });

  it('removes x-forwarded-for header', () => {
    const req = makeReq();
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.headers['x-forwarded-for']).toBeUndefined();
  });

  it('removes x-real-ip header', () => {
    const req = makeReq();
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.headers['x-real-ip']).toBeUndefined();
  });

  it('removes cf-connecting-ip header', () => {
    const req = makeReq();
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.headers['cf-connecting-ip']).toBeUndefined();
  });

  it('removes x-client-ip header', () => {
    const req = makeReq({ headers: { 'x-client-ip': '1.2.3.4' } });
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.headers['x-client-ip']).toBeUndefined();
  });

  it('preserves non-PII headers (e.g. content-type)', () => {
    const req = makeReq();
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.headers['content-type']).toBe('application/json');
  });

  it('handles missing ip gracefully (uses empty string for hash)', () => {
    const req = makeReq({ ip: undefined, socket: undefined });
    expect(() => anonymizeRequest(req, mockRes, noopNext)).not.toThrow();
    expect(req.anonMeta).toBeDefined();
  });

  it('falls back to socket.remoteAddress when req.ip is absent', () => {
    const req = makeReq({ ip: undefined, socket: { remoteAddress: '10.0.0.1' } });
    anonymizeRequest(req, mockRes, noopNext);
    expect(req.anonMeta!.isPrivateNetwork).toBe(true);
  });
});
