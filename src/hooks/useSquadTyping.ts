import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';

const TYPING_TTL_MS = 4_000;
const SEND_THROTTLE_MS = 1_500;

interface TypingState {
  /** User IDs that are *not* the local user and currently typing within TTL. */
  typing: Set<string>;
  /** Notify peers that the local user is typing (throttled to once / SEND_THROTTLE_MS). */
  notifyTyping: () => void;
}

interface TypingPayload {
  user_id: string;
  at: number;
}

/**
 * Lightweight typing indicator using Supabase Realtime broadcast on
 * `squad-typing:<squadId>`. Each `notifyTyping()` call emits at most one event
 * per {@link SEND_THROTTLE_MS} window. Peers' typing rows expire after
 * {@link TYPING_TTL_MS} so the indicator clears naturally without explicit
 * "stopped typing" events.
 */
export function useSquadTyping(squadId: string | undefined): TypingState {
  const { supabase, session } = useAuth();
  const userId = session?.user?.id;
  const [typing, setTyping] = useState<Set<string>>(() => new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSentRef = useRef<number>(0);
  const peerLastSeenRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!supabase || !squadId || !userId) return;
    let cancelled = false;
    const seen = peerLastSeenRef.current;
    const channel = supabase.channel(`squad-typing:${squadId}`, {
      config: { broadcast: { self: false }, private: true },
    });

    channel.on('broadcast', { event: 'typing' }, (payload) => {
      if (cancelled) return;
      const data = payload?.payload as TypingPayload | undefined;
      if (!data || typeof data.user_id !== 'string' || data.user_id === userId) return;
      seen.set(data.user_id, Date.now());
      pruneAndPublish();
    });

    channel.subscribe();
    channelRef.current = channel;

    function pruneAndPublish() {
      const now = Date.now();
      const next = new Set<string>();
      for (const [uid, ts] of seen) {
        if (now - ts < TYPING_TTL_MS) next.add(uid);
        else seen.delete(uid);
      }
      setTyping(next);
    }

    const interval = window.setInterval(pruneAndPublish, 1_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      channelRef.current = null;
      void supabase.removeChannel(channel);
      seen.clear();
      setTyping(new Set());
    };
  }, [supabase, squadId, userId]);

  const notifyTyping = useCallback(() => {
    if (!channelRef.current || !userId) return;
    const now = Date.now();
    if (now - lastSentRef.current < SEND_THROTTLE_MS) return;
    lastSentRef.current = now;
    void channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId, at: now } satisfies TypingPayload,
    });
  }, [userId]);

  return { typing, notifyTyping };
}
