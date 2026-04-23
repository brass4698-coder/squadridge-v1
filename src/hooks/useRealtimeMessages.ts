import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js';
import { useAuth } from '../contexts/AuthContext';
import { addConnectionBreadcrumb, appendConnectionLog, queryKeys, type Database } from '../lib';

type MessageRow = Database['public']['Tables']['messages']['Row'];

/** High-level websocket / channel state for UI (banners, status). */
export type RealtimeConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'offline'
  /** Subscribe failed after retries while the browser still reports online. */
  | 'connection_error';

const MAX_RETRIES = 6;
const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;
export const MESSAGES_PAGE_SIZE = 40;

function mergeRowsById(prev: MessageRow[], incoming: MessageRow[]): MessageRow[] {
  const byId = new Map<string, MessageRow>();
  for (const m of prev) {
    byId.set(m.id, m);
  }
  for (const row of incoming) {
    byId.set(row.id, row);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
  );
}

/** Stable identity for cache rows — must reflect any field we surface from realtime/query merges. */
function messageRowFingerprint(m: MessageRow): string {
  return [
    m.id,
    m.squad_id ?? '',
    m.sender_id ?? '',
    m.payload_ciphertext,
    m.sent_at,
    m.status,
  ].join('\u0001');
}

function flattenPagesFingerprint(data: InfiniteData<MessageRow[], unknown> | undefined): string {
  if (!data?.pages.length) return '';
  const parts: string[] = [];
  for (let pi = data.pages.length - 1; pi >= 0; pi--) {
    for (const m of data.pages[pi]!) {
      parts.push(messageRowFingerprint(m));
    }
  }
  return parts.join('\u0002');
}

function flattenPagesFromData(data: InfiniteData<MessageRow[], unknown> | undefined): MessageRow[] {
  if (!data?.pages.length) return [];
  return data.pages.slice().reverse().flat();
}

type PageCursor = { sent_at: string; id: string };

export function useRealtimeMessages(squadId: string | undefined) {
  const queryClient = useQueryClient();
  const { supabase } = useAuth();
  const listKey = queryKeys.messages.list(squadId);

  const [realtimeFatalError, setRealtimeFatalError] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeConnectionStatus>('idle');
  const [subscriptionEpoch, setSubscriptionEpoch] = useState(0);

  const mountedRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | undefined>(undefined);
  const maxSentAtRef = useRef<string | null>(null);
  const shouldBackfillOnSubscribeRef = useRef(false);
  const catchUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flattenedMessagesCacheRef = useRef<{ fp: string; list: MessageRow[] }>({
    fp: '',
    list: [],
  });

  const messagesQuery = useInfiniteQuery({
    queryKey: listKey,
    initialPageParam: undefined as PageCursor | undefined,
    queryFn: async ({ pageParam }) => {
      if (!supabase || !squadId) return [];
      if (!pageParam) {
        const { data, error: qError } = await supabase.rpc('messages_latest_window', {
          p_squad_id: squadId,
          p_limit: MESSAGES_PAGE_SIZE,
        });
        if (qError) throw new Error(qError.message);
        return data ?? [];
      }
      const { data, error: qError } = await supabase.rpc('messages_older_than', {
        p_squad_id: squadId,
        p_sent_at: pageParam.sent_at,
        p_id: pageParam.id,
        p_limit: MESSAGES_PAGE_SIZE,
      });
      if (qError) throw new Error(qError.message);
      return data ?? [];
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.length || lastPage.length < MESSAGES_PAGE_SIZE) return undefined;
      const oldest = lastPage[0]!;
      return { sent_at: oldest.sent_at, id: oldest.id };
    },
    enabled: !!supabase && !!squadId,
  });

  const messages = useMemo(() => {
    const data = messagesQuery.data as InfiniteData<MessageRow[], unknown> | undefined;
    const fp = flattenPagesFingerprint(data);
    if (!fp) {
      flattenedMessagesCacheRef.current = { fp: '', list: [] };
      return [];
    }
    const prev = flattenedMessagesCacheRef.current;
    if (fp === prev.fp) {
      return prev.list;
    }
    const list = flattenPagesFromData(data);
    flattenedMessagesCacheRef.current = { fp, list };
    return list;
  }, [messagesQuery.data]);

  useEffect(() => {
    if (messages.length === 0) {
      maxSentAtRef.current = null;
      return;
    }
    let max = messages[0]!.sent_at;
    for (let i = 1; i < messages.length; i++) {
      if (new Date(messages[i]!.sent_at) > new Date(max)) {
        max = messages[i]!.sent_at;
      }
    }
    maxSentAtRef.current = max;
  }, [messages]);

  const applyLocalMessage = useCallback(
    (row: MessageRow) => {
      if (!squadId) return;
      const key = queryKeys.messages.list(squadId);
      queryClient.setQueryData(key, (old: InfiniteData<MessageRow[], unknown> | undefined) => {
        if (!old?.pages.length) {
          return {
            pageParams: [undefined],
            pages: [[row]],
          } as InfiniteData<MessageRow[], unknown>;
        }
        const pages = [...old.pages];
        const li = pages.length - 1;
        const last = pages[li] ?? [];
        if (last.some((m) => m.id === row.id)) return old;
        pages[li] = [...last, row].sort(
          (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
        );
        return { ...old, pages };
      });
    },
    [queryClient, squadId],
  );

  const backfillAfterReconnect = useCallback(async () => {
    if (!supabase || !squadId || !mountedRef.current) return;

    const max = maxSentAtRef.current;
    let query = supabase.from('messages').select('*').eq('squad_id', squadId);
    if (max) {
      query = query.gt('sent_at', max);
    }
    const { data, error: qError } = await query.order('sent_at', { ascending: true });

    if (!mountedRef.current) return;
    if (qError) {
      console.warn('[useRealtimeMessages] backfill after reconnect failed:', qError.message);
      return;
    }
    if (!data?.length) return;

    const key = queryKeys.messages.list(squadId);
    queryClient.setQueryData(key, (old: InfiniteData<MessageRow[], unknown> | undefined) => {
      if (!old?.pages.length) {
        return {
          pageParams: [undefined],
          pages: [mergeRowsById([], data)],
        } as InfiniteData<MessageRow[], unknown>;
      }
      const pages = [...old.pages];
      const li = pages.length - 1;
      pages[li] = mergeRowsById(pages[li] ?? [], data);
      return { ...old, pages };
    });
  }, [supabase, squadId, queryClient]);

  const refresh = useCallback(async () => {
    if (!supabase || !squadId) {
      queryClient.removeQueries({ queryKey: listKey });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: listKey });
  }, [supabase, squadId, queryClient, listKey]);

  const retryRealtimeConnection = useCallback(() => {
    setRealtimeFatalError(null);
    retryCountRef.current = 0;
    setReconnecting(true);
    setRealtimeStatus('connecting');
    setSubscriptionEpoch((n) => n + 1);
  }, []);

  const scheduleCatchUpBackfill = useCallback(() => {
    if (catchUpTimerRef.current !== null) {
      clearTimeout(catchUpTimerRef.current);
    }
    catchUpTimerRef.current = setTimeout(() => {
      catchUpTimerRef.current = null;
      if (!mountedRef.current) return;
      void backfillAfterReconnect();
    }, 400);
  }, [backfillAfterReconnect]);

  /** When the tab becomes visible or the browser reports online, fetch any messages missed while realtime was down or flaky. */
  useEffect(() => {
    const runIfVisible = () => {
      if (document.visibilityState !== 'visible') return;
      scheduleCatchUpBackfill();
    };
    const onOnline = () => scheduleCatchUpBackfill();

    document.addEventListener('visibilitychange', runIfVisible);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', runIfVisible);
      window.removeEventListener('online', onOnline);
      if (catchUpTimerRef.current !== null) {
        clearTimeout(catchUpTimerRef.current);
        catchUpTimerRef.current = null;
      }
    };
  }, [scheduleCatchUpBackfill]);

  useEffect(() => {
    if (!squadId) {
      setRealtimeStatus('idle');
      setRealtimeFatalError(null);
      setReconnecting(false);
    }
  }, [squadId]);

  /** Browser offline/online: surface `offline` in UI and resubscribe when the network returns. */
  useEffect(() => {
    if (!supabase || !squadId) return;

    const onOffline = () => {
      setReconnecting(false);
      setRealtimeStatus('offline');
    };

    const onOnline = () => {
      setRealtimeFatalError(null);
      retryCountRef.current = 0;
      setReconnecting(true);
      setRealtimeStatus('connecting');
      setSubscriptionEpoch((n) => n + 1);
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      onOffline();
    }

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [supabase, squadId]);

  useEffect(() => {
    if (!supabase || !squadId) return;

    mountedRef.current = true;
    const offlineNow = typeof navigator !== 'undefined' && !navigator.onLine;
    setRealtimeStatus(offlineNow ? 'offline' : 'connecting');
    retryCountRef.current = 0;
    shouldBackfillOnSubscribeRef.current = false;
    setRealtimeFatalError(null);

    const subscribe = () => {
      const channel = supabase
        .channel(`messages:squad:${squadId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `squad_id=eq.${squadId}`,
          },
          (payload) => {
            const row = payload.new as MessageRow;
            const key = queryKeys.messages.list(squadId);
            queryClient.setQueryData(
              key,
              (old: InfiniteData<MessageRow[], unknown> | undefined) => {
                if (!old?.pages.length) {
                  return {
                    pageParams: [undefined],
                    pages: [[row]],
                  } as InfiniteData<MessageRow[], unknown>;
                }
                const pages = [...old.pages];
                const li = pages.length - 1;
                const last = pages[li] ?? [];
                if (last.some((m) => m.id === row.id)) return old;
                pages[li] = [...last, row].sort(
                  (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
                );
                return { ...old, pages };
              },
            );
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `squad_id=eq.${squadId}`,
          },
          (payload) => {
            const row = payload.new as MessageRow;
            const key = queryKeys.messages.list(squadId);
            queryClient.setQueryData(
              key,
              (old: InfiniteData<MessageRow[], unknown> | undefined) => {
                if (!old?.pages.length) return old;
                return {
                  ...old,
                  pages: old.pages.map((page) => page.map((m) => (m.id === row.id ? row : m))),
                };
              },
            );
          },
        )
        .subscribe((status) => {
          if (!mountedRef.current) return;

          if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            retryCountRef.current = 0;
            setReconnecting(false);
            setRealtimeStatus('live');
            addConnectionBreadcrumb('realtime_subscribed', { squadId });

            const runBackfill = shouldBackfillOnSubscribeRef.current;
            shouldBackfillOnSubscribeRef.current = false;
            if (runBackfill) {
              void backfillAfterReconnect();
            }
          } else if (
            status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR ||
            status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT
          ) {
            if (retryCountRef.current < MAX_RETRIES) {
              shouldBackfillOnSubscribeRef.current = true;
              setReconnecting(true);
              setRealtimeStatus('reconnecting');
              const delay = Math.min(BASE_DELAY_MS * 2 ** retryCountRef.current, MAX_DELAY_MS);
              retryCountRef.current += 1;
              retryTimerRef.current = setTimeout(() => {
                if (!mountedRef.current) return;
                void supabase.removeChannel(channel).then(() => {
                  if (mountedRef.current) subscribe();
                });
              }, delay);
            } else {
              setReconnecting(false);
              const offline =
                typeof navigator !== 'undefined' &&
                typeof navigator.onLine === 'boolean' &&
                !navigator.onLine;
              const msg = offline
                ? 'Offline – waiting to reconnect'
                : 'Connection error – refresh to retry';
              setRealtimeFatalError(msg);
              setRealtimeStatus(offline ? 'offline' : 'connection_error');
              addConnectionBreadcrumb('realtime_retry_exhausted', {
                squadId,
                offline,
                subscribeStatus: String(status),
              });
              void appendConnectionLog({
                kind: 'realtime_retry_exhausted',
                squadId,
                message: `${msg} (subscribe status: ${String(status)})`,
              });
            }
          }
        });

      channelRef.current = channel;
    };

    subscribe();

    return () => {
      mountedRef.current = false;
      shouldBackfillOnSubscribeRef.current = false;
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = undefined;
      }
    };
  }, [supabase, squadId, backfillAfterReconnect, queryClient, subscriptionEpoch]);

  const queryError =
    messagesQuery.isError && messagesQuery.error instanceof Error
      ? messagesQuery.error.message
      : messagesQuery.isError
        ? String(messagesQuery.error)
        : null;
  const error = queryError ?? realtimeFatalError;

  const loading = !!(supabase && squadId) && messagesQuery.isPending;

  return {
    messages,
    loading,
    error,
    queryError,
    realtimeError: realtimeFatalError,
    retryRealtimeConnection,
    refresh,
    reconnecting,
    realtimeStatus,
    applyLocalMessage,
    hasNextPage: messagesQuery.hasNextPage,
    fetchNextPage: messagesQuery.fetchNextPage,
    isFetchingNextPage: messagesQuery.isFetchingNextPage,
  };
}
