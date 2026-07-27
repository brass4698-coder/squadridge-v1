import { useCallback, useEffect, useRef, useState } from 'react';
import {
  computePhaseRemainingSeconds,
  facilitatorMarkPhaseElapsed,
  timerUrgency,
  type PhaseTimerSnapshot,
  type PhaseTimerState,
  type TimerUrgency,
} from '../lib/phaseTimer';
import { encryptSessionMessageBody } from '../lib/sessionMessageCrypto';
import { fetchFacilitatorRoomKey } from '../lib/sessionRoomKey';
import { supabase } from '../lib/supabase';

const PHASE_ELAPSED_NOTE =
  'Time has elapsed for this phase. The facilitator will advance when the room is ready.';

export interface UsePhaseTimerOptions {
  sessionId?: string;
  /** Facilitator may post the encrypted system note at zero. */
  canMarkElapsed?: boolean;
  initial?: Partial<PhaseTimerSnapshot> | null;
  tickMs?: number;
}

export interface UsePhaseTimerResult {
  remainingSeconds: number | null;
  durationSeconds: number | null;
  timerState: PhaseTimerState;
  urgency: TimerUrgency;
  sessionEndsAt: string | null;
  elapsedNotePosted: boolean;
  /** Merge fields from a Realtime session UPDATE or pacing poll. */
  resync: (snap: Partial<PhaseTimerSnapshot>) => void;
}

export function usePhaseTimer(opts: UsePhaseTimerOptions): UsePhaseTimerResult {
  const { sessionId, canMarkElapsed = false, initial = null, tickMs = 1000 } = opts;
  const [snap, setSnap] = useState<PhaseTimerSnapshot>(() => ({
    phase_started_at: initial?.phase_started_at ?? null,
    phase_duration_seconds: initial?.phase_duration_seconds ?? null,
    phase_timer_state: initial?.phase_timer_state ?? 'idle',
    session_ends_at: initial?.session_ends_at ?? null,
    server_now: initial?.server_now ?? null,
  }));
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [elapsedNotePosted, setElapsedNotePosted] = useState(false);
  const markingRef = useRef(false);

  const resync = useCallback((next: Partial<PhaseTimerSnapshot>) => {
    setSnap((prev) => ({
      ...prev,
      ...next,
      phase_timer_state: (next.phase_timer_state ?? prev.phase_timer_state) as PhaseTimerState,
    }));
    if (next.phase_timer_state && next.phase_timer_state !== 'elapsed') {
      setElapsedNotePosted(false);
    }
  }, []);

  useEffect(() => {
    if (initial) {
      resync(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once when session identity changes
  }, [sessionId, resync]);

  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`phase-timer:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as {
            phase_started_at?: string | null;
            phase_duration_seconds?: number | null;
            phase_timer_state?: PhaseTimerState;
            session_ends_at?: string | null;
          };
          resync({
            phase_started_at: row.phase_started_at ?? null,
            phase_duration_seconds: row.phase_duration_seconds ?? null,
            phase_timer_state: row.phase_timer_state ?? 'idle',
            session_ends_at: row.session_ends_at ?? null,
            server_now: new Date().toISOString(),
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, resync]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  const remainingSeconds = computePhaseRemainingSeconds(snap, nowMs);
  const durationSeconds = snap.phase_duration_seconds;
  const urgency = timerUrgency(remainingSeconds, durationSeconds);

  useEffect(() => {
    if (!canMarkElapsed || !sessionId) return;
    if (snap.phase_timer_state !== 'running') return;
    if (remainingSeconds == null || remainingSeconds > 0) return;
    if (markingRef.current || elapsedNotePosted) return;

    markingRef.current = true;
    void (async () => {
      try {
        let ciphertext: string | null = null;
        const key = await fetchFacilitatorRoomKey(sessionId);
        if (key.ok) {
          ciphertext = await encryptSessionMessageBody(PHASE_ELAPSED_NOTE, key.keyBase64);
        }
        const result = await facilitatorMarkPhaseElapsed(sessionId, ciphertext);
        if (result.ok) {
          setElapsedNotePosted(true);
          resync({ phase_timer_state: 'elapsed', phase_duration_seconds: 0 });
        }
      } finally {
        markingRef.current = false;
      }
    })();
  }, [
    canMarkElapsed,
    sessionId,
    remainingSeconds,
    snap.phase_timer_state,
    elapsedNotePosted,
    resync,
  ]);

  return {
    remainingSeconds,
    durationSeconds,
    timerState: snap.phase_timer_state,
    urgency,
    sessionEndsAt: snap.session_ends_at ?? null,
    elapsedNotePosted,
    resync,
  };
}
