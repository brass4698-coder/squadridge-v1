import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { SessionResolutionPanel } from '../../../components/facilitator/SessionResolutionPanel';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { useSessionMessages } from '../../../hooks/useSessionMessages';
import { useSession, useSessions } from '../../../hooks/useSessions';
import { appRoutes } from '../../../lib/appRoutes';
import { sessionUsesResolutionWorkflow } from '../../../lib/sessionResolutions';

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

  const showResolutions = sessionUsesResolutionWorkflow(
    session?.template_id,
    session?.setup_config,
  );

  useEffect(() => {
    setRoomStatus(mapSessionStatus(session?.status));
  }, [session?.status]);

  const status = roomStatus;

  async function setLive() {
    if (!sessionId) return;
    setTransitionError(null);
    try {
      await updateSessionStatus(sessionId, 'live');
      setRoomStatus('live');
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
      <AuthenticatedShell>
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
      </AuthenticatedShell>
    );
  }

  const statusLabel: Record<RoomStatus, string> = {
    waiting: 'Waiting',
    live: 'Live',
    paused: 'Paused',
    ended: 'Ended',
  };

  return (
    <AuthenticatedShell>
      <div className="sr-mode-room mx-auto max-w-2xl rounded-lg border border-[color:var(--sr-mode-room-border)] p-5 md:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Facilitator room
            </p>
            <h1 className="text-xl font-semibold text-ink">{session?.title ?? 'Session'}</h1>
            <p className="mt-1 text-xs text-ink-faint">
              Calm facilitation chrome — pause when needed; room content stays private to this
              session.
            </p>
          </div>
          <span className="rounded bg-surface-sunken px-2.5 py-1 text-xs font-semibold tabular-nums text-ink">
            {statusLabel[status]}
          </span>
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
            className="mb-4 rounded-lg border border-line bg-surface-sunken px-4 py-3 text-sm text-ink-secondary"
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

        <div className="mb-6 flex flex-wrap gap-3 rounded-lg border border-line bg-surface-elevated p-4">
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

        <div className="rounded-lg border border-line bg-surface-elevated">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Room dialogue
            </p>
            <p className="text-xs text-ink-faint">Private to session · not published on release</p>
          </div>
          <div className="flex max-h-96 flex-col gap-4 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-secondary">
                {status === 'waiting'
                  ? 'Room is waiting. Start the session when participants are ready.'
                  : 'No messages yet. Facilitator notes appear here when sent.'}
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
                placeholder="Facilitator message…"
                className="flex-1 resize-none rounded border border-line bg-surface px-3 py-2 text-sm text-ink"
              />
              <button
                type="button"
                onClick={() => void sendFacilitatorMessage()}
                className="btn-pill btn-pill--primary shrink-0 self-end text-sm"
              >
                Send
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
          body="This will close the room for all participants. You will be taken to the outcome drafting workspace."
          confirmLabel="End session"
          cancelLabel="Keep open"
          dangerous
          onConfirm={() => void endSession()}
          onCancel={() => setShowEndModal(false)}
        />
      ) : null}
    </AuthenticatedShell>
  );
}
