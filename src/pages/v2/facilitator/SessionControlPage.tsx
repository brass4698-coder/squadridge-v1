import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { appRoutes } from '../../../lib/appRoutes';

type RoomStatus = 'waiting' | 'live' | 'paused' | 'ended';

const SEED_MESSAGES = [
  { id: 'm1', sender: 'Participant A', text: 'Thank you for facilitating this.', time: '10:02' },
  {
    id: 'm2',
    sender: 'Participant B',
    text: 'I would like to start by stating my main concern.',
    time: '10:03',
  },
  {
    id: 'm3',
    sender: 'Facilitator',
    text: 'Please go ahead. All parties have the floor.',
    time: '10:04',
  },
];

export function SessionControlPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<RoomStatus>('waiting');
  const [showEndModal, setShowEndModal] = useState(false);
  const [messages] = useState(SEED_MESSAGES);

  const statusLabel: Record<RoomStatus, string> = {
    waiting: 'Waiting',
    live: 'Live',
    paused: 'Paused',
    ended: 'Ended',
  };
  const statusColor: Record<RoomStatus, string> = {
    waiting: '#92710a',
    live: '#065f46',
    paused: 'var(--color-text-secondary)',
    ended: 'var(--color-text-secondary)',
  };
  const statusBg: Record<RoomStatus, string> = {
    waiting: 'var(--color-pending-strip)',
    live: '#d1fae5',
    paused: 'var(--color-border)',
    ended: 'var(--color-border)',
  };

  return (
    <AuthenticatedShell>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Session {sessionId}
            </p>
            <h1
              className="text-xl font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Control panel
            </h1>
          </div>
          <span
            className="rounded px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: statusBg[status], color: statusColor[status] }}
          >
            {statusLabel[status]}
          </span>
        </div>

        {/* Room controls */}
        <div
          className="mb-6 flex flex-wrap gap-3 rounded-lg border p-4"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          {status === 'waiting' && (
            <button
              onClick={() => setStatus('live')}
              className="rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Admit participants
            </button>
          )}
          {status === 'live' && (
            <>
              <button
                onClick={() => setStatus('paused')}
                className="rounded border px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'transparent',
                }}
              >
                Pause session
              </button>
              <button
                onClick={() => setShowEndModal(true)}
                className="rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-danger, #dc2626)' }}
              >
                End session
              </button>
            </>
          )}
          {status === 'paused' && (
            <>
              <button
                onClick={() => setStatus('live')}
                className="rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                Resume session
              </button>
              <button
                onClick={() => setShowEndModal(true)}
                className="rounded border px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent',
                }}
              >
                End session
              </button>
            </>
          )}
          {status === 'ended' && (
            <button
              onClick={() => navigate(appRoutes.sessionOutcome(sessionId ?? ''))}
              className="rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Draft outcome
            </button>
          )}
        </div>

        {/* Live transcript */}
        <div
          className="rounded-lg border"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <div
            className="flex items-center justify-between border-b px-5 py-3"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Room transcript
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Visible to facilitator only
            </p>
          </div>
          <div className="flex flex-col gap-4 p-5">
            {messages.map((m) => (
              <div key={m.id}>
                <div className="mb-0.5 flex items-baseline gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {m.sender}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {m.time}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEndModal && (
        <ConfirmModal
          title="End session"
          body="This will close the room for all participants. You will be taken to the outcome drafting workspace. This action cannot be undone."
          confirmLabel="End session"
          cancelLabel="Keep open"
          dangerous
          onConfirm={() => {
            setStatus('ended');
            setShowEndModal(false);
          }}
          onCancel={() => setShowEndModal(false)}
        />
      )}
    </AuthenticatedShell>
  );
}
