import type { SessionAuditEvent } from '../../hooks/useSessionAudit';

const EVENT_LABELS: Record<string, string> = {
  verification_submitted: 'Verification submitted',
  participant_verified: 'Participant verified',
  participant_denied: 'Participant denied',
  room_opened: 'Room opened',
  room_entered: 'Participant entered room',
  prompt_posted: 'Facilitator prompt',
  approval_given: 'Approval recorded',
  record_released: 'Record released',
};

type Props = {
  events: SessionAuditEvent[];
  loading: boolean;
  error: string | null;
};

export function SessionAuditPanel({ events, loading, error }: Props) {
  if (loading) {
    return <p className="text-sm text-ink-secondary">Loading audit trail…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-ink-secondary" role="status">
        Audit trail unavailable: {error}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">
        No lifecycle events recorded yet. Events appear when participants submit verification, the
        room opens, and the record is released.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {events.map((event, index) => (
        <li
          key={`${event.created_at}-${event.event_type}-${index}`}
          className="rounded-lg border border-line bg-surface-elevated px-4 py-3 text-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-medium text-ink">
              {EVENT_LABELS[event.event_type] ?? event.event_type}
            </span>
            <time className="text-xs text-ink-faint" dateTime={event.created_at}>
              {new Date(event.created_at).toLocaleString()}
            </time>
          </div>
          {event.actor_role ? (
            <p className="mt-1 text-xs text-ink-secondary">Actor: {event.actor_role}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
