import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

type RoomStatus = 'live' | 'paused' | 'closed';

type Participant = { id: string; name: string; org: string; verified: boolean; joined: string };

const mockParticipants: Participant[] = [
  { id: 'p1', name: 'Amara Nwosu',    org: 'NGO Partners',        verified: true,  joined: '10:02 AM' },
  { id: 'p2', name: 'Jonas Berglund', org: 'Nordic Mediation',    verified: true,  joined: '10:04 AM' },
  { id: 'p3', name: 'Priya Chandran', org: 'Policy Institute',    verified: true,  joined: '10:05 AM' },
  { id: 'p4', name: 'Kwame Asante',   org: 'Civil Society GH',   verified: false, joined: '—' },
  { id: 'p5', name: 'Leila Ahmadi',   org: 'Regional Gov.',      verified: true,  joined: '10:07 AM' },
];

type Event = { time: string; text: string; type: 'info' | 'join' | 'action' };
const mockEvents: Event[] = [
  { time: '10:01 AM', text: 'Session opened by facilitator.', type: 'info' },
  { time: '10:02 AM', text: 'Amara Nwosu joined.', type: 'join' },
  { time: '10:04 AM', text: 'Jonas Berglund joined.', type: 'join' },
  { time: '10:05 AM', text: 'Priya Chandran joined.', type: 'join' },
  { time: '10:07 AM', text: 'Leila Ahmadi joined.', type: 'join' },
  { time: '10:09 AM', text: 'Ground rules acknowledged by all present participants.', type: 'action' },
];

export function LiveRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>() ?? {};
  const [status, setStatus] = useState<RoomStatus>('live');
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [confirmClose, setConfirmClose] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');

  function pauseResume() {
    setStatus((s) => (s === 'live' ? 'paused' : 'live'));
    setEvents((e) => [
      ...e,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: status === 'live' ? 'Room paused by facilitator.' : 'Room resumed by facilitator.',
        type: 'action' as const,
      },
    ]);
  }

  function closeRoom() {
    setStatus('closed');
    setConfirmClose(false);
    setEvents((e) => [
      ...e,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Room closed by facilitator. Outcome drafting now available.',
        type: 'info' as const,
      },
    ]);
  }

  function broadcast() {
    if (!broadcastText.trim()) return;
    setEvents((e) => [
      ...e,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Facilitator broadcast: "${broadcastText.trim()}"`,
        type: 'action' as const,
      },
    ]);
    setBroadcastText('');
  }

  const eventColor: Record<Event['type'], string> = {
    info:   'var(--color-text-secondary)',
    join:   'var(--color-success)',
    action: 'var(--color-accent)',
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Room header */}
      <div
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1
              className="text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Northern Watershed Consultation
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Session ID: {sessionId ?? 'sess-001'}
            </p>
          </div>
          <StatusBadge variant={status === 'live' ? 'live' : status === 'paused' ? 'warning' : 'archived'}>
            {status === 'live' ? '● Live' : status === 'paused' ? '⏸ Paused' : '✓ Closed'}
          </StatusBadge>
        </div>

        <div className="flex items-center gap-3">
          {status !== 'closed' && (
            <>
              <button
                onClick={pauseResume}
                className="rounded border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {status === 'live' ? 'Pause Room' : 'Resume Room'}
              </button>
              <button
                onClick={() => setConfirmClose(true)}
                className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-danger)' }}
              >
                Close Room
              </button>
            </>
          )}
          {status === 'closed' && (
            <Link
              to={`/outcomes/new?sessionId=${sessionId ?? 'sess-001'}`}
              className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Begin Outcome Drafting →
            </Link>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity log */}
        <main
          className="flex flex-1 flex-col overflow-hidden border-r"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div
            className="border-b px-6 py-3"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Activity Log
            </h2>
          </div>

          <ol
            className="flex-1 overflow-y-auto px-6 py-4"
            aria-label="Session activity log"
            aria-live="polite"
            aria-atomic="false"
          >
            {events.map((ev, i) => (
              <li key={i} className="mb-3 flex gap-4">
                <span
                  className="shrink-0 font-mono text-xs"
                  style={{ color: 'var(--color-text-secondary)', minWidth: '5rem' }}
                >
                  {ev.time}
                </span>
                <span className="text-sm" style={{ color: eventColor[ev.type] }}>
                  {ev.text}
                </span>
              </li>
            ))}
          </ol>

          {/* Broadcast bar */}
          {status !== 'closed' && (
            <div
              className="border-t p-4"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex gap-3">
                <label htmlFor="broadcast" className="sr-only">Broadcast message to all participants</label>
                <input
                  id="broadcast"
                  type="text"
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') broadcast(); }}
                  placeholder="Broadcast a message to all participants…"
                  className="flex-1 rounded border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <button
                  onClick={broadcast}
                  className="shrink-0 rounded px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Participant panel */}
        <aside className="w-64 overflow-y-auto shrink-0" aria-label="Participants">
          <div
            className="border-b px-5 py-3"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Participants ({mockParticipants.filter((p) => p.verified).length} joined)
            </h2>
          </div>
          <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {mockParticipants.map((p) => (
              <li key={p.id} className="flex items-start gap-3 px-5 py-3.5">
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: p.verified ? 'var(--color-accent)' : 'var(--color-border)' }}
                  aria-hidden="true"
                >
                  {p.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {p.name}
                  </p>
                  <p
                    className="truncate text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {p.org}
                  </p>
                  {p.verified ? (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-success)' }}>
                      Joined {p.joined}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Not yet joined
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Confirm close modal */}
      {confirmClose && (
        <ConfirmModal
          title="Close this room?"
          body="Once the room is closed, participants will no longer be able to send messages. You will be able to begin the outcome drafting process. This cannot be undone."
          confirmLabel="Close Room"
          cancelLabel="Keep Open"
          dangerous
          onConfirm={closeRoom}
          onCancel={() => setConfirmClose(false)}
        />
      )}
    </div>
  );
}
