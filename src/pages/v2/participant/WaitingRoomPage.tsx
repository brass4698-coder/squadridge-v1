import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenShell } from '../../../components/layout/TokenShell';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { useParticipantSession } from '../../../hooks/useParticipantSession';
import { participantRoute } from '../../../lib/participantRoutes';

const LIVE_STATUSES = new Set(['live', 'open', 'paused']);

function isRoomReady(
  sessionStatus: string | undefined,
  verificationStatus: string | undefined,
): boolean {
  return verificationStatus === 'verified' && !!sessionStatus && LIVE_STATUSES.has(sessionStatus);
}

export function WaitingRoomPage() {
  const token = useParticipantToken();
  const { ctx, refresh } = useParticipantSession(token ?? '');
  const [dots, setDots] = useState('.');
  const navigate = useNavigate();

  const admitted = isRoomReady(ctx?.session_status, ctx?.verification_status);

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

  const sessionTitle = ctx?.session_title ?? 'Protected session';
  const pendingVerification = ctx?.verification_status === 'pending';
  const denied = ctx?.verification_status === 'denied';

  return (
    <TokenShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        {denied ? (
          <>
            <h1
              className="mb-3 text-2xl font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Access not approved
            </h1>
            <p className="max-w-sm text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              The facilitator has not approved your participation. Contact them if you believe this
              is an error.
            </p>
          </>
        ) : !admitted ? (
          <>
            <div
              className="mb-8 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--color-accent-light)' }}
              aria-hidden="true"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1
              className="mb-3 text-2xl font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {pendingVerification
                ? `Awaiting facilitator approval${dots}`
                : `Waiting for the facilitator${dots}`}
            </h1>
            <p
              className="mb-8 max-w-sm text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {pendingVerification
                ? 'Your verification materials were submitted. The facilitator must approve you before the room opens.'
                : 'The session has not opened yet. You can enter when the facilitator opens the room and you are verified.'}
            </p>
            <div
              className="rounded-lg border px-6 py-5"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {sessionTitle}
              </p>
              {ctx?.session_status ? (
                <p
                  className="mt-1 text-xs capitalize"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Session status: {ctx.session_status}
                </p>
              ) : null}
            </div>
            <p className="mt-6 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Keep this tab open. Status refreshes automatically.
            </p>
          </>
        ) : (
          <>
            <div
              className="mb-8 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--color-accent-light)' }}
              aria-hidden="true"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1
              className="mb-3 text-2xl font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              The room is ready
            </h1>
            <p className="mb-8 max-w-sm text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              The facilitator has opened the session and you are verified. You may now enter.
            </p>
            <button
              type="button"
              onClick={enterRoom}
              className="rounded px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Enter Room →
            </button>
          </>
        )}
      </div>
    </TokenShell>
  );
}
