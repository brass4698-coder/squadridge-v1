/**
 * Optional analytics path: local tone heuristic + `sentiment_metrics` when `VITE_ENABLE_AI=true`.
 * Translation runs client-side (`useTranslation` / translation worker); interventions use `interventions` regardless.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { isAiPipelineEnabled, isRemoteToneEnabled } from '../env';
import { logWarn, safeErrorMessage } from '../log';

export interface ToneInsight {
  tensionLevel: number;
  suggestion?: string;
}

type SentimentRow = { label?: string; score?: number };

/**
 * DistilBERT sentiment (Transformers.js) when available; falls back to {@link analyzeToneLocal}.
 */
export async function analyzeToneWithModel(text: string): Promise<ToneInsight> {
  try {
    const { pipeline } = await import('@xenova/transformers');
    const classifier = await pipeline(
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
    );
    const raw = await classifier(text.trim().slice(0, 2000));
    const row = (Array.isArray(raw) ? raw[0] : raw) as SentimentRow;
    const label = typeof row?.label === 'string' ? row.label : '';
    const score = typeof row?.score === 'number' ? row.score : 0.5;
    const negative = label.toUpperCase().includes('NEG');
    const tensionLevel = negative ? Math.min(1, score) : Math.min(1, 1 - score);
    const suggestion =
      tensionLevel > 0.5
        ? 'Try shorter sentences and name the concern without labeling the other side.'
        : undefined;
    return { tensionLevel, suggestion };
  } catch {
    return analyzeToneLocal(text);
  }
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
 * Reserved for an Edge Function that returns richer tension data when
 * `VITE_ENABLE_REMOTE_TONE=true`. Until that path is wired, returns null
 * and callers fall back to {@link analyzeToneLocal} / {@link analyzeToneWithModel}.
 */
export async function fetchRemoteToneInsight(
  _squadId: string,
  _text: string,
): Promise<ToneInsight | null> {
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
  const insight = remote ?? (await analyzeToneWithModel(text));
  const { error } = await supabase.from('sentiment_metrics').insert({
    squad_id: squadId,
    tension_level: insight.tensionLevel,
  });
  if (error) {
    logWarn('sentiment_metrics_insert_failed', {
      feature: 'ai_pipeline',
      error_code: error.code ?? null,
      error_message: safeErrorMessage(new Error(error.message)),
    });
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
    logWarn('interventions_insert_failed', {
      feature: 'ai_pipeline',
      error_code: error.code ?? null,
      error_message: safeErrorMessage(new Error(error.message)),
    });
  }
}
