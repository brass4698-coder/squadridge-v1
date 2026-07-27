import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ParticipantResolutionPanel } from '../../../components/participant/ParticipantResolutionPanel';
import { DialogueStageMap } from '../../../components/session/DialogueStageMap';
import { RoomPrivacyStatus } from '../../../components/session/RoomPrivacyStatus';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { useParticipantMessages } from '../../../hooks/useParticipantMessages';
import { useParticipantSession } from '../../../hooks/useParticipantSession';
import { analyzeToneLocal } from '../../../lib/ai/pipeline';
import {
  DIALOGUE_STAGE_CONFIGS,
  parseDialogueStage,
  participantNextActionHint,
  stageAllowsParticipantPost,
} from '../../../lib/dialogueStages';
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

  const refreshPacing = useCallback(async () => {
    if (!token) return;
    const next = await participantGetPacing(token);
    if (next.valid) setPacing(next);
  }, [token]);

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

  return (
    <div className="flex h-screen flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-line bg-surface-elevated px-6 py-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
            Protected session · {roomPaused ? 'Paused' : 'Live'} · {stageConfig.label}
          </p>
          <h1 className="text-base font-semibold text-ink">
            {ctx?.session_title ?? 'Protected session'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setConfirmLeave(true)}
          className="min-h-[44px] rounded border border-line px-4 py-2 text-sm text-ink-secondary transition-opacity hover:opacity-70"
        >
          Leave session
        </button>
      </div>

      <div className="border-b border-line bg-surface-elevated px-6 py-3">
        <DialogueStageMap current={dialogueStage} compact className="mx-auto max-w-2xl" />
        <p className="mx-auto mt-2 max-w-2xl text-xs text-ink-secondary">
          <span className="font-medium text-ink">Next: </span>
          {nextAction}
        </p>
        <RoomPrivacyStatus
          className="mx-auto mt-3 max-w-2xl"
          variant={privacyState}
          detail={cryptoError}
        />
      </div>

      <div
        className="border-b border-line bg-surface-elevated px-6 py-2 text-center text-xs text-ink-secondary"
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
          className="border-b border-sem-warning/40 bg-sem-warning-soft px-6 py-3 text-sm text-ink"
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
              Advisory suggestion from a keyword check that runs in your browser. Nothing was sent
              to the facilitator, and you can post as written.
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
        <div className="flex justify-end border-b border-line bg-surface-elevated px-6 py-2">
          <button
            type="button"
            onClick={() => void onSlowDown()}
            className="min-h-[44px] text-sm font-medium text-brand underline-offset-2 hover:underline"
          >
            Slow down
          </button>
        </div>
      )}

      <ParticipantResolutionPanel token={token} />

      <main
        className="flex-1 overflow-y-auto px-6 py-6"
        aria-label="Session dialogue"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {status === 'syncing' && messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-secondary" role="status">
              Loading contributions…
            </p>
          ) : messages.length === 0 ? (
            <EmptyState
              className="py-10"
              heading="No contributions yet"
              body={
                stageAllowsPost
                  ? 'When you are ready, draft a contribution below. The facilitator may post a stage prompt first.'
                  : 'This stage is facilitator-led. Wait for the process to advance before posting.'
              }
            />
          ) : (
            messages.map((msg) => {
              const isYou = msg.sender_role === 'participant' && msg.sender_label === ctx?.codename;
              const isFacilitator = msg.sender_role === 'facilitator';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${isFacilitator ? 'text-brand' : 'text-ink-secondary'}`}
                    >
                      {isYou ? 'You' : msg.sender_label}
                      {isFacilitator ? ' · Facilitator' : ''}
                    </span>
                    <span className="text-xs text-ink-faint">
                      {new Date(msg.sent_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`max-w-md rounded-xl px-5 py-3 text-sm leading-relaxed ${
                      isYou
                        ? 'bg-brand text-brand-on'
                        : isFacilitator
                          ? 'border border-brand/30 bg-brand-soft text-ink'
                          : 'bg-surface-elevated text-ink shadow-sr-xs'
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <div className="border-t border-line bg-surface-elevated p-4">
        {sendError ? (
          <p className="mx-auto mb-2 max-w-2xl text-sm text-sem-danger" role="alert">
            {sendError}
          </p>
        ) : null}
        <div className="mx-auto flex max-w-2xl gap-3">
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
          Staged contributions · Draft before send · Only the approved outcome may leave the room
        </p>
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
