import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

export type MessageRow = Database['public']['Tables']['messages']['Row'];

function sortMessagesAsc(rows: MessageRow[]): MessageRow[] {
  return [...rows].sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
  );
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
}) {
  let onInsert: ((payload: { new: MessageRow }) => void) | undefined;
  let onUpdate: ((payload: { new: MessageRow }) => void) | undefined;
  let subscribeCallCount = 0;

  const stub = {
    initialMessages: options.initialMessages ?? [],
    backfillMessages: options.backfillMessages ?? [],
    queryError: options.queryError ?? null as { message: string } | null,
    removedChannels: [] as unknown[],

    rpc(
      fn: string,
      _params: Record<string, unknown> | undefined,
    ): Promise<{ data: unknown; error: { message: string } | null }> {
      if (stub.queryError) {
        return Promise.resolve({ data: null, error: stub.queryError });
      }
      if (fn === 'messages_latest_window') {
        return Promise.resolve({
          data: sortMessagesAsc(stub.initialMessages),
          error: null,
        });
      }
      if (fn === 'messages_older_than') {
        return Promise.resolve({ data: [], error: null });
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
            queueMicrotask(() => {
              const status =
                call === 1 && options.firstSubscribeStatus
                  ? options.firstSubscribeStatus
                  : REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
              cb(status);
            });
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
