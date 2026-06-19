import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { SessionMessage } from '../lib/supabaseTypes';

export function useSessionMessages(sessionId: string | undefined) {
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('sent_at', { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Real-time new messages
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'session_messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as SessionMessage]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, fetch]);

  async function sendMessage(body: string, senderLabel: string, senderRole: 'facilitator' | 'participant') {
    if (!sessionId || !body.trim()) return;
    await supabase.from('session_messages').insert({
      session_id: sessionId,
      body: body.trim(),
      sender_label: senderLabel,
      sender_role: senderRole,
    });
  }

  return { messages, loading, sendMessage, bottomRef };
}
