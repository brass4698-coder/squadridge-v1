import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../contexts/AuthContext';
import { AuthContext } from '../contexts/AuthContext';
import {
  createSupabaseMessagesStub,
  type MessageRow,
} from '../test/createSupabaseMessagesStub';
import { useRealtimeMessages } from './useRealtimeMessages';

function baseRow(partial: Partial<MessageRow> & Pick<MessageRow, 'id' | 'sent_at'>): MessageRow {
  return {
    squad_id: partial.squad_id ?? 'squad-1',
    sender_id: partial.sender_id ?? 'user-1',
    encrypted_content: partial.encrypted_content ?? 'enc',
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
            {m.encrypted_content}
          </li>
        ))}
      </ol>
      <button type="button" data-testid="refresh" onClick={() => void refresh()}>
        refresh
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
            {m.encrypted_content}
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
    ensureAnonymousSession: async () => {},
    signIn: async () => ({ error: null }),
    signOut: async () => {},
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{ui}</AuthContext.Provider>
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
      baseRow({ id: 'a', sent_at: '2025-01-01T00:00:00.000Z', encrypted_content: 'first' }),
      baseRow({ id: 'b', sent_at: '2025-01-02T00:00:00.000Z', encrypted_content: 'second' }),
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
        baseRow({ id: 'early', sent_at: '2025-01-01T10:00:00.000Z', encrypted_content: 'A' }),
        baseRow({ id: 'late', sent_at: '2025-01-03T10:00:00.000Z', encrypted_content: 'C' }),
      ],
    });
    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    stub.emitInsert(
      baseRow({
        id: 'mid',
        sent_at: '2025-01-02T10:00:00.000Z',
        encrypted_content: 'B',
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
        baseRow({ id: 'x', sent_at: '2025-01-01T00:00:00.000Z', encrypted_content: 'old' }),
      ],
    });
    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('msg-x').textContent).toBe('old');

    stub.emitUpdate(
      baseRow({
        id: 'x',
        sent_at: '2025-01-01T00:00:00.000Z',
        encrypted_content: 'new',
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
      encrypted_content: 'once',
    });
    const stub = createSupabaseMessagesStub({ initialMessages: [row] });
    renderWithAuth(<TestHarness squadId="squad-1" />, stub);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('count').textContent).toBe('1');

    stub.emitInsert({ ...row, encrypted_content: 'duplicate-attempt' });

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
        encrypted_content: 'first',
      }),
    ];
    const backfill = [
      baseRow({
        id: 'b',
        sent_at: '2025-01-03T10:00:00.000Z',
        encrypted_content: 'after-gap',
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
    vi.stubGlobal(
      'setTimeout',
      (fn: TimerHandler, _delay?: number, ...args: unknown[]) =>
        origSetTimeout(fn, 0, ...args) as ReturnType<typeof setTimeout>,
    );

    try {
      const seq = [
        ...Array.from({ length: 7 }, () => REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR),
        REALTIME_SUBSCRIBE_STATES.SUBSCRIBED,
      ];
      const stub = createSupabaseMessagesStub({
        initialMessages: [
          baseRow({ id: 'a', sent_at: '2025-01-01T10:00:00.000Z', encrypted_content: 'first' }),
        ],
        subscribeStatusSequence: seq,
      });

      renderWithAuth(<RetryHarness squadId="squad-1" />, stub);

      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

      for (let i = 0; i < 250; i++) {
        await act(async () => {
          await new Promise<void>((r) => origSetTimeout(r, 0));
        });
        if (screen.getByTestId('realtime-error').textContent) break;
      }

      expect(screen.getByTestId('realtime-error').textContent).toContain('Realtime connection lost');
      expect(screen.getByTestId('realtime-status').textContent).toBe('offline');

      await act(async () => {
        fireEvent.click(screen.getByTestId('retry-realtime'));
      });

      for (let i = 0; i < 80; i++) {
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

  it('catch-up backfill runs after visibility change (debounced)', async () => {
    const initial = [
      baseRow({
        id: 'a',
        sent_at: '2025-01-01T10:00:00.000Z',
        encrypted_content: 'first',
      }),
    ];
    const backfill = [
      baseRow({
        id: 'b',
        sent_at: '2025-01-03T10:00:00.000Z',
        encrypted_content: 'after-gap',
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
