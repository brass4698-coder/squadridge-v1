import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionResolutionPanel } from '../../../components/facilitator/SessionResolutionPanel';
import { DeliberationFeed } from '../../../components/session/DeliberationFeed';
import { DialogueStageMap } from '../../../components/session/DialogueStageMap';
import { HeatIndicator } from '../../../components/session/HeatIndicator';
import { RoomPrivacyStatus } from '../../../components/session/RoomPrivacyStatus';
import { RoomShell } from '../../../components/session/RoomShell';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { useParticipants } from '../../../hooks/useParticipants';
import { usePhaseTimer } from '../../../hooks/usePhaseTimer';
import { useSessionMessages } from '../../../hooks/useSessionMessages';
import { useSession, useSessions } from '../../../hooks/useSessions';
import { appRoutes } from '../../../lib/appRoutes';
import {
  DIALOGUE_STAGE_CONFIGS,
  nextDialogueStage,
  parseDialogueStage,
  previousDialogueStage,
  type DialogueStage,
} from '../../../lib/dialogueStages';
import { facilitatorAdvanceDialogueStage } from '../../../lib/outcomeReview';
import {
  facilitatorExtendPhaseTimer,
  facilitatorInvokeRecess,
  facilitatorPausePhaseTimer,
  facilitatorSetFloor,
  facilitatorStartPhaseTimer,
  type PhaseTimerState,
} from '../../../lib/phaseTimer';
import { sessionUsesResolutionWorkflow } from '../../../lib/sessionResolutions';
import {
  facilitatorSetRoomPacing,
  pacingCopy,
  type RoomPacingMode,
} from '../../../lib/sessionPacing';
import { supabase } from '../../../lib/supabase';

type RoomStatus = 'waiting' | 'live' | 'paused' | 'ended';

function mapSessionStatus(status: string | undefined): RoomStatus {
  if (status === 'live' || status === 'open') return 'live';
  if (status === 'paused') return 'paused';
  if (status === 'ended' || status === 'released') return 'ended';
  return 'waiting';
}

export function SessionControlPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading } = useSession(sessionId);
  const { updateSessionStatus } = useSessions();
  const { participants } = useParticipants(sessionId);
  const { messages, sendMessage, connectionStatus, retryConnection, privacyState, cryptoError } =
    useSessionMessages(sessionId);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('waiting');
  const [showEndModal, setShowEndModal] = useState(false);
  const [facilitatorInput, setFacilitatorInput] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [outcomeImport, setOutcomeImport] = useState<string | null>(null);
  const [pacingMode, setPacingMode] = useState<RoomPacingMode>('normal');
  const [pacingBusy, setPacingBusy] = useState(false);
  const [dialogueStage, setDialogueStage] = useState<DialogueStage>('preparation');
  const [stageBusy, setStageBusy] = useState(false);
  const [quietMode, setQuietMode] = useState(false);
  const [extendReason, setExtendReason] = useState('');
  const [recessSecondsLeft, setRecessSecondsLeft] = useState<number | null>(null);
  const [floorBusy, setFloorBusy] = useState(false);

  const phaseTimer = usePhaseTimer({
    sessionId,
    canMarkElapsed: roomStatus === 'live' || roomStatus === 'paused',
    initial: session
      ? {
          phase_started_at: session.phase_started_at,
          phase_duration_seconds: session.phase_duration_seconds,
          phase_timer_state: session.phase_timer_state as PhaseTimerState,
          session_ends_at: session.session_ends_at,
        }
      : null,
  });

  const showResolutions = sessionUsesResolutionWorkflow(
    session?.template_id,
    session?.setup_config,
  );

  useEffect(() => {
    setRoomStatus(mapSessionStatus(session?.status));
    setDialogueStage(parseDialogueStage(session?.dialogue_stage));
    if (session) {
      phaseTimer.resync({
        phase_started_at: session.phase_started_at,
        phase_duration_seconds: session.phase_duration_seconds,
        phase_timer_state: session.phase_timer_state as PhaseTimerState,
        session_ends_at: session.session_ends_at,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resync when session row loads
  }, [
    session?.status,
    session?.dialogue_stage,
    session?.phase_started_at,
    session?.phase_duration_seconds,
    session?.phase_timer_state,
    session?.session_ends_at,
  ]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from('session_room_pacing')
        .select('pacing_mode')
        .eq('session_id', sessionId)
        .maybeSingle();
      if (!cancelled && data?.pacing_mode) {
        setPacingMode(data.pacing_mode as RoomPacingMode);
      }
    })();

    const channel = supabase
      .channel(`session-pacing:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_room_pacing',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as { pacing_mode?: RoomPacingMode } | null;
          if (row?.pacing_mode) setPacingMode(row.pacing_mode);
        },
      )
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
            dialogue_stage?: string;
            status?: string;
            floor_holder_participant_id?: string | null;
          } | null;
          if (row?.dialogue_stage) setDialogueStage(parseDialogueStage(row.dialogue_stage));
          if (row?.status) setRoomStatus(mapSessionStatus(row.status));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
    if (recessSecondsLeft == null || recessSecondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setRecessSecondsLeft((s) => (s == null || s <= 1 ? null : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [recessSecondsLeft]);

  const status = roomStatus;
  const stageConfig = DIALOGUE_STAGE_CONFIGS[dialogueStage];
  const nextStage = nextDialogueStage(dialogueStage);
  const prevStage = previousDialogueStage(dialogueStage);
  const floorId = session?.floor_holder_participant_id ?? null;

  const roster = useMemo(
    () =>
      participants.map((p) => ({
        id: p.id,
        label: p.codename,
        status: p.verification_status,
        hasFloor: floorId === p.id,
        heatSlot: <HeatIndicator tensionLevel={p.tone_signal} />,
      })),
    [participants, floorId],
  );

  const ambientHeat = useMemo(() => {
    const scores = participants
      .map((p) => p.tone_signal)
      .filter((n): n is number => typeof n === 'number');
    if (scores.length === 0) return null;
    return Math.max(...scores);
  }, [participants]);

  async function applyPacing(mode: RoomPacingMode) {
    if (!sessionId) return;
    setPacingBusy(true);
    setTransitionError(null);
    const result = await facilitatorSetRoomPacing(sessionId, mode);
    setPacingBusy(false);
    if (!result.ok) {
      setTransitionError(result.error ?? 'Could not update room pacing.');
      return;
    }
    setPacingMode(mode);
    if (mode === 'paused') setRoomStatus('paused');
    if (mode === 'normal' && roomStatus === 'paused') setRoomStatus('live');
  }

  async function advanceStage(target: DialogueStage) {
    if (!sessionId) return;
    setStageBusy(true);
    setTransitionError(null);
    const result = await facilitatorAdvanceDialogueStage(sessionId, target);
    setStageBusy(false);
    if (!result.ok) {
      setTransitionError(result.error ?? 'Could not advance dialogue stage.');
      return;
    }
    setDialogueStage(result.dialogue_stage ?? target);
  }

  async function setLive() {
    if (!sessionId) return;
    setTransitionError(null);
    try {
      await updateSessionStatus(sessionId, 'live');
      setRoomStatus('live');
      if (dialogueStage === 'preparation') {
        await advanceStage('opening');
      } else {
        await facilitatorStartPhaseTimer(sessionId);
      }
    } catch (err) {
      setTransitionError(
        err instanceof Error
          ? err.message
          : 'Could not start session. Verify all participants first.',
      );
    }
  }

  async function setPaused() {
    if (!sessionId) return;
    setTransitionError(null);
    try {
      await updateSessionStatus(sessionId, 'paused');
      setRoomStatus('paused');
      await facilitatorPausePhaseTimer(sessionId, 'Session paused');
    } catch (err) {
      setTransitionError(err instanceof Error ? err.message : 'Could not pause session.');
    }
  }

  async function endSession() {
    if (!sessionId) return;
    setTransitionError(null);
    try {
      if (dialogueStage !== 'outcome_ready') {
        const ready = await facilitatorAdvanceDialogueStage(sessionId, 'outcome_ready');
        if (ready.ok) setDialogueStage('outcome_ready');
      }
      await updateSessionStatus(sessionId, 'ended');
      setRoomStatus('ended');
      setShowEndModal(false);
    } catch (err) {
      setTransitionError(err instanceof Error ? err.message : 'Could not end session.');
      setShowEndModal(false);
    }
  }

  async function sendFacilitatorMessage() {
    if (!facilitatorInput.trim()) return;
    setSendError(null);
    const result = await sendMessage(facilitatorInput, 'Facilitator', 'facilitator');
    if (!result.ok) {
      setSendError(
        result.error === 'ROOM_KEY_MISSING' || result.error === 'CIPHERTEXT_REQUIRED'
          ? 'Could not seal this message. Check room encryption status and try again.'
          : (result.error ?? 'Could not send message.'),
      );
      return;
    }
    setFacilitatorInput('');
  }

  async function onExtend() {
    if (!sessionId) return;
    setPacingBusy(true);
    const result = await facilitatorExtendPhaseTimer(
      sessionId,
      300,
      extendReason.trim() || 'Facilitator extended the phase budget',
    );
    setPacingBusy(false);
    if (!result.ok) setTransitionError(result.error ?? 'Could not extend timer.');
    else setExtendReason('');
  }

  async function onPauseTimer() {
    if (!sessionId) return;
    setPacingBusy(true);
    const result = await facilitatorPausePhaseTimer(
      sessionId,
      extendReason.trim() || 'Facilitator paused the phase timer',
    );
    setPacingBusy(false);
    if (!result.ok) setTransitionError(result.error ?? 'Could not pause timer.');
  }

  async function onRecess() {
    if (!sessionId) return;
    setPacingBusy(true);
    const result = await facilitatorInvokeRecess(sessionId);
    setPacingBusy(false);
    if (!result.ok) {
      setTransitionError(result.error ?? 'Could not start recess.');
      return;
    }
    setPacingMode('paused');
    setRoomStatus('paused');
    setRecessSecondsLeft(result.recess_seconds ?? 90);
  }

  async function onToggleFloor(participantId: string) {
    if (!sessionId) return;
    setFloorBusy(true);
    const next = floorId === participantId ? null : participantId;
    const result = await facilitatorSetFloor(sessionId, next);
    setFloorBusy(false);
    if (!result.ok) setTransitionError(result.error ?? 'Could not update floor.');
  }

  if (loading) return <RouteSkeleton label="Loading session" />;

  if (!session && !loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-ink">Session not found</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          This control room link may be invalid, or you may not have access.
        </p>
        <button
          type="button"
          onClick={() => navigate(appRoutes.sessions)}
          className="mt-6 text-sm font-medium text-brand underline"
        >
          Back to sessions
        </button>
      </div>
    );
  }

  const statusLabel: Record<RoomStatus, string> = {
    waiting: 'Waiting',
    live: 'Live',
    paused: 'Paused',
    ended: 'Ended',
  };

  const sessionIdShort = (sessionId ?? '').slice(0, 8);

  return (
    <>
      <div className="mx-auto max-w-6xl p-4 md:p-6" data-demo="session-control">
        <RoomShell
          sessionTitle={session?.title ?? 'Session'}
          sessionIdShort={sessionIdShort || '—'}
          dialogueStage={dialogueStage}
          quietMode={quietMode}
          onQuietModeChange={setQuietMode}
          remainingSeconds={phaseTimer.remainingSeconds}
          durationSeconds={phaseTimer.durationSeconds}
          timerState={phaseTimer.timerState}
          urgency={phaseTimer.urgency}
          roster={roster}
          ambientHeat={ambientHeat}
          topExtra={
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2">
                <RoomPrivacyStatus
                  className="flex-1"
                  variant={privacyState === 'sealed_app_layer' ? 'sealed_app_layer' : privacyState}
                  detail={cryptoError}
                />
                <span className="rounded bg-surface-sunken px-2.5 py-1 text-xs font-semibold tabular-nums text-ink">
                  {statusLabel[status]}
                </span>
              </div>
              {recessSecondsLeft != null ? (
                <div
                  className="border-b border-sem-warning/40 bg-sem-warning-soft px-4 py-3 text-center text-sm text-ink"
                  role="status"
                  aria-live="polite"
                >
                  Pause — {recessSecondsLeft}s. Take a breath; posting stays limited until you clear
                  pacing.
                </div>
              ) : null}
              {phaseTimer.timerState === 'elapsed' ? (
                <div
                  className="border-b border-line bg-surface-secondary px-4 py-2 text-center text-xs text-ink-secondary"
                  role="status"
                >
                  Phase time has elapsed. Advance the stage when the room is ready — stages do not
                  advance automatically.
                </div>
              ) : null}
            </>
          }
          docketExtra={
            <div className="mt-4 space-y-3">
              <DialogueStageMap current={dialogueStage} compact />
              {session?.issue_goal ? (
                <p className="text-xs text-ink-secondary">
                  <span className="font-medium text-ink">Issue: </span>
                  {session.issue_goal}
                </p>
              ) : null}
              {(status === 'live' || status === 'paused') && dialogueStage !== 'outcome_ready' ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={stageBusy || !prevStage}
                    onClick={() => prevStage && void advanceStage(prevStage)}
                    className="min-h-[44px] rounded border border-line px-3 py-2 text-xs font-medium text-ink-secondary disabled:opacity-40"
                  >
                    Step back
                  </button>
                  <button
                    type="button"
                    disabled={stageBusy || !nextStage}
                    onClick={() => nextStage && void advanceStage(nextStage)}
                    className="btn-pill btn-pill--primary min-h-[44px] text-xs disabled:opacity-40"
                  >
                    {nextStage
                      ? `Advance to ${DIALOGUE_STAGE_CONFIGS[nextStage].label}`
                      : 'Final stage'}
                  </button>
                </div>
              ) : null}
              {participants.length > 0 && (status === 'live' || status === 'paused') ? (
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                    Floor
                  </p>
                  {participants.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={floorBusy}
                      onClick={() => void onToggleFloor(p.id)}
                      className={`block w-full min-h-[40px] rounded border px-2 py-1.5 text-left text-xs disabled:opacity-50 ${
                        floorId === p.id
                          ? 'border-brand/50 bg-brand-soft text-ink'
                          : 'border-line text-ink-secondary'
                      }`}
                    >
                      {floorId === p.id ? `Clear floor · ${p.codename}` : `Grant · ${p.codename}`}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          }
          feed={
            <DeliberationFeed
              messages={messages}
              phaseLabel={stageConfig.label}
              floorCodename={participants.find((p) => p.id === floorId)?.codename ?? null}
              emptyHeading={
                status === 'waiting'
                  ? 'Room is waiting'
                  : status === 'ended'
                    ? 'Room closed'
                    : 'No messages yet'
              }
              emptyBody={
                status === 'waiting'
                  ? 'Start the session when participants are ready.'
                  : status === 'ended'
                    ? 'Draft the outcome when you are ready to open participant review.'
                    : 'Post a stage prompt to open the round.'
              }
            />
          }
          composer={
            status === 'live' || status === 'paused' ? (
              <div className="border-t border-line p-3">
                {sendError ? (
                  <p className="mb-2 text-sm text-sem-danger" role="alert">
                    {sendError}
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={facilitatorInput}
                    onChange={(e) => setFacilitatorInput(e.target.value)}
                    placeholder={`Stage prompt (${stageConfig.label})…`}
                    className="flex-1 resize-none rounded border border-line bg-surface px-3 py-2 text-sm text-ink"
                    disabled={privacyState === 'key_error'}
                  />
                  <button
                    type="button"
                    onClick={() => void sendFacilitatorMessage()}
                    className="btn-pill btn-pill--primary shrink-0 self-end text-sm"
                    disabled={privacyState === 'key_error'}
                  >
                    Send prompt
                  </button>
                </div>
              </div>
            ) : null
          }
        />

        {transitionError ? (
          <div
            className="mt-4 rounded-lg border border-sem-danger/40 bg-sem-danger-soft px-4 py-3 text-sm text-sem-danger"
            role="alert"
          >
            {transitionError}
            {transitionError.toLowerCase().includes('verified') ? (
              <p className="mt-2 text-ink-secondary">
                <button
                  type="button"
                  onClick={() => navigate(appRoutes.sessionParticipants(sessionId ?? ''))}
                  className="min-h-[44px] font-medium text-brand underline"
                >
                  Review participant verification
                </button>
              </p>
            ) : null}
          </div>
        ) : null}

        {connectionStatus !== 'live' && connectionStatus !== 'idle' ? (
          <div
            className="mt-4 rounded-lg bg-surface-secondary px-4 py-3 text-sm text-ink-secondary shadow-sr-sm"
            role="status"
            aria-live="polite"
          >
            {connectionStatus === 'reconnecting'
              ? 'Reconnecting to live messages… Drafts stay on this device until the room syncs.'
              : connectionStatus === 'offline'
                ? 'You appear offline. Messages already loaded remain visible; new sends will retry when connectivity returns.'
                : connectionStatus === 'connection_error'
                  ? 'Live connection failed. You can retry without leaving the room.'
                  : 'Connecting to live messages…'}
            {connectionStatus === 'connection_error' || connectionStatus === 'offline' ? (
              <button
                type="button"
                onClick={retryConnection}
                className="ml-2 min-h-[44px] font-medium text-brand underline"
              >
                Retry connection
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3 rounded-lg bg-surface-elevated p-4 shadow-sr-card">
          {status === 'waiting' && (
            <button
              type="button"
              onClick={() => void setLive()}
              className="btn-pill btn-pill--primary text-sm"
            >
              Start session
            </button>
          )}
          {status === 'live' && (
            <>
              <button
                type="button"
                onClick={() => void setPaused()}
                className="rounded border border-line px-5 py-2.5 text-sm font-medium text-ink"
              >
                Pause session
              </button>
              <button
                type="button"
                onClick={() => setShowEndModal(true)}
                className="rounded bg-sem-danger px-5 py-2.5 text-sm font-medium text-white"
              >
                End session
              </button>
            </>
          )}
          {status === 'paused' && (
            <>
              <button
                type="button"
                onClick={() => void setLive()}
                className="btn-pill btn-pill--primary text-sm"
              >
                Resume session
              </button>
              <button
                type="button"
                onClick={() => setShowEndModal(true)}
                className="rounded border border-line px-5 py-2.5 text-sm font-medium text-ink-secondary"
              >
                End session
              </button>
            </>
          )}
          {status === 'ended' && (
            <button
              type="button"
              onClick={() =>
                navigate(appRoutes.sessionOutcome(sessionId ?? ''), {
                  state: outcomeImport ? { agreedTermsImport: outcomeImport } : undefined,
                })
              }
              className="btn-pill btn-pill--primary text-sm"
            >
              Draft outcome
            </button>
          )}
        </div>

        {status === 'live' || status === 'paused' ? (
          <div className="mt-4 rounded-lg bg-surface-secondary/80 p-4 shadow-sr-sm">
            <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              De-escalation · Power of Pause
            </p>
            <p className="mb-3 text-xs text-ink-secondary">
              {pacingCopy(pacingMode).body} Current: {pacingCopy(pacingMode).title}.
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pacingBusy}
                onClick={() => void applyPacing('slow')}
                className="min-h-[44px] rounded border border-line px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
              >
                Slow down
              </button>
              <button
                type="button"
                disabled={pacingBusy}
                onClick={() => void applyPacing('pull_back')}
                className="min-h-[44px] rounded border border-line px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
              >
                Pull back
              </button>
              <button
                type="button"
                disabled={pacingBusy}
                onClick={() => void applyPacing('paused')}
                className="min-h-[44px] rounded border border-sem-warning/50 px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
              >
                Power of Pause
              </button>
              <button
                type="button"
                disabled={pacingBusy}
                onClick={() => void onRecess()}
                className="min-h-[44px] rounded border border-sem-warning/50 px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
              >
                Recess (90s)
              </button>
              <button
                type="button"
                disabled={pacingBusy || pacingMode === 'normal'}
                onClick={() => void applyPacing('normal')}
                className="min-h-[44px] rounded border border-brand/40 px-4 py-2 text-sm font-medium text-brand disabled:opacity-50"
              >
                Clear pacing
              </button>
            </div>
            <div className="flex flex-wrap items-end gap-2 border-t border-line/60 pt-3">
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-ink-secondary">
                Timer reason (optional)
                <input
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  className="min-h-[44px] rounded border border-line bg-surface px-3 text-sm text-ink"
                  placeholder="Why pause or extend…"
                />
              </label>
              <button
                type="button"
                disabled={pacingBusy || phaseTimer.timerState !== 'running'}
                onClick={() => void onPauseTimer()}
                className="min-h-[44px] rounded border border-line px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
              >
                Pause timer
              </button>
              <button
                type="button"
                disabled={pacingBusy}
                onClick={() => void onExtend()}
                className="min-h-[44px] rounded border border-brand/40 px-4 py-2 text-sm font-medium text-brand disabled:opacity-50"
              >
                Extend +5 min
              </button>
            </div>
          </div>
        ) : null}

        {showResolutions && sessionId ? (
          <div className="mt-4">
            <SessionResolutionPanel
              sessionId={sessionId}
              setupConfig={session?.setup_config}
              roomActive={status === 'live' || status === 'paused'}
              onShortlistReady={setOutcomeImport}
            />
          </div>
        ) : null}
      </div>

      {showEndModal ? (
        <ConfirmModal
          title="End session"
          body="This will close the room for all participants and move toward outcome drafting. Participants will review the draft before any release."
          confirmLabel="End session"
          cancelLabel="Keep open"
          dangerous
          onConfirm={() => void endSession()}
          onCancel={() => setShowEndModal(false)}
        />
      ) : null}
    </>
  );
}
