import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { ParticipantResolutionPanel } from '../../../components/participant/ParticipantResolutionPanel';
import { DeliberationFeed } from '../../../components/session/DeliberationFeed';
import { DialogueStageMap } from '../../../components/session/DialogueStageMap';
import { RoomPrivacyStatus } from '../../../components/session/RoomPrivacyStatus';
import { RoomShell } from '../../../components/session/RoomShell';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { useParticipantMessages } from '../../../hooks/useParticipantMessages';
import { useParticipantSession } from '../../../hooks/useParticipantSession';
import { usePhaseTimer } from '../../../hooks/usePhaseTimer';
import { analyzeToneLocal } from '../../../lib/ai/pipeline';
import {
  DIALOGUE_STAGE_CONFIGS,
  parseDialogueStage,
  participantNextActionHint,
  stageAllowsParticipantPost,
} from '../../../lib/dialogueStages';
import { participantReportToneSignal, type PhaseTimerState } from '../../../lib/phaseTimer';
import { participantRoute } from '../../../lib/participantRoutes';
import {
  participantAcknowledgePause,
  participantGetPacing,
  participantRequestSlowDown,
  pacingCopy,
  type ParticipantPacingState,
} from '../../../lib/sessionPacing';

export function ParticipantRoomPage() {
  const token = useParticipantToken();
  const { ctx, loading: ctxLoading } = useParticipantSession(token ?? '');
  const { messages, status, error, send, refresh, privacyState, cryptoError } =
    useParticipantMessages(token ?? undefined);
  const [input, setInput] = useState('');
  const [draftReady, setDraftReady] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pacing, setPacing] = useState<ParticipantPacingState | null>(null);
  const [localWarning, setLocalWarning] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [quietMode, setQuietMode] = useState(false);
  const navigate = useNavigate();

  const dialogueStage = parseDialogueStage(
    pacing?.dialogue_stage ?? ctx?.dialogue_stage ?? 'preparation',
  );
  const stageConfig = DIALOGUE_STAGE_CONFIGS[dialogueStage];
  const stageAllowsPost =
    pacing?.participant_posting_allowed ??
    ctx?.participant_posting_allowed ??
    stageAllowsParticipantPost(dialogueStage);
  const nextAction = participantNextActionHint(dialogueStage, {
    sessionStatus: pacing?.session_status ?? ctx?.session_status,
    verificationStatus: ctx?.verification_status,
    roomReady: true,
  });

  const phaseTimer = usePhaseTimer({
    sessionId: ctx?.session_id,
    canMarkElapsed: false,
    initial: pacing
      ? {
          phase_started_at: pacing.phase_started_at ?? null,
          phase_duration_seconds: pacing.phase_duration_seconds ?? null,
          phase_timer_state: (pacing.phase_timer_state ?? 'idle') as PhaseTimerState,
          session_ends_at: pacing.session_ends_at ?? null,
          server_now: pacing.server_now ?? null,
        }
      : null,
  });

  const resyncTimer = phaseTimer.resync;

  const refreshPacing = useCallback(async () => {
    if (!token) return;
    const next = await participantGetPacing(token);
    if (next.valid) {
      setPacing(next);
      resyncTimer({
        phase_started_at: next.phase_started_at ?? null,
        phase_duration_seconds: next.phase_duration_seconds ?? null,
        phase_timer_state: (next.phase_timer_state ?? 'idle') as PhaseTimerState,
        session_ends_at: next.session_ends_at ?? null,
        server_now: next.server_now ?? null,
      });
    }
  }, [token, resyncTimer]);

  useEffect(() => {
    if (!token) return;
    void refreshPacing();
    const id = window.setInterval(() => void refreshPacing(), 3000);
    return () => window.clearInterval(id);
  }, [token, refreshPacing]);

  async function sendMessage() {
    if (!input.trim() || !token) return;
    setSendError(null);

    if (!draftReady) {
      setDraftReady(true);
      setSendError(null);
      return;
    }

    const tone = analyzeToneLocal(input);
    if (tone.tensionLevel > 0.5 && tone.suggestion) {
      setLocalWarning(tone.suggestion);
      void participantReportToneSignal(token, tone.tensionLevel);
    } else {
      setLocalWarning(null);
    }

    if (!stageAllowsPost) {
      setSendError('This stage is facilitator-led. Posting opens when the facilitator advances.');
      return;
    }

    if (pacing?.posting_blocked) {
      setSendError(
        pacing.acknowledge_required
          ? 'Acknowledge the pause before posting again.'
          : 'Posting is temporarily limited while the room slows down.',
      );
      return;
    }

    const result = await send(input);
    if (result.ok) {
      setInput('');
      setDraftReady(false);
      void refreshPacing();
    } else {
      const code = result.error ?? '';
      if (code === 'ROOM_PAUSED' || code === 'PAUSE_ACK_REQUIRED') {
        setSendError('The room is paused. Acknowledge when you are ready to continue.');
      } else if (code === 'POSTING_RESTRICTED') {
        setSendError(
          'Posting is temporarily limited. Take a breath, then try a shorter contribution.',
        );
      } else if (code === 'STAGE_POSTING_CLOSED') {
        setSendError('This stage does not accept participant posts yet.');
      } else {
        setSendError(code || 'Could not send. Check your connection and try again.');
      }
      void refreshPacing();
    }
  }

  async function onSlowDown() {
    if (!token) return;
    const next = await participantRequestSlowDown(token);
    if (next.valid) setPacing(next);
  }

  async function onAcknowledge() {
    if (!token) return;
    const next = await participantAcknowledgePause(token);
    if (next.valid) setPacing(next);
  }

  function leave() {
    if (!token) return;
    navigate(participantRoute('done', token));
  }

  const roster = [
    {
      id: ctx?.participant_id ?? 'self',
      label: ctx?.codename ?? 'You',
      status: ctx?.verification_status ?? 'present',
      hasFloor: Boolean(
        pacing?.floor_holder_codename &&
        ctx?.codename &&
        pacing.floor_holder_codename === ctx.codename,
      ),
    },
    ...(pacing?.floor_holder_codename && pacing.floor_holder_codename !== ctx?.codename
      ? [
          {
            id: 'floor-holder',
            label: pacing.floor_holder_codename,
            status: 'floor',
            hasFloor: true,
          },
        ]
      : []),
  ];

  if (!token) return null;

  if (ctxLoading && !ctx) {
    return <RouteSkeleton label="Loading room" />;
  }

  if (ctx && ctx.valid === false) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-surface px-6 text-center">
        <h1 className="mb-3 text-xl font-semibold text-ink">Room link unavailable</h1>
        <p className="max-w-sm text-sm text-ink-secondary">
          This room link is invalid or expired. Ask your facilitator for a fresh invite.
        </p>
      </div>
    );
  }

  const roomPaused = pacing?.session_status === 'paused' || pacing?.pacing_mode === 'paused';
  const warningMessage =
    localWarning ||
    pacing?.warning_message ||
    (pacing?.pacing_mode && pacing.pacing_mode !== 'normal'
      ? pacingCopy(pacing.pacing_mode).body
      : null);
  const postingBlocked = Boolean(pacing?.posting_blocked) || roomPaused || !stageAllowsPost;
  const sessionIdShort = (ctx?.session_id ?? '').slice(0, 8);

  return (
    <div className="flex h-screen flex-col bg-surface p-3 md:p-4">
      <RoomShell
        className="h-full min-h-0 flex-1"
        sessionTitle={ctx?.session_title ?? 'Protected session'}
        sessionIdShort={sessionIdShort || '—'}
        dialogueStage={dialogueStage}
        facilitatorPresent
        quietMode={quietMode}
        onQuietModeChange={setQuietMode}
        remainingSeconds={phaseTimer.remainingSeconds}
        durationSeconds={phaseTimer.durationSeconds}
        timerState={phaseTimer.timerState}
        urgency={phaseTimer.urgency}
        roster={roster}
        topExtra={
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2">
              <p className="text-xs text-ink-secondary">
                {roomPaused ? 'Paused' : 'Live'} · {stageConfig.label}
              </p>
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                className="min-h-[44px] rounded border border-line px-3 py-1.5 text-xs text-ink-secondary"
              >
                Leave session
              </button>
            </div>
            <div className="border-b border-line px-4 py-2">
              <DialogueStageMap current={dialogueStage} compact />
              {!quietMode ? (
                <p className="mt-2 text-xs text-ink-secondary">
                  <span className="font-medium text-ink">Next: </span>
                  {nextAction}
                </p>
              ) : null}
              <RoomPrivacyStatus className="mt-2" variant={privacyState} detail={cryptoError} />
            </div>
            <div
              className="border-b border-line bg-surface-elevated px-4 py-2 text-center text-xs text-ink-secondary"
              role="status"
              aria-live="polite"
            >
              {error
                ? `Sync issue: ${error}`
                : status === 'offline'
                  ? 'Offline — messages will sync when you reconnect'
                  : status === 'syncing'
                    ? 'Syncing messages…'
                    : status === 'error'
                      ? 'Could not load messages. Check your connection and retry.'
                      : 'Connected — messages refresh automatically'}
              {status === 'error' || status === 'offline' ? (
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="ml-2 min-h-[44px] font-medium text-brand underline"
                >
                  Retry
                </button>
              ) : null}
            </div>
            {warningMessage ? (
              <div
                className="border-b border-sem-warning/40 bg-sem-warning-soft px-4 py-3 text-sm text-ink"
                role="status"
                aria-live="polite"
              >
                <p className="font-medium">
                  {pacing?.pacing_mode && pacing.pacing_mode !== 'normal'
                    ? pacingCopy(pacing.pacing_mode).title
                    : 'Take care with tone'}
                </p>
                <p className="mt-1 text-ink-secondary">{warningMessage}</p>
                {localWarning ? (
                  <p className="mt-1 text-xs text-ink-faint">
                    Advisory suggestion from a keyword check that runs in your browser. The
                    facilitator may see a quiet cue on the roster — not a public label — and you can
                    still post as written.
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {pacing?.acknowledge_required ? (
                    <button
                      type="button"
                      onClick={() => void onAcknowledge()}
                      className="btn-institutional btn-institutional--primary min-h-[44px] text-sm"
                    >
                      I am ready to continue
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void onSlowDown()}
                    className="btn-institutional btn-institutional--ghost min-h-[44px] text-sm"
                  >
                    Slow down
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end border-b border-line px-4 py-2">
                <button
                  type="button"
                  onClick={() => void onSlowDown()}
                  className="min-h-[44px] text-sm font-medium text-brand underline-offset-2 hover:underline"
                >
                  Slow down
                </button>
              </div>
            )}
            {phaseTimer.timerState === 'elapsed' ? (
              <div
                className="border-b border-line bg-surface-secondary px-4 py-2 text-center text-xs text-ink-secondary"
                role="status"
              >
                Time for this phase has elapsed. Wait for the facilitator to advance.
              </div>
            ) : null}
          </>
        }
        docketExtra={
          <p className="mt-3 text-xs text-ink-secondary">
            {quietMode ? 'Quiet mode on.' : stageConfig.participantPrompt}
          </p>
        }
        feed={
          <DeliberationFeed
            messages={messages}
            phaseLabel={stageConfig.label}
            floorCodename={pacing?.floor_holder_codename ?? null}
            selfLabel={ctx?.codename ?? null}
            emptyHeading="No contributions yet"
            emptyBody={
              stageAllowsPost
                ? 'When you are ready, draft a contribution below. The facilitator may post a stage prompt first.'
                : 'This stage is facilitator-led. Wait for the process to advance before posting.'
            }
          />
        }
        composer={
          <div className="border-t border-line bg-surface-elevated p-3">
            {sendError ? (
              <p className="mb-2 text-sm text-sem-danger" role="alert">
                {sendError}
              </p>
            ) : null}
            <div className="flex gap-3">
              <label htmlFor="participant-input" className="sr-only">
                Your contribution
              </label>
              <textarea
                id="participant-input"
                rows={2}
                value={input}
                disabled={postingBlocked}
                onChange={(e) => {
                  setInput(e.target.value);
                  setDraftReady(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={
                  !stageAllowsPost
                    ? 'Facilitator-led stage — posting opens when the process advances'
                    : postingBlocked
                      ? 'Posting paused — wait for pacing to clear or acknowledge the pause'
                      : draftReady
                        ? 'Review your draft, then confirm send'
                        : 'Draft your contribution… (Enter reviews, then confirms)'
                }
                className="flex-1 resize-none rounded border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!input.trim() || postingBlocked}
                className="btn-institutional btn-institutional--primary shrink-0 disabled:opacity-40"
              >
                {draftReady ? 'Confirm send' : 'Review'}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-ink-secondary">
              Staged contributions · Draft before send · Only the approved outcome may leave the
              room
            </p>
          </div>
        }
      />

      <div className="mt-2">
        <ParticipantResolutionPanel token={token} />
      </div>

      {confirmLeave && (
        <ConfirmModal
          title="Leave this session?"
          body="You will exit the room. Your previous contributions remain in the session record for facilitator reference only and will not be published. You may not be able to re-enter."
          confirmLabel="Leave session"
          cancelLabel="Stay"
          dangerous
          onConfirm={leave}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
    </div>
  );
}
