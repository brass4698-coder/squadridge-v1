import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js';
import type { Database } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';

type MessageRow = Database['public']['Tables']['messages']['Row'];

const MAX_RETRIES = 6;
const BASE_DELAY_MS = 1_000;

export function useRealtimeMessages(squadId: string | undefined) {
  const { supabase } = useAuth();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (!supabase || !squadId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: qError } = await supabase
      .from('messages')
      .select('*')
      .eq('squad_id', squadId)
      .order('sent_at', { ascending: true });

    if (qError) {
      setError(qError.message);
      setMessages([]);
    } else {
      setMessages(data ?? []);
    }
    setLoading(false);
  }, [supabase, squadId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase || !squadId) return;

    mountedRef.current = true;

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
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              return [...prev, row].sort(
                (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
              );
            });
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
            setMessages((prev) => prev.map((m) => (m.id === row.id ? row : m)));
          },
        )
        .subscribe((status) => {
          if (!mountedRef.current) return;

          if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            retryCountRef.current = 0;
            setReconnecting(false);
          } else if (
            status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR ||
            status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT
          ) {
            if (retryCountRef.current < MAX_RETRIES) {
              setReconnecting(true);
              const delay = BASE_DELAY_MS * 2 ** retryCountRef.current;
              retryCountRef.current += 1;
              retryTimerRef.current = setTimeout(() => {
                if (!mountedRef.current) return;
                void supabase.removeChannel(channel).then(() => {
                  if (mountedRef.current) subscribe();
                });
              }, delay);
            } else {
              setReconnecting(false);
              setError('Realtime connection lost. Please refresh the page.');
            }
          }
        });

      channelRef.current = channel;
    };

    subscribe();

    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = undefined;
      }
    };
  }, [supabase, squadId]);

  return { messages, loading, error, refresh, reconnecting };
}
