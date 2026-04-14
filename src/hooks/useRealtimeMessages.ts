import { useCallback, useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';

type MessageRow = Database['public']['Tables']['messages']['Row'];

export function useRealtimeMessages(squadId: string | undefined) {
  const { supabase } = useAuth();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

    let channel: RealtimeChannel | undefined;

    const setup = async () => {
      channel = supabase
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
        .subscribe();
    };

    void setup();

    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [supabase, squadId]);

  return { messages, loading, error, refresh };
}
