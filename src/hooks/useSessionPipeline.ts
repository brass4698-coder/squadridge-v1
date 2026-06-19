import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  type SessionPhase,
  type SessionAnalysisResult,
  PHASE_CONFIGS,
  phaseTimeRemainingMs,
} from '../lib/sessionPhases';
import { queryKeys } from '../lib/queryKeys';

// ── useSessionPhase ─────────────────────────────────────────────────

interface SessionPhaseState {
  phase: SessionPhase;
  phaseStartedAt: Date;
  sessionQuestion: string | null;
  inputDurationMs: number;
  negotiationDurationMs: number;
  minParticipants: number;
  maxParticipants: number;
  timeRemainingMs: number | null;
  isExpired: boolean;
  isLoading: boolean;
  advancePhase: (nextPhase: SessionPhase) => Promise<void>;
}

/**
 * Subscribes to the squad's current phase via polling + Supabase Realtime.
 * Returns phase state, countdown timer, and a function to advance the phase.
 *
 * NOTE: The new columns (`current_phase`, `phase_started_at`, etc.) are added
 * by migration `20260530120000_session_phases.sql` but `database.types.ts` has
 * not been regenerated yet. We use `.select()` with a raw string and cast the
 * result to bypass the generated schema until `npm run gen:types` is run.
 */
export function useSessionPhase(squadId: string): SessionPhaseState {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.squad(squadId), 'phase'],
    queryFn: async () => {
      if (!supabase) throw new Error('No supabase client');
      // TODO: Remove `any` cast once database.types.ts is regenerated with new columns
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('squads')
        .select(
          'current_phase, phase_started_at, session_question, input_duration_ms, negotiation_duration_ms, min_participants, max_participants',
        )
        .eq('id', squadId)
        .single();
      if (error) throw error;
      return data as {
        current_phase: string;
        phase_started_at: string;
        session_question: string | null;
        input_duration_ms: number;
        negotiation_duration_ms: number;
        min_participants: number;
        max_participants: number;
      } | null;
    },
    enabled: !!supabase && !!squadId,
    refetchInterval: 5000,
  });

  const phase = (data?.current_phase as SessionPhase) ?? 'waiting';
  const phaseStartedAt = data?.phase_started_at ? new Date(data.phase_started_at) : new Date();
  const inputDurationMs = data?.input_duration_ms ?? 1_200_000;
  const negotiationDurationMs = data?.negotiation_duration_ms ?? 1_800_000;

  // Countdown timer — updates every second
  // NOTE: phaseStartedAt is recreated on every render; this is intentional because
  // we want the timer to update based on the current time, not a memoized date.
  // Adding phaseStartedAt to dependencies would cause the useEffect to re-run constantly.
  useEffect(() => {
    const config = PHASE_CONFIGS[phase];
    if (!config.defaultDurationMs) {
      setTimeRemaining(null);
      return;
    }

    const customDuration =
      phase === 'input'
        ? inputDurationMs
        : phase === 'negotiation'
          ? negotiationDurationMs
          : undefined;

    const tick = () => {
      const remaining = phaseTimeRemainingMs(phase, phaseStartedAt, customDuration);
      setTimeRemaining(remaining);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, inputDurationMs, negotiationDurationMs]);

  // Realtime subscription for phase changes
  useEffect(() => {
    if (!supabase || !squadId) return;

    const channel = supabase
      .channel(`squad-phase-${squadId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'squads',
          filter: `id=eq.${squadId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: [...queryKeys.squad(squadId), 'phase'],
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, squadId, queryClient]);

  const advancePhase = useCallback(
    async (nextPhase: SessionPhase) => {
      if (!supabase) return;
      // TODO: Remove `any` cast once database.types.ts includes advance_session_phase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.rpc('advance_session_phase' as any, {
        p_squad_id: squadId,
        p_next_phase: nextPhase,
      });
      if (error) throw error;
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.squad(squadId), 'phase'],
      });
    },
    [supabase, squadId, queryClient],
  );

  return {
    phase,
    phaseStartedAt,
    sessionQuestion: data?.session_question ?? null,
    inputDurationMs,
    negotiationDurationMs,
    minParticipants: data?.min_participants ?? 4,
    maxParticipants: data?.max_participants ?? 8,
    timeRemainingMs: timeRemaining,
    isExpired: timeRemaining !== null && timeRemaining <= 0,
    isLoading,
    advancePhase,
  };
}

// ── useSessionInputs ────────────────────────────────────────────────

export interface SessionInput {
  id: string;
  squad_id: string;
  user_id: string;
  encrypted_content: string;
  submitted_at: string;
  is_final: boolean;
}

interface SessionInputsState {
  inputs: SessionInput[];
  myInput: SessionInput | null;
  finalCount: number;
  totalCount: number;
  isLoading: boolean;
  saveInput: (encryptedContent: string, isFinal: boolean) => Promise<void>;
}

/**
 * CRUD for session_inputs. During input phase, only returns the current user's input.
 * After reveal, returns all inputs for the squad (enforced by RLS).
 *
 * NOTE: `session_inputs` table is created by migration but not in generated types.
 * Uses `any` cast until `npm run gen:types`.
 */
export function useSessionInputs(squadId: string): SessionInputsState {
  const { supabase, session } = useAuth();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();

  const { data: inputs = [], isLoading } = useQuery({
    queryKey: [...queryKeys.squad(squadId), 'session-inputs'],
    queryFn: async () => {
      if (!supabase) throw new Error('No supabase client');
      // TODO: Remove `any` cast once database.types.ts is regenerated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('session_inputs')
        .select('*')
        .eq('squad_id', squadId)
        .order('submitted_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as SessionInput[];
    },
    enabled: !!supabase && !!squadId,
    refetchInterval: 3000,
  });

  const myInput = inputs.find((i) => i.user_id === userId) ?? null;
  const finalCount = inputs.filter((i) => i.is_final).length;

  // Realtime subscription for input changes
  useEffect(() => {
    if (!supabase || !squadId) return;

    const channel = supabase
      .channel(`squad-inputs-${squadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_inputs',
          filter: `squad_id=eq.${squadId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: [...queryKeys.squad(squadId), 'session-inputs'],
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, squadId, queryClient]);

  const saveInput = useCallback(
    async (encryptedContent: string, isFinal: boolean) => {
      if (!supabase || !userId) return;

      // TODO: Remove `any` cast once database.types.ts is regenerated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('session_inputs').upsert(
        {
          squad_id: squadId,
          user_id: userId,
          encrypted_content: encryptedContent,
          is_final: isFinal,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'squad_id,user_id' },
      );
      if (error) throw error;

      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.squad(squadId), 'session-inputs'],
      });
    },
    [supabase, squadId, userId, queryClient],
  );

  return {
    inputs,
    myInput,
    finalCount,
    totalCount: inputs.length,
    isLoading,
    saveInput,
  };
}

// ── useSessionAnalysis ──────────────────────────────────────────────

interface SessionAnalysisState {
  analysis: SessionAnalysisResult | null;
  isLoading: boolean;
  triggerAnalysis: () => Promise<void>;
}

/**
 * Reads AI analysis results for the squad. Polls during the analysis phase.
 *
 * NOTE: `session_analysis` table is created by migration but not in generated types.
 * Uses `any` cast until `npm run gen:types`.
 */
export function useSessionAnalysis(squadId: string, phase: SessionPhase): SessionAnalysisState {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.squad(squadId), 'analysis'],
    queryFn: async () => {
      if (!supabase) throw new Error('No supabase client');
      // TODO: Remove `any` cast once database.types.ts is regenerated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('session_analysis')
        .select('analysis_json')
        .eq('squad_id', squadId)
        .maybeSingle();
      if (error) throw error;
      return (data?.analysis_json as SessionAnalysisResult) ?? null;
    },
    enabled: !!supabase && !!squadId && (phase === 'analysis' || phase === 'complete'),
    refetchInterval: phase === 'analysis' ? 3000 : false,
  });

  const triggerAnalysis = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.functions.invoke('analyze-session', {
      body: { squad_id: squadId },
    });
    if (error) throw error;
    void queryClient.invalidateQueries({
      queryKey: [...queryKeys.squad(squadId), 'analysis'],
    });
  }, [supabase, squadId, queryClient]);

  return {
    analysis: data ?? null,
    isLoading,
    triggerAnalysis,
  };
}
