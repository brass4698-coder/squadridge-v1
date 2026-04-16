import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { isAiPipelineEnabled } from '../env';

export interface ToneInsight {
  tensionLevel: number;
  suggestion?: string;
}

/**
 * Lightweight client-side heuristic when remote models are disabled or unreachable.
 */
export function analyzeToneLocal(text: string): ToneInsight {
  const hostile = /\b(hate|idiot|attack|destroy)\b/i;
  const loud = /!{2,}/;
  const tensionLevel = hostile.test(text) || loud.test(text) ? 0.78 : 0.22;
  const suggestion =
    tensionLevel > 0.5
      ? 'Try shorter sentences and name the concern without labeling the other side.'
      : undefined;
  return { tensionLevel, suggestion };
}

/**
 * When AI is enabled, persist a de-identified tension sample for the squad (analytics path).
 * When disabled, this is a no-op so core messaging never depends on AI.
 */
export async function recordLocalToneAndMaybePersist(
  supabase: SupabaseClient<Database>,
  squadId: string,
  text: string,
): Promise<{ insight: ToneInsight | null; persistOk: boolean }> {
  if (!isAiPipelineEnabled()) return { insight: null, persistOk: true };
  const insight = analyzeToneLocal(text);
  const { error } = await supabase.from('sentiment_metrics').insert({
    squad_id: squadId,
    tension_level: insight.tensionLevel,
  });
  if (error) {
    console.warn('[ai] sentiment_metrics insert failed', error.message);
    return { insight, persistOk: false };
  }
  return { insight, persistOk: true };
}

export async function logIntervention(
  supabase: SupabaseClient<Database>,
  squadId: string,
  interventionType: string,
): Promise<void> {
  const { error } = await supabase.from('interventions').insert({
    squad_id: squadId,
    intervention_type: interventionType,
  });
  if (error) {
    console.warn('[interventions] insert failed', error.message);
  }
}
