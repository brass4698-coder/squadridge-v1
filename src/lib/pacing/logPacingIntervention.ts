import { isSupabaseConfigured } from '../env';
import { logIntervention } from '../ai/pipeline';
import { supabase } from '../../utils/supabase';
import { logInfo } from '../log';

export type PacingInterventionType =
  | 'slow_down_self'
  | 'slow_down_facilitator'
  | 'slow_down_all'
  | 'slow_down_suggested_accept'
  | 'pull_back_used';

/**
 * Metadata-only intervention log. Never pass message bodies.
 * Falls back to a structured info log when Supabase is unavailable (demo/local).
 */
export async function logPacingIntervention(
  squadOrSessionId: string,
  interventionType: PacingInterventionType,
): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await logIntervention(supabase, squadOrSessionId, interventionType);
    return;
  }
  logInfo('pacing_intervention_local', {
    feature: 'pacing',
    phase: interventionType,
    // session/squad id hashed into count length only — never log free-form ids as custom keys
    count: squadOrSessionId.length,
  });
}
