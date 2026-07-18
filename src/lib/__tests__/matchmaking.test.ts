import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  cancelMatchmaking,
  enqueueMatchmaking,
  pollMatchmakingSnapshot,
} from '../matchmakingClient';
import {
  defaultMatchQueueExpiresAt,
  filterUnexpiredMatchQueueRows,
  isMatchQueueExpired,
  MATCH_QUEUE_TTL_DAYS,
} from '../matchmakingQueue';

vi.mock('../rateLimitEdge', () => ({
  assertEdgeRateLimit: vi.fn().mockResolvedValue(undefined),
}));

function rpcMock(payload: { data: unknown; error: unknown }) {
  return vi.fn().mockResolvedValue(payload);
}

describe('matchmakingClient queue insert (RPC)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enqueueMatchmaking calls matchmaking_enqueue_and_try and parses queued snapshot', async () => {
    const rpc = rpcMock({
      data: {
        outcome: 'queued',
        pool_key: 'region:demo',
        side: 'A',
        waiting_a: 1,
        waiting_b: 0,
        queue_position: 1,
      },
      error: null,
    });
    const supabase = { rpc } as unknown as SupabaseClient;

    const snap = await enqueueMatchmaking(supabase, 'region:demo', 'A');

    expect(rpc).toHaveBeenCalledWith('matchmaking_enqueue_and_try', {
      p_pool_key: 'region:demo',
      p_side: 'A',
    });
    expect(snap).toEqual({
      outcome: 'queued',
      pool_key: 'region:demo',
      side: 'A',
      waiting_a: 1,
      waiting_b: 0,
      queue_position: 1,
    });
  });

  it('enqueueMatchmaking surfaces matched squad_id from the RPC', async () => {
    const rpc = rpcMock({
      data: {
        outcome: 'matched',
        squad_id: '11111111-1111-4111-8111-111111111111',
        pool_key: 'default',
      },
      error: null,
    });
    const supabase = { rpc } as unknown as SupabaseClient;

    await expect(enqueueMatchmaking(supabase, 'default', 'B')).resolves.toEqual({
      outcome: 'matched',
      squad_id: '11111111-1111-4111-8111-111111111111',
      pool_key: 'default',
    });
  });

  it('pollMatchmakingSnapshot and cancelMatchmaking hit the expected RPCs', async () => {
    const rpc = rpcMock({ data: { outcome: 'idle', pool_key: 'p1' }, error: null });
    const supabase = { rpc } as unknown as SupabaseClient;

    await expect(pollMatchmakingSnapshot(supabase, 'p1')).resolves.toEqual({
      outcome: 'idle',
      pool_key: 'p1',
    });
    expect(rpc).toHaveBeenCalledWith('matchmaking_pool_snapshot', { p_pool_key: 'p1' });

    rpc.mockResolvedValueOnce({ data: null, error: null });
    await cancelMatchmaking(supabase, 'p1');
    expect(rpc).toHaveBeenCalledWith('matchmaking_cancel_waiting', { p_pool_key: 'p1' });
  });
});

describe('match_queue expire logic (mirrors sweep_matchmaking_queue)', () => {
  const now = Date.parse('2026-07-18T12:00:00.000Z');

  it('defaultMatchQueueExpiresAt is TTL days after enqueue', () => {
    const expires = defaultMatchQueueExpiresAt(now);
    expect(Date.parse(expires) - now).toBe(MATCH_QUEUE_TTL_DAYS * 24 * 60 * 60 * 1000);
  });

  it('isMatchQueueExpired matches expires_at < now()', () => {
    expect(isMatchQueueExpired('2026-07-18T11:59:59.000Z', now)).toBe(true);
    expect(isMatchQueueExpired('2026-07-18T12:00:00.000Z', now)).toBe(false);
    expect(isMatchQueueExpired(null, now)).toBe(false);
  });

  it('filterUnexpiredMatchQueueRows drops expired rows like the SQL sweep', () => {
    const rows = [
      { id: 'alive', user_id: 'u1', expires_at: '2026-07-25T12:00:00.000Z' },
      { id: 'dead', user_id: 'u2', expires_at: '2026-07-01T00:00:00.000Z' },
      { id: 'no-ttl', user_id: 'u3', expires_at: null },
    ];
    expect(filterUnexpiredMatchQueueRows(rows, now).map((r) => r.id)).toEqual(['alive', 'no-ttl']);
  });
});
