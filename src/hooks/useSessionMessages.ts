import { useCallback, useEffect, useRef, useState } from 'react';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { SessionMessage } from '../lib/supabaseTypes';

export type SessionMessageConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'offline'
  | 'connection_error';

const MAX_RETRIES = 6;
const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;

function mergeMessagesById(prev: SessionMessage[], incoming: SessionMessage[]): SessionMessage[] {
  const byId = new Map<string, SessionMessage>();
  for (const m of prev) byId.set(m.id, m);
  for (const row of incoming) byId.set(row.id, row);
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
  );
}

export function useSessionMessages(sessionId: string | undefined) {
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<SessionMessageConnectionStatus>('idle');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | undefined>(undefined);
  const maxSentAtRef = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const [subscriptionEpoch, setSubscriptionEpoch] = useState(0);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) return [];
    const { data } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('sent_at', { ascending: true });
    const rows = (data ?? []) as SessionMessage[];
    if (rows.length > 0) {
      maxSentAtRef.current = rows[rows.length - 1]!.sent_at;
    }
    return rows;
  }, [sessionId]);

  const backfillNewer = useCallback(async () => {
    if (!sessionId || !maxSentAtRef.current) return;
    const { data } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .gt('sent_at', maxSentAtRef.current)
      .order('sent_at', { ascending: true });
    const rows = (data ?? []) as SessionMessage[];
    if (rows.length > 0) {
      setMessages((prev) => mergeMessagesById(prev, rows));
      maxSentAtRef.current = rows[rows.length - 1]!.sent_at;
    }
  }, [sessionId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    void fetchMessages().then((rows) => {
      if (!mountedRef.current) return;
      setMessages(rows);
      setLoading(false);
    });
  }, [sessionId, fetchMessages]);

  useEffect(() => {
    if (!sessionId) return;

    const clearRetry = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    const scheduleResubscribe = () => {
      if (!mountedRef.current || !navigator.onLine) {
        setConnectionStatus('offline');
        return;
      }
      if (retryCountRef.current >= MAX_RETRIES) {
        setConnectionStatus('connection_error');
        return;
      }
      const delay = Math.min(BASE_DELAY_MS * 2 ** retryCountRef.current, MAX_DELAY_MS);
      retryCountRef.current += 1;
      setConnectionStatus('reconnecting');
      retryTimerRef.current = setTimeout(() => {
        setSubscriptionEpoch((e) => e + 1);
      }, delay);
    };

    const subscribe = () => {
      clearRetry();
      if (channelRef.current) supabase.removeChannel(channelRef.current);

      setConnectionStatus('connecting');
      const channel = supabase
        .channel(`session-messages:${sessionId}:${subscriptionEpoch}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'session_messages',
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            const row = payload.new as SessionMessage;
            setMessages((prev) => mergeMessagesById(prev, [row]));
            maxSentAtRef.current = row.sent_at;
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          },
        )
        .subscribe((status) => {
          if (!mountedRef.current) return;
          if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            retryCountRef.current = 0;
            setConnectionStatus('live');
            void backfillNewer();
          } else if (
            status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR ||
            status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT
          ) {
            scheduleResubscribe();
          }
        });

      channelRef.current = channel;
    };

    subscribe();

    const onOnline = () => {
      retryCountRef.current = 0;
      setSubscriptionEpoch((e) => e + 1);
    };
    const onOffline = () => setConnectionStatus('offline');
    const onVisible = () => {
      if (document.visibilityState === 'visible') void backfillNewer();
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearRetry();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisible);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [sessionId, subscriptionEpoch, backfillNewer]);

  async function sendMessage(
    body: string,
    senderLabel: string,
    senderRole: 'facilitator' | 'participant',
  ) {
    if (!sessionId || !body.trim()) return;
    await supabase.from('session_messages').insert({
      session_id: sessionId,
      body: body.trim(),
      sender_label: senderLabel,
      sender_role: senderRole,
    });
    if (senderRole === 'facilitator') {
      await supabase.rpc('log_session_audit_event', {
        p_session_id: sessionId,
        p_event_type: 'prompt_posted',
        p_actor_role: 'facilitator',
        p_metadata: { sender_label: senderLabel },
      });
    }
  }

  function retryConnection() {
    retryCountRef.current = 0;
    setSubscriptionEpoch((e) => e + 1);
  }

  return { messages, loading, sendMessage, bottomRef, connectionStatus, retryConnection };
}
