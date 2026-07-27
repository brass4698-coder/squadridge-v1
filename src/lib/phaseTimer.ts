/**
 * Server-authoritative phase timer math for v2 facilitated sessions.
 * Remaining time is derived from phase_started_at + phase_duration_seconds
 * versus a server clock sample (resync on Realtime session updates).
 */

import type { DialogueStage } from './dialogueStages';
import { DIALOGUE_STAGES } from './dialogueStages';
import { supabase } from './supabase';

export type PhaseTimerState = 'idle' | 'running' | 'paused' | 'elapsed';

export type PhaseBudgets = Partial<Record<DialogueStage, number>>;

export interface PhaseTimerSnapshot {
  phase_started_at: string | null;
  phase_duration_seconds: number | null;
  phase_timer_state: PhaseTimerState;
  session_ends_at?: string | null;
  /** ISO timestamp from server when available; falls back to local clock. */
  server_now?: string | null;
}

export type TimerUrgency = 'neutral' | 'amber' | 'red';

/** Default seconds per stage — mirrors SQL default_phase_budgets_for_template. */
export const TEMPLATE_PHASE_BUDGETS: Record<string, PhaseBudgets> = {
  ngo_deliberation: {
    preparation: 300,
    opening: 600,
    story: 1800,
    framing: 1200,
    options: 1500,
    review: 1200,
    outcome_ready: 0,
  },
  community_mediation: {
    preparation: 240,
    opening: 480,
    story: 1200,
    framing: 900,
    options: 1200,
    review: 900,
    outcome_ready: 0,
  },
  city_community_safety: {
    preparation: 300,
    opening: 420,
    story: 900,
    framing: 900,
    options: 1500,
    review: 900,
    outcome_ready: 0,
  },
  track2_dialogue: {
    preparation: 360,
    opening: 600,
    story: 1500,
    framing: 1200,
    options: 1200,
    review: 1200,
    outcome_ready: 0,
  },
};

export function defaultPhaseBudgetsForTemplate(
  templateId: string | null | undefined,
): PhaseBudgets {
  return (
    TEMPLATE_PHASE_BUDGETS[templateId ?? 'ngo_deliberation'] ??
    TEMPLATE_PHASE_BUDGETS.ngo_deliberation!
  );
}

export function budgetSecondsForStage(
  budgets: PhaseBudgets | Record<string, unknown> | null | undefined,
  stage: DialogueStage,
): number {
  const raw = budgets?.[stage];
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

/**
 * Remaining seconds for the current phase budget.
 * When paused, phase_duration_seconds holds the frozen remaining amount.
 */
export function computePhaseRemainingSeconds(
  snap: PhaseTimerSnapshot,
  nowMs: number = Date.now(),
): number | null {
  const duration = snap.phase_duration_seconds;
  if (duration == null || duration < 0) return null;

  if (snap.phase_timer_state === 'paused') return duration;
  if (snap.phase_timer_state === 'elapsed') return 0;
  if (snap.phase_timer_state !== 'running' || !snap.phase_started_at) return null;

  const started = Date.parse(snap.phase_started_at);
  if (!Number.isFinite(started)) return null;

  const clock = snap.server_now ? Date.parse(snap.server_now) : nowMs;
  const base = Number.isFinite(clock) ? clock : nowMs;
  const elapsedSec = Math.max(0, Math.floor((base - started) / 1000));
  // If server_now was sampled earlier, add local drift since that sample.
  const driftSec =
    snap.server_now && Number.isFinite(Date.parse(snap.server_now))
      ? Math.max(0, Math.floor((nowMs - Date.parse(snap.server_now)) / 1000))
      : 0;

  return Math.max(0, duration - elapsedSec - driftSec);
}

export function timerUrgency(remaining: number | null, duration: number | null): TimerUrgency {
  if (remaining == null || duration == null || duration <= 0) return 'neutral';
  const ratio = remaining / duration;
  if (ratio <= 0.1) return 'red';
  if (ratio <= 0.25) return 'amber';
  return 'neutral';
}

export function formatPhaseCountdown(remainingSeconds: number | null): string {
  if (remainingSeconds == null) return '—';
  const s = Math.max(0, Math.floor(remainingSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function stageOrdinal(stage: DialogueStage): { index: number; total: number } {
  return { index: DIALOGUE_STAGES.indexOf(stage) + 1, total: DIALOGUE_STAGES.length };
}

export async function facilitatorStartPhaseTimer(
  sessionId: string,
  durationSeconds?: number,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('facilitator_start_phase_timer', {
    p_session_id: sessionId,
    p_duration_seconds: durationSeconds ?? null,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'TIMER_START_FAILED' };
  return { ok: true };
}

export async function facilitatorExtendPhaseTimer(
  sessionId: string,
  extraSeconds: number,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('facilitator_extend_phase_timer', {
    p_session_id: sessionId,
    p_extra_seconds: extraSeconds,
    p_reason: reason ?? null,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'TIMER_EXTEND_FAILED' };
  return { ok: true };
}

export async function facilitatorPausePhaseTimer(
  sessionId: string,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('facilitator_pause_phase_timer', {
    p_session_id: sessionId,
    p_reason: reason ?? null,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'TIMER_PAUSE_FAILED' };
  return { ok: true };
}

export async function facilitatorMarkPhaseElapsed(
  sessionId: string,
  systemBodyCiphertext?: string | null,
): Promise<{ ok: boolean; error?: string; message_error?: string }> {
  const { data, error } = await supabase.rpc('facilitator_mark_phase_elapsed', {
    p_session_id: sessionId,
    p_system_body: systemBodyCiphertext ?? null,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string; message_error?: string };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'TIMER_ELAPSE_FAILED' };
  return { ok: true, message_error: row.message_error };
}

export async function facilitatorSetFloor(
  sessionId: string,
  participantId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('facilitator_set_floor', {
    p_session_id: sessionId,
    p_participant_id: participantId,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'FLOOR_FAILED' };
  return { ok: true };
}

export async function facilitatorInvokeRecess(
  sessionId: string,
  message?: string,
): Promise<{ ok: boolean; error?: string; recess_seconds?: number }> {
  const { data, error } = await supabase.rpc('facilitator_invoke_recess', {
    p_session_id: sessionId,
    p_message: message ?? null,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string; recess_seconds?: number };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'RECESS_FAILED' };
  return { ok: true, recess_seconds: row.recess_seconds ?? 90 };
}

export async function participantReportToneSignal(
  token: string,
  tensionLevel: number,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('participant_report_tone_signal', {
    p_token: token,
    p_tension_level: tensionLevel,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { valid?: boolean; error?: string };
  if (!row?.valid) return { ok: false, error: row?.error ?? 'TONE_REPORT_FAILED' };
  return { ok: true };
}
