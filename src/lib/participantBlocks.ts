import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ParticipantBlockReason } from './database.types';

export type ParticipantBlockRow = Database['public']['Tables']['participant_blocks']['Row'];

export async function fetchActiveParticipantBlocks(
  supabase: SupabaseClient<Database>,
  squadId: string,
): Promise<ParticipantBlockRow[]> {
  const { data, error } = await supabase
    .from('participant_blocks')
    .select(
      'id, blocker_user_id, blocked_user_id, squad_id, reason_code, active, created_at, updated_at, metadata',
    )
    .eq('squad_id', squadId)
    .eq('active', true);
  if (error) throw error;
  return (data ?? []) as ParticipantBlockRow[];
}

export async function blockParticipant(
  supabase: SupabaseClient<Database>,
  input: {
    squadId: string;
    blockerUserId: string;
    blockedUserId: string;
    reasonCode?: ParticipantBlockReason;
  },
): Promise<void> {
  const { error } = await supabase.from('participant_blocks').upsert(
    {
      blocker_user_id: input.blockerUserId,
      blocked_user_id: input.blockedUserId,
      squad_id: input.squadId,
      reason_code: input.reasonCode ?? 'self_protection',
      active: true,
    },
    { onConflict: 'blocker_user_id,blocked_user_id,squad_id' },
  );
  if (error) throw error;
}

export async function unblockParticipant(
  supabase: SupabaseClient<Database>,
  input: {
    squadId: string;
    blockerUserId: string;
    blockedUserId: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from('participant_blocks')
    .update({ active: false })
    .eq('squad_id', input.squadId)
    .eq('blocker_user_id', input.blockerUserId)
    .eq('blocked_user_id', input.blockedUserId);
  if (error) throw error;
}
