import { MATCHMAKING_SIDE_SIZE } from './matchmakingConstants';

/** How many more waiters are needed on each side before a match can form (minimum per side). */
export function matchPoolDeficit(
  waitingA: number,
  waitingB: number,
  sideSize: number = MATCHMAKING_SIDE_SIZE,
): {
  needA: number;
  needB: number;
} {
  return {
    needA: Math.max(0, sideSize - waitingA),
    needB: Math.max(0, sideSize - waitingB),
  };
}

/**
 * Short user-facing hint — heuristic only (actual match timing depends on server pool logic).
 */
export function formatMatchWaitHint(
  waitingA: number,
  waitingB: number,
  queuePosition: number,
  sideSize: number = MATCHMAKING_SIDE_SIZE,
): string {
  const { needA, needB } = matchPoolDeficit(waitingA, waitingB, sideSize);
  if (needA === 0 && needB === 0) {
    return 'Pool is ready to form squads as soon as the matcher runs — hang tight.';
  }
  const parts: string[] = [];
  if (needA > 0) {
    parts.push(`at least ${needA} more on perspective A`);
  }
  if (needB > 0) {
    parts.push(`at least ${needB} more on perspective B`);
  }
  const need = parts.join(' and ');
  return `Rough estimate: we still need ${need} (${sideSize} per side). Your position in line: ${queuePosition}.`;
}
