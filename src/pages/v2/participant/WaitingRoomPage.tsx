import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

/**
 * Waiting room — calm “what happens next” before the dialogue room opens.
 * Distinct from Slow down (participant break) and session pause (facilitator room halt).
 *
 * Token is path-param `/p/waiting/:token` (matches App.v2 routes). Demo uses `demo-token`.
 */
export function WaitingRoomPage() {
  const { token: paramToken } = useParams<{ token: string }>();
  const token = paramToken ?? 'demo-token';
  const [dots, setDots] = useState('.');
  const [admitted, setAdmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 600);
    return () => clearInterval(id);
  }, []);

  // Illustrative admit — replace with realtime session status when wired.
  useEffect(() => {
    const id = setTimeout(() => setAdmitted(true), 5000);
    return () => clearTimeout(id);
  }, []);

  function enterRoom() {
    navigate(`/p/room/${token}`);
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
      data-testid="waiting-room"
    >
      {!admitted ? (
        <>
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            Involvement · waiting
          </p>
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
            Waiting for the facilitator{dots}
          </h1>
          <p
            className="mb-8 max-w-sm text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            You are verified for this room. Stay here—we will move you in when the facilitator opens
            the dialogue. No action is required until then.
          </p>
          <div
            className="w-full max-w-sm rounded-lg border px-6 py-5 text-left"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Northern Watershed Consultation
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              What happens next: facilitator opens the room → you enter dialogue
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              If the room pauses later: composer locks. Slow down (personal break) is separate.
            </p>
          </div>
          <p className="mt-6 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Keep this tab open. Do not share this invite publicly.{' '}
            <Link to="/p/invite/demo-token" className="underline-offset-2 hover:underline">
              Back to invite
            </Link>
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
            The facilitator has opened the session. You may now enter.
          </p>
          <button
            type="button"
            data-testid="enter-room-btn"
            onClick={enterRoom}
            className="rounded px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Enter Room →
          </button>
        </>
      )}
    </div>
  );
}
