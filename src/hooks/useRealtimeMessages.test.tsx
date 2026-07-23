import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js';
import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../contexts/AuthContext';
import { AuthContext } from '../contexts/AuthContext';
import { queryKeys } from '../lib';
import { createSupabaseMessagesStub, type MessageRow } from '../test/createSupabaseMessagesStub';
import { MESSAGES_PAGE_SIZE, useRealtimeMessages } from './useRealtimeMessages';

function baseRow(partial: Partial<MessageRow> & Pick<MessageRow, 'id' | 'sent_at'>): MessageRow {
  return {
    squad_id: partial.squad_id ?? 'squad-1',
    sender_id: partial.sender_id ?? 'user-1',
    payload_ciphertext: partial.payload_ciphertext ?? 'enc',
    status: partial.status ?? 'sent',
    ...partial,
  };
}

function TestHarness({ squadId }: { squadId?: string }) {
  const { messages, loading, error, refresh, realtimeStatus } = useRealtimeMessages(squadId);
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error ?? ''}</div>
      <div data-testid="realtime-status">{realtimeStatus}</div>
      <div data-testid="count">{messages.length}</div>
      <ol data-testid="order">
        {messages.map((m) => (
          <li key={m.id} data-testid={`msg-${m.id}`}>
            {m.payload_ciphertext}
          </li>
        ))}
      </ol>
      <button type="button" data-testid="refresh" onClick={() => void refresh()}>
        refresh
      </button>
    </div>
  );
}

function PaginationHarness({ squadId }: { squadId?: string }) {
  const { messages, loading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useRealtimeMessages(squadId);
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="has-next">{String(hasNextPage)}</div>
      <div data-testid="fetching-next">{String(isFetchingNextPage)}</div>
      <div data-testid="count">{messages.length}</div>
      <ol data-testid="order">
        {messages.map((m) => (
          <li key={m.id} data-testid={`msg-${m.id}`}>
            {m.payload_ciphertext}
          </li>
        ))}
      </ol>
      <button type="button" data-testid="fetch-more" onClick={() => void fetchNextPage()}>
        older
      </button>
    </div>
  );
}

function RetryHarness({ squadId }: { squadId?: string }) {
  const { messages, loading, error, realtimeError, retryRealtimeConnection, realtimeStatus } =
    useRealtimeMessages(squadId);
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error ?? ''}</div>
      <div data-testid="realtime-error">{realtimeError ?? ''}</div>
      <div data-testid="realtime-status">{realtimeStatus}</div>
      <div data-testid="count">{messages.length}</div>
      <ol data-testid="order">
        {messages.map((m) => (
          <li key={m.id} data-testid={`msg-${m.id}`}>
            {m.payload_ciphertext}
          </li>
        ))}
      </ol>
      <button type="button" data-testid="retry-realtime" onClick={() => retryRealtimeConnection()}>
        retry realtime
      </button>
    </div>
  );
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithAuth(ui: ReactElement, supabase: AuthContextValue['supabase']) {
  const queryClient = createTestQueryClient();
  const value: AuthContextValue = {
    session: null,
    user: null,
    loading: false,
    supabase,
    supabaseClientInitError: null,
    sessionError: null,
    ensureAnonymousSession: async () => {},
    signIn: async () => ({ error: null }),
    signOut: async () => {},
    profile: null,
    roles: [],
    initialized: true,
    refreshProfile: async () => {},
    refreshRoles: async () => {},
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{ui}</AuthContext.Provider>
    </QueryClientProvider>,
  );
}

/** Avoid flaky `isPending` on CI: hydrate the infinite query cache so realtime retry logic is tested in isolation. */
function renderRetryHarnessWithCachedWindow(
  supabase: AuthContextValue['supabase'],
  squadId: string,
  windowRows: MessageRow[],
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
      mutations: { retry: false },
    },
  });
  const key = queryKeys.messages.list(squadId);
  queryClient.setQueryData<InfiniteData<MessageRow[], undefined>>(key, {
    pages: [windowRows],
    pageParams: [undefined],
  });
  const value: AuthContextValue = {
    session: null,
    user: null,
    loading: false,
    supabase,
    supabaseClientInitError: null,
    sessionError: null,
    ensureAnonymousSession: async () => {},
    signIn: async () => ({ error: null }),
    signOut: async () => {},
    profile: null,
    roles: [],
    initialized: true,
    refreshProfile: async () => {},
    refreshRoles: async () => {},
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>
        <RetryHarness squadId={squadId} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('useRealtimeMessages', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('loads messages from the initial query when squadId and supabase are set', async () => {
    const initial = [
      baseRow({ id: 'a', sent_at: '2025-01-01T00:00:00.000Z', payload_ciphertext: 'first' }),
      baseRow({ id: 'b', sent_at: '2025-01-02T00:00:00.000Z', payload_ciphertext: 'second' }),
    ];
    const stub = createSupabaseMessagesStub({ initialMessages: initial });
    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('error').textContent).toBe('');
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('msg-a').textContent).toBe('first');
    expect(screen.getByTestId('msg-b').textContent).toBe('second');
  });

  it('clears messages and stops loading when squadId is missing', async () => {
    const stub = createSupabaseMessagesStub({
      initialMessages: [baseRow({ id: 'a', sent_at: '2025-01-01T00:00:00.000Z' })],
    });
    renderWithAuth(<TestHarness squadId={undefined} />, stub);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('inserts new rows in sent_at order and keeps existing ordering stable', async () => {
    const stub = createSupabaseMessagesStub({
      initialMessages: [
        baseRow({ id: 'early', sent_at: '2025-01-01T10:00:00.000Z', payload_ciphertext: 'A' }),
        baseRow({ id: 'late', sent_at: '2025-01-03T10:00:00.000Z', payload_ciphertext: 'C' }),
      ],
    });
    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    stub.emitInsert(
      baseRow({
        id: 'mid',
        sent_at: '2025-01-02T10:00:00.000Z',
        payload_ciphertext: 'B',
      }),
    );

    await waitFor(() => {
      const items = screen.getByTestId('order').querySelectorAll('li');
      expect(items.length).toBe(3);
      expect([...items].map((el) => el.textContent)).toEqual(['A', 'B', 'C']);
    });
  });

  it('updates an existing row in place by id', async () => {
    const stub = createSupabaseMessagesStub({
      initialMessages: [
        baseRow({ id: 'x', sent_at: '2025-01-01T00:00:00.000Z', payload_ciphertext: 'old' }),
      ],
    });
    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('msg-x').textContent).toBe('old');

    stub.emitUpdate(
      baseRow({
        id: 'x',
        sent_at: '2025-01-01T00:00:00.000Z',
        payload_ciphertext: 'new',
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId('msg-x').textContent).toBe('new');
    });
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('deduplicates INSERT events when the row id already exists', async () => {
    const row = baseRow({
      id: 'dup',
      sent_at: '2025-01-01T12:00:00.000Z',
      payload_ciphertext: 'once',
    });
    const stub = createSupabaseMessagesStub({ initialMessages: [row] });
    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('count').textContent).toBe('1');

    stub.emitInsert({ ...row, payload_ciphertext: 'duplicate-attempt' });

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1');
    });
    expect(screen.getByTestId('msg-dup').textContent).toBe('once');
  });

  it('surfaces query errors and clears messages', async () => {
    const stub = createSupabaseMessagesStub({
      initialMessages: [baseRow({ id: 'a', sent_at: '2025-01-01T00:00:00.000Z' })],
      queryError: { message: 'permission denied' },
    });
    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('error').textContent).toBe('permission denied');
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('backfills newer rows after a failed subscribe and delayed resubscribe', async () => {
    const initial = [
      baseRow({
        id: 'a',
        sent_at: '2025-01-01T10:00:00.000Z',
        payload_ciphertext: 'first',
      }),
    ];
    const backfill = [
      baseRow({
        id: 'b',
        sent_at: '2025-01-03T10:00:00.000Z',
        payload_ciphertext: 'after-gap',
      }),
    ];

    const stub = createSupabaseMessagesStub({
      initialMessages: initial,
      backfillMessages: backfill,
      firstSubscribeStatus: REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR,
    });

    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await waitFor(() => {
      expect(screen.getByTestId('realtime-status').textContent).toBe('reconnecting');
    });

    await waitFor(
      () => {
        expect(screen.getByTestId('realtime-status').textContent).toBe('live');
      },
      { timeout: 5_000 },
    );

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('2');
    });

    expect(screen.getByTestId('msg-b').textContent).toBe('after-gap');
  });

  it('retryRealtimeConnection resubscribes after fatal subscribe errors', async () => {
    const origSetTimeout = globalThis.setTimeout.bind(globalThis);
    const seq = [
      ...Array.from({ length: 7 }, () => REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR),
      REALTIME_SUBSCRIBE_STATES.SUBSCRIBED,
    ];
    const initialRow = baseRow({
      id: 'a',
      sent_at: '2025-01-01T10:00:00.000Z',
      payload_ciphertext: 'first',
    });
    const stub = createSupabaseMessagesStub({
      initialMessages: [initialRow],
      subscribeStatusSequence: seq,
    });

    renderRetryHarnessWithCachedWindow(stub, 'squad-1', [initialRow]);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('count').textContent).toBe('1');

    vi.stubGlobal('setTimeout', (fn: TimerHandler, delay?: number, ...args: unknown[]) => {
      const ms = typeof delay === 'number' ? delay : 0;
      // Match `BASE_DELAY_MS` (1000) from the hook — collapse realtime backoffs only, keep 400ms catch-up.
      const useDelay = ms >= 1000 ? 0 : ms;
      return origSetTimeout(fn, useDelay, ...args) as ReturnType<typeof setTimeout>;
    });

    try {
      // Pump macrotasks until fatal state (status + copy), not only non-empty `realtime-error`.
      let sawFatal = false;
      for (let i = 0; i < 2000; i++) {
        await act(async () => {
          await new Promise<void>((r) => origSetTimeout(r, 0));
        });
        const msg = screen.getByTestId('realtime-error').textContent ?? '';
        const status = screen.getByTestId('realtime-status').textContent;
        if (
          (status === 'connection_error' || status === 'offline') &&
          /Connection error|Offline/.test(msg)
        ) {
          sawFatal = true;
          break;
        }
      }
      expect(sawFatal).toBe(true);

      const fatalMsg = screen.getByTestId('realtime-error').textContent ?? '';
      expect(fatalMsg).toMatch(/Connection error|Offline/);
      const fatalStatus = screen.getByTestId('realtime-status').textContent;
      expect(fatalStatus === 'connection_error' || fatalStatus === 'offline').toBe(true);

      await act(async () => {
        fireEvent.click(screen.getByTestId('retry-realtime'));
      });

      for (let i = 0; i < 400; i++) {
        await act(async () => {
          await new Promise<void>((r) => origSetTimeout(r, 0));
        });
        if (screen.getByTestId('realtime-status').textContent === 'live') break;
      }

      expect(screen.getByTestId('realtime-status').textContent).toBe('live');
      expect(screen.getByTestId('realtime-error').textContent).toBe('');
      expect(stub.removedChannels.length).toBeGreaterThan(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('loads older pages via messages_older_than when fetchNextPage is called', async () => {
    const rows: MessageRow[] = [];
    for (let i = 0; i < MESSAGES_PAGE_SIZE + 5; i++) {
      rows.push(
        baseRow({
          id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
          sent_at: new Date(Date.UTC(2025, 0, 1, 12, 0, i)).toISOString(),
          payload_ciphertext: `m${i}`,
        }),
      );
    }
    const stub = createSupabaseMessagesStub({ initialMessages: rows });
    renderWithAuth(<PaginationHarness squadId="squad-1" />, stub);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('count').textContent).toBe(String(MESSAGES_PAGE_SIZE));
    expect(screen.getByTestId('has-next').textContent).toBe('true');

    await act(async () => {
      fireEvent.click(screen.getByTestId('fetch-more'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe(String(rows.length));
    });
    expect(screen.getByTestId('has-next').textContent).toBe('false');
    expect(screen.getByTestId(`msg-${rows[0]!.id}`).textContent).toBe('m0');
  });

  it('catch-up backfill runs after visibility change (debounced)', async () => {
    const initial = [
      baseRow({
        id: 'a',
        sent_at: '2025-01-01T10:00:00.000Z',
        payload_ciphertext: 'first',
      }),
    ];
    const backfill = [
      baseRow({
        id: 'b',
        sent_at: '2025-01-03T10:00:00.000Z',
        payload_ciphertext: 'after-gap',
      }),
    ];

    const stub = createSupabaseMessagesStub({
      initialMessages: initial,
      backfillMessages: backfill,
    });

    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('count').textContent).toBe('1');

    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await waitFor(
      () => {
        expect(screen.getByTestId('count').textContent).toBe('2');
      },
      { timeout: 4_000 },
    );
    expect(screen.getByTestId('msg-b').textContent).toBe('after-gap');
  });
});

afterEach(() => {
  vi.useRealTimers();
});
