import { describe, expect, it } from 'vitest';
import { parseSnapshot } from './matchmakingClient';

describe('parseSnapshot', () => {
  it('parses a matched snapshot', () => {
    const snap = parseSnapshot({
      outcome: 'matched',
      squad_id: 'sq-1',
      pool_key: 'pk-1',
    });
    expect(snap).toEqual({ outcome: 'matched', squad_id: 'sq-1', pool_key: 'pk-1' });
  });

  it('parses an idle snapshot', () => {
    const snap = parseSnapshot({ outcome: 'idle', pool_key: 'pk-2' });
    expect(snap).toEqual({ outcome: 'idle', pool_key: 'pk-2' });
  });

  it('parses a queued snapshot and coerces numeric strings', () => {
    const snap = parseSnapshot({
      outcome: 'queued',
      pool_key: 'pk-3',
      side: 'A',
      waiting_a: '2',
      waiting_b: 1,
      queue_position: '3',
    });
    expect(snap).toEqual({
      outcome: 'queued',
      pool_key: 'pk-3',
      side: 'A',
      waiting_a: 2,
      waiting_b: 1,
      queue_position: 3,
    });
  });

  it('throws in test/dev when pool_key is missing (was silently coerced before)', () => {
    expect(() => parseSnapshot({ outcome: 'idle' })).toThrow();
  });

  it('throws on unknown outcome', () => {
    expect(() => parseSnapshot({ outcome: 'bogus', pool_key: 'pk' })).toThrow();
  });

  it('throws when queued snapshot side is invalid', () => {
    expect(() =>
      parseSnapshot({
        outcome: 'queued',
        pool_key: 'pk-3',
        side: 'C',
        waiting_a: 0,
        waiting_b: 0,
        queue_position: 1,
      }),
    ).toThrow();
  });

  it('throws on null / non-object input', () => {
    expect(() => parseSnapshot(null)).toThrow();
    expect(() => parseSnapshot('string')).toThrow();
    expect(() => parseSnapshot(42)).toThrow();
  });
});
