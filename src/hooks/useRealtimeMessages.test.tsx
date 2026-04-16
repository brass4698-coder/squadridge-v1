import { render, screen, waitFor } from '@testing-library/react';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
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
});
