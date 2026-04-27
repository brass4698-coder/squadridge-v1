import { describe, expect, it } from 'vitest';
import { detectEmails } from './email';

describe('detectEmails', () => {
  it('finds a standard address', () => {
    const text = 'Ping me at jane.doe@example.com tomorrow.';
    const hits = detectEmails(text);
    expect(hits).toHaveLength(1);
    expect(hits[0].span).toEqual({ start: 11, end: 31 });
    expect(text.slice(hits[0].span.start, hits[0].span.end)).toBe('jane.doe@example.com');
  });

  it('returns empty when none', () => {
    expect(detectEmails('no emails here')).toEqual([]);
  });
});
