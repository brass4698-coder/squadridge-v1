import { act, screen } from '@testing-library/react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithAuth } from '../test/renderWithAuth';
import { useSquadTyping } from './useSquadTyping';
import type { Database } from '../lib';

interface BroadcastChannelStub {
  broadcastListener: ((p: { payload: { user_id: string; at: number } }) => void) | null;
  sentPayloads: Array<{ user_id: string; at: number }>;
}

function makeBroadcastSupabase(): {
  client: SupabaseClient<Database>;
  channelStub: BroadcastChannelStub;
} {
  const channelStub: BroadcastChannelStub = {
    broadcastListener: null,
    sentPayloads: [],
  };

  const channel = {
    on(_event: string, _opts: { event: string }, cb: typeof channelStub.broadcastListener) {
      channelStub.broadcastListener = cb;
      return channel;
    },
    subscribe() {
      return channel;
    },
    send(msg: { type: string; event: string; payload: { user_id: string; at: number } }) {
      channelStub.sentPayloads.push(msg.payload);
      return Promise.resolve('ok');
    },
  };

  const client = {
    channel: vi.fn().mockReturnValue(channel),
    removeChannel: vi.fn().mockResolvedValue(undefined),
  } as unknown as SupabaseClient<Database>;

  return { client, channelStub };
}

function fakeSession(userId: string): Session {
  return { user: { id: userId } as Session['user'] } as Session;
}

function Harness({ squadId }: { squadId?: string }) {
  const { typing, notifyTyping } = useSquadTyping(squadId);
  return (
    <div>
      <button data-testid="notify" onClick={notifyTyping} type="button">
        notify
      </button>
      <ul>
        {Array.from(typing)
          .sort()
          .map((u) => (
            <li key={u} data-testid={`typing-${u}`}>
              {u}
            </li>
          ))}
      </ul>
    </div>
  );
}

/**
 * `waitFor` from RTL polls via real `setTimeout`, which deadlocks under
 * `vi.useFakeTimers()`. Each test below flushes effects manually with `act`
 * after enabling fake timers; that keeps the assertion path deterministic.
 */
async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('useSquadTyping', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throttles notifyTyping to one broadcast per SEND_THROTTLE_MS window', async () => {
    const { client, channelStub } = makeBroadcastSupabase();
    renderWithAuth(<Harness squadId="sq-1" />, client, fakeSession('u-local'));
    await flushEffects();

    const btn = screen.getByTestId('notify');
    act(() => btn.click());
    act(() => btn.click());
    act(() => btn.click());
    expect(channelStub.sentPayloads).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1_600);
    });
    act(() => btn.click());
    expect(channelStub.sentPayloads).toHaveLength(2);
  });

  it('updates typing set when a peer broadcast arrives, ignoring the local user', async () => {
    const { client, channelStub } = makeBroadcastSupabase();
    renderWithAuth(<Harness squadId="sq-1" />, client, fakeSession('u-local'));
    await flushEffects();
    expect(channelStub.broadcastListener).not.toBeNull();

    act(() => {
      channelStub.broadcastListener!({ payload: { user_id: 'u-peer', at: Date.now() } });
    });
    expect(screen.queryByTestId('typing-u-peer')).not.toBeNull();

    act(() => {
      channelStub.broadcastListener!({ payload: { user_id: 'u-local', at: Date.now() } });
    });
    expect(screen.queryByTestId('typing-u-local')).toBeNull();
  });

  it('prunes typing peers after TYPING_TTL_MS via the periodic interval', async () => {
    const { client, channelStub } = makeBroadcastSupabase();
    renderWithAuth(<Harness squadId="sq-1" />, client, fakeSession('u-local'));
    await flushEffects();
    expect(channelStub.broadcastListener).not.toBeNull();

    act(() => {
      channelStub.broadcastListener!({ payload: { user_id: 'u-peer', at: Date.now() } });
    });
    expect(screen.queryByTestId('typing-u-peer')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.queryByTestId('typing-u-peer')).toBeNull();
  });
});
