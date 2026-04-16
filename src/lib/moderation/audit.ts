import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '../database.types';

export type ModerationAction = {
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, Json>;
};

/**
 * Append-only audit row for a human moderation action. Requires caller to be listed in `public.moderators` (RLS).
 */
export async function logModerationAction(
  supabase: SupabaseClient<Database>,
  params: ModerationAction,
): Promise<{ error: Error | null }> {
  const row: Database['public']['Tables']['moderation_audit_log']['Insert'] = {
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    metadata: (params.metadata ?? {}) as Json,
  };

  const { error } = await supabase.from('moderation_audit_log').insert(row);
  if (error) {
    return { error: new Error(error.message) };
  }
  return { error: null };
}
