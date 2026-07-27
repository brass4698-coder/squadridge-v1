import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DialogueStageMap } from '../../../components/session/DialogueStageMap';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { TokenShell } from '../../../components/layout/TokenShell';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { useParticipantSession } from '../../../hooks/useParticipantSession';
import { parseDialogueStage, participantNextActionHint } from '../../../lib/dialogueStages';
import { participantRoute } from '../../../lib/participantRoutes';
import { isParticipantRoomReady } from '../../../lib/participantRoomGate';

export function WaitingRoomPage() {
  const token = useParticipantToken();
  const { ctx, loading, refresh } = useParticipantSession(token ?? '');
  const [dots, setDots] = useState('.');
  const navigate = useNavigate();

  const admitted = isParticipantRoomReady(ctx?.session_status, ctx?.verification_status);
  const dialogueStage = parseDialogueStage(ctx?.dialogue_stage);
  const nextAction = participantNextActionHint(dialogueStage, {
    sessionStatus: ctx?.session_status,
    verificationStatus: ctx?.verification_status,
    roomReady: admitted,
  });

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 600);
    return () => clearInterval(id);
  }, []);

  // Poll facilitator session status until room is live and participant is verified
  useEffect(() => {
    if (!token) return;
    const poll = setInterval(() => void refresh(), 3000);
    return () => clearInterval(poll);
  }, [token, refresh]);

  function enterRoom() {
    if (!token) return;
    navigate(participantRoute('room', token));
  }

  if (!token) return null;

  if (loading && !ctx) {
    return (
      <TokenShell>
        <RouteSkeleton label="Loading waiting room" />
      </TokenShell>
    );
  }

  if (ctx && ctx.valid === false) {
    return (
      <TokenShell>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Link unavailable</h1>
          <p className="max-w-sm text-sm text-ink-secondary">
            This waiting-room link is invalid or expired. Ask your facilitator for a fresh invite.
          </p>
        </div>
      </TokenShell>
    );
  }

  const sessionTitle = ctx?.session_title ?? 'Protected session';
  const pendingVerification = ctx?.verification_status === 'pending';
  const denied = ctx?.verification_status === 'denied';

  return (
    <TokenShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 w-full max-w-md rounded-lg bg-surface-elevated p-4 text-left shadow-sr-card motion-safe:animate-step-in">
          <DialogueStageMap current={dialogueStage} compact />
          <p className="mt-3 text-xs leading-relaxed text-ink-secondary">
            <span className="font-medium text-ink">Next: </span>
            {nextAction}
          </p>
        </div>

        {denied ? (
          <>
            <h1 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
              Access not approved
            </h1>
            <p className="max-w-sm text-sm text-ink-secondary">
              The facilitator has not approved your participation. Contact them if you believe this
              is an error.
            </p>
          </>
        ) : !admitted ? (
          <>
            <div
              className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft"
              aria-hidden="true"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-brand"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
              {pendingVerification
                ? `Awaiting facilitator approval${dots}`
                : `Waiting for the facilitator${dots}`}
            </h1>
            <p className="mb-8 max-w-sm text-sm leading-relaxed text-ink-secondary">
              {pendingVerification
                ? 'Your verification materials were submitted. The facilitator must approve you before the room opens.'
                : 'The session has not opened yet. You can enter when the facilitator opens the room and you are verified.'}
            </p>
            <div className="rounded-lg border border-line bg-surface-elevated px-6 py-5 shadow-sr-sm">
              <p className="text-sm font-medium text-ink">{sessionTitle}</p>
              {ctx?.session_status ? (
                <p className="mt-1 text-xs capitalize text-ink-secondary">
                  Session status: {ctx.session_status}
                </p>
              ) : null}
            </div>
            <p className="mt-6 text-xs text-ink-secondary">
              Keep this tab open. Status refreshes automatically.
            </p>
          </>
        ) : (
          <>
            <div
              className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft"
              aria-hidden="true"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-brand"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
              The room is ready
            </h1>
            <p className="mb-8 max-w-sm text-sm text-ink-secondary">
              The facilitator has opened the session and you are verified. You may now enter.
            </p>
            <button
              type="button"
              onClick={enterRoom}
              className="btn-institutional btn-institutional--primary min-h-[44px] px-8"
            >
              Enter Room →
            </button>
          </>
        )}
      </div>
    </TokenShell>
  );
}
