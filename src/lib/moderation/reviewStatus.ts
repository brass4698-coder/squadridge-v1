import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

/**
 * Per-message review status, viewable by the message *author* only.
 *
 * Powers the "Reviewed by moderator" pill in `src/pages/SessionPage.tsx`. The
 * underlying `get_my_messages_review_status` RPC (migration `20260428250000`)
 * is `SECURITY DEFINER` and filters to `messages.sender_id = auth.uid()`, so
 * peers cannot see moderator activity on each others' messages, and moderator
 * identity / justification are never returned through this surface.
 */
export type ReviewStatusMap = Map<string, string>;

export async function fetchOwnMessageReviewStatus(
  supabase: SupabaseClient<Database>,
  messageIds: string[],
): Promise<ReviewStatusMap> {
  const out: ReviewStatusMap = new Map();
  if (messageIds.length === 0) return out;

  const unique = Array.from(new Set(messageIds));
  const { data, error } = await supabase.rpc('get_my_messages_review_status', {
    p_message_ids: unique,
  });
  if (error) throw error;
  for (const row of data ?? []) {
    out.set(row.message_id, row.reviewed_at);
  }
  return out;
}
