export type MatchPerspective = 'A' | 'B';

const POOL_KEY = 'squadridge_match_pool_key';
const SIDE_KEY = 'squadridge_match_side';

export function setMatchmakingSession(poolKey: string, side: MatchPerspective): void {
  try {
    sessionStorage.setItem(POOL_KEY, poolKey);
    sessionStorage.setItem(SIDE_KEY, side);
  } catch {
    /* ignore */
  }
}

export function readMatchmakingSession(): { poolKey: string; side: MatchPerspective } | null {
  try {
    const poolKey = sessionStorage.getItem(POOL_KEY);
    const side = sessionStorage.getItem(SIDE_KEY);
    if (!poolKey || (side !== 'A' && side !== 'B')) return null;
    return { poolKey, side };
  } catch {
    return null;
  }
}

export function clearMatchmakingSession(): void {
  try {
    sessionStorage.removeItem(POOL_KEY);
    sessionStorage.removeItem(SIDE_KEY);
  } catch {
    /* ignore */
  }
}
