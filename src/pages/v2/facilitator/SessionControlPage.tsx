import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import {
  InterventionRail,
  type InterventionParticipantState,
} from '../../../components/pacing/InterventionRail';
import { logPacingIntervention } from '../../../lib/pacing/logPacingIntervention';
import { SLOW_DOWN_COOLDOWN_MS } from '../../../hooks/useSlowDown';
import type { PaceSignalKind } from '../../../lib/pacing/paceSignals';

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

const SEED_PARTICIPANTS: InterventionParticipantState[] = [
  { id: 'p-a', label: 'Participant A', cooldownRemainingMs: 0, lastSignal: null },
  { id: 'p-b', label: 'Participant B', cooldownRemainingMs: 0, lastSignal: 'rapid_send' },
  { id: 'p-c', label: 'Participant C', cooldownRemainingMs: 0, optedIntoBreak: false },
];

export function SessionControlPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<RoomStatus>('waiting');
  const [showEndModal, setShowEndModal] = useState(false);
  const [messages] = useState(SEED_MESSAGES);
  const [participants, setParticipants] =
    useState<InterventionParticipantState[]>(SEED_PARTICIPANTS);
  const [audit, setAudit] = useState<
    { at: string; actor: string; action: string; target: string }[]
  >([]);

  const sessionKey = sessionId ?? 'unknown-session';

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

  const roundProgress = useMemo(
    () => ({ round: status === 'waiting' ? 0 : 1, of: 3, approvalsRemaining: 2 }),
    [status],
  );

  function pushAudit(action: string, target: string) {
    setAudit((prev) =>
      [
        {
          at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: 'Facilitator',
          action,
          target,
        },
        ...prev,
      ].slice(0, 12),
    );
  }

  function applyCooldown(ids: string[], signal?: PaceSignalKind | null) {
    setParticipants((prev) =>
      prev.map((p) =>
        ids.includes(p.id)
          ? {
              ...p,
              cooldownRemainingMs: SLOW_DOWN_COOLDOWN_MS,
              lastSignal: signal ?? p.lastSignal,
              optedIntoBreak: true,
            }
          : p,
      ),
    );
  }

  function onSlowDownOne(participantId: string) {
    applyCooldown([participantId]);
    pushAudit('slow_down', participantId);
    void logPacingIntervention(sessionKey, 'slow_down_facilitator');
  }

  function onSlowDownAll() {
    applyCooldown(participants.map((p) => p.id));
    pushAudit('slow_down_all', 'room');
    void logPacingIntervention(sessionKey, 'slow_down_all');
  }

  return (
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
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Round {roundProgress.round} of {roundProgress.of} · {roundProgress.approvalsRemaining}{' '}
            approvals remaining
          </p>
        </div>
        <span
          className="rounded px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: statusBg[status], color: statusColor[status] }}
        >
          {statusLabel[status]}
        </span>
      </div>

      {/* Room controls — session pause is distinct from Slow down */}
      <div
        className="mb-6 flex flex-wrap gap-3 rounded-lg border p-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        {status === 'waiting' && (
          <button
            type="button"
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
              type="button"
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
              type="button"
              data-testid="facilitator-slow-down-all"
              onClick={onSlowDownAll}
              className="rounded border px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'transparent',
              }}
            >
              Slow down (room)
            </button>
            <button
              type="button"
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
              type="button"
              onClick={() => setStatus('live')}
              className="rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Resume session
            </button>
            <button
              type="button"
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
            type="button"
            onClick={() => navigate(`/sessions/${sessionId}/outcome`)}
            className="rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Draft outcome
          </button>
        )}
        <p className="w-full text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Session pause stops the room. Slow down only applies send cooldowns — participants stay
          involved.
        </p>
      </div>

      <InterventionRail
        className="mb-6"
        participants={participants}
        onSlowDownOne={onSlowDownOne}
        onSlowDownAll={onSlowDownAll}
      />

      {/* Audit trail — metadata only */}
      <div
        className="mb-6 rounded-lg border"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="border-b px-5 py-3" style={{ borderColor: 'var(--color-border)' }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Intervention audit
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Who triggered, duration band, session id — never message bodies.
          </p>
        </div>
        <ul className="space-y-2 p-5">
          {audit.length === 0 ? (
            <li className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No interventions yet this session.
            </li>
          ) : (
            audit.map((row, i) => (
              <li
                key={`${row.at}-${row.action}-${i}`}
                className="text-sm"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>{row.at}</span>
                {' · '}
                {row.actor} · {row.action.replaceAll('_', ' ')} · {row.target}
                {' · '}
                session {sessionKey}
              </li>
            ))
          )}
        </ul>
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
    </div>
  );
}
