import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionResolutionPanel } from '../../../components/facilitator/SessionResolutionPanel';
import { DialogueStageMap } from '../../../components/session/DialogueStageMap';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
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
  const { messages, sendMessage, connectionStatus, retryConnection } =
    useSessionMessages(sessionId);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('waiting');
  const [showEndModal, setShowEndModal] = useState(false);
  const [facilitatorInput, setFacilitatorInput] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [outcomeImport, setOutcomeImport] = useState<string | null>(null);
  const [pacingMode, setPacingMode] = useState<RoomPacingMode>('normal');
  const [pacingBusy, setPacingBusy] = useState(false);
  const [dialogueStage, setDialogueStage] = useState<DialogueStage>('preparation');
  const [stageBusy, setStageBusy] = useState(false);

  const showResolutions = sessionUsesResolutionWorkflow(
    session?.template_id,
    session?.setup_config,
  );

  useEffect(() => {
    setRoomStatus(mapSessionStatus(session?.status));
    setDialogueStage(parseDialogueStage(session?.dialogue_stage));
  }, [session?.status, session?.dialogue_stage]);

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
          const row = payload.new as { dialogue_stage?: string; status?: string } | null;
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

  const status = roomStatus;
  const stageConfig = DIALOGUE_STAGE_CONFIGS[dialogueStage];
  const nextStage = nextDialogueStage(dialogueStage);
  const prevStage = previousDialogueStage(dialogueStage);

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
    await sendMessage(facilitatorInput, 'Facilitator', 'facilitator');
    setFacilitatorInput('');
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

  return (
    <>
      <div
        className="sr-mode-room mx-auto max-w-2xl rounded-lg border border-[color:var(--sr-mode-room-border)] p-5 md:p-6"
        data-demo="session-control"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Facilitator room
            </p>
            <h1 className="text-xl font-semibold text-ink">{session?.title ?? 'Session'}</h1>
            <p className="mt-1 text-xs text-ink-faint">
              Guided resolution instrument — advance stages deliberately; room content stays
              private.
            </p>
          </div>
          <span className="rounded bg-surface-sunken px-2.5 py-1 text-xs font-semibold tabular-nums text-ink">
            {statusLabel[status]}
          </span>
        </div>

        {session?.issue_goal ? (
          <div className="mb-4 rounded-lg bg-surface-secondary px-4 py-3 text-sm text-ink-secondary shadow-sr-sm">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Issue goal
            </p>
            <p className="mt-1 text-ink">{session.issue_goal}</p>
          </div>
        ) : null}

        <div className="mb-6 rounded-lg bg-surface-elevated p-4 shadow-sr-card">
          <DialogueStageMap current={dialogueStage} />
          <p className="mt-2 text-xs text-ink-faint">
            Participants may post only in Story, Framing, Options, and Review. You always control
            prompts and pacing.
          </p>
          {(status === 'live' || status === 'paused') && dialogueStage !== 'outcome_ready' ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={stageBusy || !prevStage}
                onClick={() => prevStage && void advanceStage(prevStage)}
                className="min-h-[44px] rounded border border-line px-4 py-2 text-sm font-medium text-ink-secondary disabled:opacity-40"
              >
                Step back
              </button>
              <button
                type="button"
                disabled={stageBusy || !nextStage}
                onClick={() => nextStage && void advanceStage(nextStage)}
                className="btn-pill btn-pill--primary min-h-[44px] text-sm disabled:opacity-40"
              >
                {nextStage
                  ? `Advance to ${DIALOGUE_STAGE_CONFIGS[nextStage].label}`
                  : 'Final stage'}
              </button>
            </div>
          ) : null}
        </div>

        {transitionError ? (
          <div
            className="mb-4 rounded-lg border border-sem-danger/40 bg-sem-danger-soft px-4 py-3 text-sm text-sem-danger"
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
            className="mb-4 rounded-lg bg-surface-secondary px-4 py-3 text-sm text-ink-secondary shadow-sr-sm"
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

        <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-surface-elevated p-4 shadow-sr-card">
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
          <div className="mb-6 rounded-lg bg-surface-secondary/80 p-4 shadow-sr-sm">
            <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              De-escalation · Power of Pause
            </p>
            <p className="mb-3 text-xs text-ink-secondary">
              {pacingCopy(pacingMode).body} Current: {pacingCopy(pacingMode).title}.
            </p>
            <div className="flex flex-wrap gap-2">
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
                disabled={pacingBusy || pacingMode === 'normal'}
                onClick={() => void applyPacing('normal')}
                className="min-h-[44px] rounded border border-brand/40 px-4 py-2 text-sm font-medium text-brand disabled:opacity-50"
              >
                Clear pacing
              </button>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg bg-surface-elevated shadow-sr-card">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Staged dialogue · {stageConfig.label}
            </p>
            <p className="text-xs text-ink-faint">Private to session · not published on release</p>
          </div>
          <div className="flex max-h-96 flex-col gap-4 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-secondary">
                {status === 'waiting'
                  ? 'Room is waiting. Start the session when participants are ready.'
                  : status === 'ended'
                    ? 'Room closed. Draft the outcome when you are ready to open participant review.'
                    : 'No messages yet. Post a stage prompt to open the round.'}
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id}>
                  <div className="mb-0.5 flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-ink">{m.sender_label}</span>
                    <span className="text-xs text-ink-faint">
                      {new Date(m.sent_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-ink">{m.body}</p>
                </div>
              ))
            )}
          </div>
          {status === 'live' || status === 'paused' ? (
            <div className="flex gap-2 border-t border-line p-4">
              <textarea
                rows={2}
                value={facilitatorInput}
                onChange={(e) => setFacilitatorInput(e.target.value)}
                placeholder={`Stage prompt (${stageConfig.label})…`}
                className="flex-1 resize-none rounded border border-line bg-surface px-3 py-2 text-sm text-ink"
              />
              <button
                type="button"
                onClick={() => void sendFacilitatorMessage()}
                className="btn-pill btn-pill--primary shrink-0 self-end text-sm"
              >
                Send prompt
              </button>
            </div>
          ) : null}
        </div>

        {showResolutions && sessionId ? (
          <SessionResolutionPanel
            sessionId={sessionId}
            setupConfig={session?.setup_config}
            roomActive={status === 'live' || status === 'paused'}
            onShortlistReady={setOutcomeImport}
          />
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
