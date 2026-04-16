import { describe, expect, it } from 'vitest';
import {
  MATCHED_SQUAD_TTL_HOURS,
  MATCHMAKING_SIDE_SIZE,
  MATCHMAKING_SQUAD_TOTAL,
} from './matchmakingConstants';

describe('matchmakingConstants', () => {
  it('matches SQL matcher shape (2+2 in a pool)', () => {
    expect(MATCHMAKING_SIDE_SIZE).toBe(2);
    expect(MATCHMAKING_SQUAD_TOTAL).toBe(MATCHMAKING_SIDE_SIZE * 2);
  });

  it('squad TTL matches migration (1 day)', () => {
    expect(MATCHED_SQUAD_TTL_HOURS).toBe(24);
  });
});
