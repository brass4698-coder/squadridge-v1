import { hmacSha256Hex } from '../hash';
import type { PseudonymMapEntry, RedactionContext } from '../types';

/** Insecure placeholder — only permitted in `development` or `test` mode when secret is omitted. */
const DEV_FALLBACK_PSEUDONYM_SECRET = 'dev-only-insecure-default';

export type PseudonymResolutionOptions = {
  /**
   * For unit tests only: simulate Vite `import.meta.env.MODE` (`production`, `development`, `test`).
   * Production callers must omit this so real mode is used.
   */
  modeOverride?: string;
};

/**
 * Resolves HMAC secret for room-scoped pseudonyms. Fails closed in production/preview builds
 * when `roomPseudonymSecret` is missing so mappings are not keyed with a guessable default.
 */
export function resolveRoomPseudonymSecret(
  ctx: RedactionContext,
  options?: PseudonymResolutionOptions,
): string {
  const trimmed = ctx.roomPseudonymSecret?.trim();
  if (trimmed) return trimmed;

  const mode = options?.modeOverride ?? import.meta.env.MODE;

  if (mode === 'development' || mode === 'test') {
    console.warn(
      '[squadridge/redaction-engine] Missing roomPseudonymSecret — using insecure dev-only pseudonym derivation. Set context.roomPseudonymSecret before production.',
    );
    return DEV_FALLBACK_PSEUDONYM_SECRET;
  }

  throw new Error(
    'Missing required roomPseudonymSecret — cannot generate stable room pseudonyms outside development/test builds.',
  );
}

const LABELS = [
  'participant-a',
  'participant-b',
  'participant-c',
  'participant-d',
  'participant-e',
  'participant-f',
  'participant-g',
  'participant-h',
];

/**
 * Room-scoped stable pseudonyms from keyed HMAC ordering.
 * Same inputs always yield the same labels; different rooms differ with high probability.
 */
export async function createPseudonymMap(
  ctx: RedactionContext,
  participantUserIds: string[],
  options?: PseudonymResolutionOptions,
): Promise<PseudonymMapEntry[]> {
  const secret = resolveRoomPseudonymSecret(ctx, options);
  const room = ctx.roomId;
  const unique = [...new Set(participantUserIds)].filter(Boolean);
  const scored: { userId: string; score: string }[] = [];
  for (const userId of unique) {
    const score = await hmacSha256Hex(secret, `${room}\0${userId}`);
    scored.push({ userId, score });
  }
  scored.sort((a, b) => a.score.localeCompare(b.score));
  return scored.map((s, i) => ({
    userId: s.userId,
    label: LABELS[i] ?? `participant-${i + 1}`,
    opaqueToken: s.score.slice(0, 24),
  }));
}

export function labelForUser(
  map: PseudonymMapEntry[],
  userId: string | undefined,
): string | undefined {
  if (!userId) return undefined;
  return map.find((e) => e.userId === userId)?.label;
}
