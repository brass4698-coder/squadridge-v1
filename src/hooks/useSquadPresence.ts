import { useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';

export interface SquadPresenceState {
  user_id: string;
  online_at: string;
}

/**
 * Live presence for a squad room — opens a Supabase Realtime presence channel
 * `squad-presence:<squadId>` and tracks `{ user_id, online_at }` for each
 * connected client. Returns the deduplicated set of user IDs currently
 * present; the in-room UI maps these to the existing pseudonymous peer
 * profiles.
 *
 * Presence is best-effort and bandwidth-light: payloads are bounded to the
 * user's auth id and a timestamp, and the channel is automatically closed on
 * unmount or when the squad changes.
 */
export function useSquadPresence(squadId: string | undefined): Set<string> {
  const { supabase, session } = useAuth();
  const userId = session?.user?.id;
  const [present, setPresent] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!supabase || !squadId || !userId) return;
    let cancelled = false;
    const channel: RealtimeChannel = supabase.channel(`squad-presence:${squadId}`, {
      config: { presence: { key: userId } },
    });

    channel.on('presence', { event: 'sync' }, () => {
      if (cancelled) return;
      const state = channel.presenceState<SquadPresenceState>();
      const ids = new Set<string>();
      for (const key of Object.keys(state)) {
        const meta = state[key];
        if (Array.isArray(meta) && meta.length > 0) {
          ids.add(key);
        }
      }
      setPresent(ids);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ user_id: userId, online_at: new Date().toISOString() });
      }
    });

    return () => {
      cancelled = true;
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [supabase, squadId, userId]);

  return present;
}
