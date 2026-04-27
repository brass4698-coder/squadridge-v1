import { hmacSha256Hex } from '../hash';
import type { PseudonymMapEntry, RedactionContext } from '../types';

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
): Promise<PseudonymMapEntry[]> {
  const secret = ctx.roomPseudonymSecret ?? 'dev-only-insecure-default';
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
