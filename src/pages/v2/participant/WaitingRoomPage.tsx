import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function WaitingRoomPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? 'demo-token';
  const [dots, setDots] = useState('.');
  const [admitted, setAdmitted] = useState(false);
  const navigate = useNavigate();

  // Animate waiting indicator
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 600);
    return () => clearInterval(id);
  }, []);

  // Simulate facilitator admitting — replace with real-time subscription
  useEffect(() => {
    const id = setTimeout(() => setAdmitted(true), 5000);
    return () => clearTimeout(id);
  }, []);

  function enterRoom() {
    navigate(`/p/room?token=${token}`);
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {!admitted ? (
        <>
          <div
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-accent-light)' }}
            aria-hidden="true"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
            The session has not opened yet, or the facilitator is confirming participants. You will be admitted automatically when the room is ready.
          </p>
          <div
            className="rounded-lg border px-6 py-5"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Northern Watershed Consultation
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Jun 20, 2024 · 10:00 AM
            </p>
          </div>
          <p className="mt-6 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Keep this tab open. Do not refresh.
          </p>
        </>
      ) : (
        <>
          <div
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-accent-light)' }}
            aria-hidden="true"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            className="mb-3 text-2xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            The room is ready
          </h1>
          <p
            className="mb-8 max-w-sm text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            The facilitator has opened the session. You may now enter.
          </p>
          <button
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
