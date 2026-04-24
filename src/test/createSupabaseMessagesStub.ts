import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib';

export type MessageRow = Database['public']['Tables']['messages']['Row'];

/** Oldest-first (matches SQL `ORDER BY sent_at ASC, id ASC`). */
function cmpSentAtId(a: MessageRow, b: MessageRow): number {
  const ta = new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime();
  if (ta !== 0) return ta;
  return a.id.localeCompare(b.id);
}

/** Newest-first for window selection (matches `ORDER BY sent_at DESC, id DESC`). */
function cmpSentAtIdDesc(a: MessageRow, b: MessageRow): number {
  return -cmpSentAtId(a, b);
}

function strictlyOlderThan(m: MessageRow, sentAt: string, id: string): boolean {
  const ta = new Date(m.sent_at).getTime();
  const tb = new Date(sentAt).getTime();
  if (ta < tb) return true;
  if (ta > tb) return false;
  return m.id < id;
}

/** Mimic `messages_latest_window`: newest `limit` rows, returned chronological ascending. */
function rpcLatestWindow(rows: MessageRow[], limit: number): MessageRow[] {
  const sorted = [...rows].sort(cmpSentAtIdDesc);
  const win = sorted.slice(0, Math.max(0, limit));
  return win.sort(cmpSentAtId);
}

/** Mimic `messages_older_than`: strictly before cursor, newest `limit`, chronological ascending. */
function rpcOlderThan(rows: MessageRow[], sentAt: string, id: string, limit: number): MessageRow[] {
  const older = rows.filter((m) => strictlyOlderThan(m, sentAt, id));
  const sorted = [...older].sort(cmpSentAtIdDesc);
  const win = sorted.slice(0, Math.max(0, limit));
  return win.sort(cmpSentAtId);
}

/**
 * Minimal in-memory Supabase stub for testing {@link useRealtimeMessages}:
 * supports RPC pagination (`messages_latest_window` / `messages_older_than`), `messages` select chain
 * for `gt` backfill, realtime channel, INSERT/UPDATE handlers.
 */
export function createSupabaseMessagesStub(options: {
  initialMessages?: MessageRow[];
  /** Rows for `.eq(...).gt('sent_at', ...).order(...)` used after reconnect backfill. */
  backfillMessages?: MessageRow[];
  queryError?: { message: string } | null;
  /**
   * First `RealtimeChannel.subscribe()` invocation receives this status (e.g. `CHANNEL_ERROR`);
   * subsequent invocations receive `SUBSCRIBED`. Used to exercise reconnect + backfill in tests.
   */
  firstSubscribeStatus?: string;
  /**
   * Nth `subscribe()` callback receives `subscribeStatusSequence[n - 1]` (clamped to the last entry).
   * When set, overrides {@link firstSubscribeStatus} for all calls. Use for fatal-retry tests.
   */
  subscribeStatusSequence?: string[];
}) {
  let onInsert: ((payload: { new: MessageRow }) => void) | undefined;
  let onUpdate: ((payload: { new: MessageRow }) => void) | undefined;
  let subscribeCallCount = 0;

  const stub = {
    initialMessages: options.initialMessages ?? [],
    backfillMessages: options.backfillMessages ?? [],
    queryError: options.queryError ?? (null as { message: string } | null),
    removedChannels: [] as unknown[],

    rpc(
      fn: string,
      _params: Record<string, unknown> | undefined,
    ): Promise<{ data: unknown; error: { message: string } | null }> {
      if (stub.queryError) {
        return Promise.resolve({ data: null, error: stub.queryError });
      }
      if (fn === 'messages_latest_window') {
        const p = _params as { p_limit?: number } | undefined;
        const lim = typeof p?.p_limit === 'number' ? p.p_limit : 40;
        return Promise.resolve({
          data: rpcLatestWindow(stub.initialMessages, lim),
          error: null,
        });
      }
      if (fn === 'messages_older_than') {
        const p = _params as { p_sent_at?: string; p_id?: string; p_limit?: number } | undefined;
        const sentAt = p?.p_sent_at ?? '';
        const id = p?.p_id ?? '';
        const lim = typeof p?.p_limit === 'number' ? p.p_limit : 40;
        return Promise.resolve({
          data: rpcOlderThan(stub.initialMessages, sentAt, id, lim),
          error: null,
        });
      }
      return Promise.resolve({
        data: null,
        error: { message: `unknown rpc: ${fn}` },
      });
    },

    from(_table: string) {
      return {
        select(_cols: string) {
          return {
            eq(_col: string, _val: string) {
              return {
                gt(_col2: string, _val2: string) {
                  return {
                    order(_col3: string, _opts: { ascending: boolean }) {
                      return Promise.resolve({
                        data: [...stub.backfillMessages],
                        error: stub.queryError,
                      });
                    },
                  };
                },
                order(_col2: string, _opts: { ascending: boolean }) {
                  return Promise.resolve({
                    data: [...stub.initialMessages],
                    error: stub.queryError,
                  });
                },
              };
            },
          };
        },
      };
    },

    channel(_name: string) {
      const ch = {
        on(
          _event: string,
          config: { event: string },
          callback: (payload: { new: MessageRow }) => void,
        ) {
          if (config.event === 'INSERT') onInsert = callback;
          if (config.event === 'UPDATE') onUpdate = callback;
          return ch;
        },
        subscribe(cb?: (status: string) => void) {
          if (typeof cb === 'function') {
            subscribeCallCount += 1;
            const call = subscribeCallCount;
            // Macrotask (not queueMicrotask) so hook retry `setTimeout` delays can run between status deliveries.
            setTimeout(() => {
              const seq = options.subscribeStatusSequence;
              const status =
                seq && seq.length > 0
                  ? (seq[Math.min(call - 1, seq.length - 1)] ??
                    REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
                  : call === 1 && options.firstSubscribeStatus
                    ? options.firstSubscribeStatus
                    : REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
              cb(status);
            }, 0);
          }
          return ch;
        },
      };
      return ch;
    },

    removeChannel(ch: unknown) {
      stub.removedChannels.push(ch);
      return Promise.resolve();
    },

    emitInsert(row: MessageRow) {
      onInsert?.({ new: row });
    },

    emitUpdate(row: MessageRow) {
      onUpdate?.({ new: row });
    },
  };

  return stub as unknown as SupabaseClient<Database>;
}
