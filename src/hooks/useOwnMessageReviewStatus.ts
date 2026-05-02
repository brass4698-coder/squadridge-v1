import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { captureAppError, fetchOwnMessageReviewStatus, type Database } from '../lib';

type MessageRow = Database['public']['Tables']['messages']['Row'];

/**
 * Polls `get_my_messages_review_status` for the caller's own non-retracted
 * messages and returns a stable `message_id -> reviewed_at` Map.
 *
 * The RPC enforces `sender_id = auth.uid()` server-side; nothing about the
 * moderator (identity, justification, body) is ever fetched here. The Map is
 * merged across refetches so a previously-seen review timestamp is preserved
 * when the older page drops out of the visible window.
 */
export function useOwnMessageReviewStatus(
  supabase: SupabaseClient<Database> | null,
  userId: string | null,
  messages: MessageRow[],
  squadId: string | undefined,
): Map<string, string> {
  const [reviewStatusByMessage, setReviewStatusByMessage] = useState<Map<string, string>>(
    () => new Map(),
  );

  useEffect(() => {
    if (!supabase || !userId) return;
    const ownIds = messages
      .filter((m) => m.sender_id === userId && m.status !== 'retracted')
      .map((m) => m.id);
    if (ownIds.length === 0) return;
    let cancelled = false;
    void (async () => {
      try {
        const map = await fetchOwnMessageReviewStatus(supabase, ownIds);
        if (cancelled || map.size === 0) return;
        setReviewStatusByMessage((prev) => {
          let changed = false;
          const next = new Map(prev);
          for (const [id, ts] of map) {
            if (next.get(id) !== ts) {
              next.set(id, ts);
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      } catch (e) {
        captureAppError(e, { feature: 'session_review_status', extra: { squadId } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, messages, squadId]);

  return reviewStatusByMessage;
}
