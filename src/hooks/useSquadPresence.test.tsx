import { act, screen, waitFor } from '@testing-library/react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { renderWithAuth } from '../test/renderWithAuth';
import { useSquadPresence } from './useSquadPresence';
import type { Database } from '../lib';

interface PresenceChannelStub {
  trackedPayloads: Array<Record<string, unknown>>;
  syncListener: (() => void) | null;
  state: Record<string, Array<{ user_id: string; online_at: string }>>;
}

function makePresenceSupabase(): {
  client: SupabaseClient<Database>;
  channelStub: PresenceChannelStub;
  removed: number;
} {
  const channelStub: PresenceChannelStub = {
    trackedPayloads: [],
    syncListener: null,
    state: {},
  };
  const counters = { removed: 0 };

  const channel = {
    on(_event: string, _opts: { event: string }, cb: () => void) {
      channelStub.syncListener = cb;
      return channel;
    },
    subscribe(cb?: (status: string) => void) {
      // Match Supabase's async callback contract.
      Promise.resolve().then(() => cb?.('SUBSCRIBED'));
      return channel;
    },
    track(payload: Record<string, unknown>) {
      channelStub.trackedPayloads.push(payload);
      return Promise.resolve();
    },
    untrack() {
      return Promise.resolve();
    },
    presenceState<T = unknown>(): Record<string, T[]> {
      return channelStub.state as unknown as Record<string, T[]>;
    },
  };

  const client = {
    channel: vi.fn().mockReturnValue(channel),
    removeChannel: vi.fn().mockImplementation(() => {
      counters.removed += 1;
      return Promise.resolve();
    }),
  } as unknown as SupabaseClient<Database>;

  return {
    client,
    channelStub,
    get removed() {
      return counters.removed;
    },
  } as unknown as {
    client: SupabaseClient<Database>;
    channelStub: PresenceChannelStub;
    removed: number;
  };
}

function fakeSession(userId: string): Session {
  return {
    user: { id: userId } as Session['user'],
  } as Session;
}

function Harness({ squadId }: { squadId?: string }) {
  const present = useSquadPresence(squadId);
  return (
    <ul>
      {Array.from(present)
        .sort()
        .map((u) => (
          <li key={u} data-testid={`present-${u}`}>
            {u}
          </li>
        ))}
    </ul>
  );
}

describe('useSquadPresence', () => {
  it('does not subscribe without a squadId or user session', () => {
    const { client } = makePresenceSupabase();
    renderWithAuth(<Harness squadId={undefined} />, client, fakeSession('u-1'));
    expect((client.channel as unknown as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
  });

  it('subscribes to squad-presence:<squadId> with the local user id as key', async () => {
    const { client } = makePresenceSupabase();
    renderWithAuth(<Harness squadId="sq-1" />, client, fakeSession('u-local'));

    await waitFor(() => {
      const call = (client.channel as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call?.[0]).toBe('squad-presence:sq-1');
      expect(call?.[1]).toEqual({ config: { presence: { key: 'u-local' } } });
    });
  });

  it('publishes the deduplicated set of present user ids on the next presence sync', async () => {
    const { client, channelStub } = makePresenceSupabase();
    renderWithAuth(<Harness squadId="sq-1" />, client, fakeSession('u-local'));

    await waitFor(() => {
      expect(channelStub.syncListener).not.toBeNull();
    });

    channelStub.state = {
      'u-local': [{ user_id: 'u-local', online_at: 'now' }],
      'u-peer': [{ user_id: 'u-peer', online_at: 'now' }],
      'u-empty': [],
    };
    act(() => channelStub.syncListener!());

    await waitFor(() => {
      expect(screen.queryByTestId('present-u-local')).not.toBeNull();
      expect(screen.queryByTestId('present-u-peer')).not.toBeNull();
      // Empty meta arrays must NOT count as present.
      expect(screen.queryByTestId('present-u-empty')).toBeNull();
    });
  });

  it('removes the channel when the component unmounts', async () => {
    const { client } = makePresenceSupabase();
    const { unmount } = renderWithAuth(<Harness squadId="sq-1" />, client, fakeSession('u-local'));
    await waitFor(() => {
      expect((client.channel as unknown as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1);
    });
    unmount();
    expect(client.removeChannel as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(1);
  });
});
