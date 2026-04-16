/**
 * Optional analytics path: local tone heuristic + `sentiment_metrics` when `VITE_ENABLE_AI=true`.
 * Translation runs client-side (`useTranslation` / translation worker); interventions use `interventions` regardless.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { isAiPipelineEnabled, isRemoteToneEnabled } from '../env';

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
/**
 * When `VITE_ENABLE_REMOTE_TONE=true`, a future Edge Function can return richer tension data.
 * Until wired, returns null — local path remains `analyzeToneLocal` + optional `sentiment_metrics`.
 */
export async function fetchRemoteToneInsight(_squadId: string, _text: string): Promise<ToneInsight | null> {
  if (!isRemoteToneEnabled()) return null;
  return null;
}

export async function recordLocalToneAndMaybePersist(
  supabase: SupabaseClient<Database>,
  squadId: string,
  text: string,
): Promise<{ insight: ToneInsight | null; persistOk: boolean }> {
  if (!isAiPipelineEnabled()) return { insight: null, persistOk: true };
  const remote = await fetchRemoteToneInsight(squadId, text);
  const insight = remote ?? analyzeToneLocal(text);
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
