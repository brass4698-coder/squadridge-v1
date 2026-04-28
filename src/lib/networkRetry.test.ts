import { describe, expect, it, vi } from 'vitest';
import { isRetryableNetworkError, withBackoff } from './networkRetry';

describe('isRetryableNetworkError', () => {
  it('flags TypeError (offline / fetch failed) as retryable', () => {
    expect(isRetryableNetworkError(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('does not retry on AbortError', () => {
    const e = new Error('aborted');
    e.name = 'AbortError';
    expect(isRetryableNetworkError(e)).toBe(false);
  });

  it('retries on 5xx-shaped errors', () => {
    expect(isRetryableNetworkError(new Error('Edge returned 503 Service Unavailable'))).toBe(true);
  });

  it('does not retry on plain 4xx-shaped errors', () => {
    expect(isRetryableNetworkError(new Error('400 Bad Request'))).toBe(false);
  });
});

describe('withBackoff', () => {
  it('returns the resolved value on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    await expect(withBackoff(fn, { baseDelayMs: 1, maxDelayMs: 1 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries retryable errors up to maxAttempts and returns on success', async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('ok');
    const result = await withBackoff(fn, { baseDelayMs: 1, maxDelayMs: 1, maxAttempts: 4 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws the final error when retries are exhausted', async () => {
    const err = new TypeError('Failed to fetch');
    const fn = vi.fn().mockRejectedValue(err);
    await expect(withBackoff(fn, { baseDelayMs: 1, maxDelayMs: 1, maxAttempts: 3 })).rejects.toBe(
      err,
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry when shouldRetry returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('client error'));
    await expect(
      withBackoff(fn, { baseDelayMs: 1, maxDelayMs: 1, shouldRetry: () => false }),
    ).rejects.toThrow(/client error/);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('aborts before the next retry when the signal fires', async () => {
    const ac = new AbortController();
    const fn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const p = withBackoff(fn, {
      baseDelayMs: 50,
      maxDelayMs: 50,
      maxAttempts: 4,
      signal: ac.signal,
    });
    queueMicrotask(() => ac.abort());
    await expect(p).rejects.toMatchObject({ name: 'AbortError' });
  });
});
