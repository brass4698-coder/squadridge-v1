import { describe, expect, it, beforeEach } from 'vitest';
import { buildIdempotencyKey, clearIdempotencyKey, rememberIdempotencyKey } from './idempotency';

describe('idempotency helpers', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('builds keys without empty segments', () => {
    expect(buildIdempotencyKey(['pull-back', 'msg-1', null, ''])).toBe('pull-back:msg-1');
  });

  it('remembers a session key until cleared', () => {
    const a = rememberIdempotencyKey('op:1', () => 'generated-a');
    const b = rememberIdempotencyKey('op:1', () => 'generated-b');
    expect(a).toBe('generated-a');
    expect(b).toBe('generated-a');
    clearIdempotencyKey('op:1');
    const c = rememberIdempotencyKey('op:1', () => 'generated-c');
    expect(c).toBe('generated-c');
  });
});
