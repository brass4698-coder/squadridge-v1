import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPseudonymMap, resolveRoomPseudonymSecret } from './roomScoped';

const minimalCtx = { roomId: 'room-1' };

describe('resolveRoomPseudonymSecret', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns trimmed secret when provided', () => {
    expect(
      resolveRoomPseudonymSecret(
        { ...minimalCtx, roomPseudonymSecret: '  abc  ' },
        { modeOverride: 'production' },
      ),
    ).toBe('abc');
  });

  it('throws in production mode when secret missing', () => {
    expect(() => resolveRoomPseudonymSecret(minimalCtx, { modeOverride: 'production' })).toThrow(
      /Missing required roomPseudonymSecret/,
    );
  });

  it('allows insecure dev fallback in test mode with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const s = resolveRoomPseudonymSecret(minimalCtx, { modeOverride: 'test' });
    expect(s).toBe('dev-only-insecure-default');
    expect(warn).toHaveBeenCalled();
  });

  it('allows insecure dev fallback in development mode', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const s = resolveRoomPseudonymSecret(minimalCtx, { modeOverride: 'development' });
    expect(s).toBe('dev-only-insecure-default');
  });

  it('staging mode without secret throws (preview-like)', () => {
    expect(() => resolveRoomPseudonymSecret(minimalCtx, { modeOverride: 'staging' })).toThrow(
      /Missing required roomPseudonymSecret/,
    );
  });
});

describe('createPseudonymMap', () => {
  it('fails closed when simulating production without secret', async () => {
    await expect(
      createPseudonymMap(minimalCtx, ['u1'], { modeOverride: 'production' }),
    ).rejects.toThrow(/Missing required roomPseudonymSecret/);
  });

  it('still produces deterministic map when secret set (production-safe)', async () => {
    const m = await createPseudonymMap(
      { roomId: 'r', roomPseudonymSecret: 'proper-secret-key' },
      ['b', 'a'],
      { modeOverride: 'production' },
    );
    expect(m).toHaveLength(2);
    expect(m.map((x) => x.userId).sort()).toEqual(['a', 'b']);
  });
});
