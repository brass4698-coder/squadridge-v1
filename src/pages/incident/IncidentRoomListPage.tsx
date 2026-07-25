import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useIncidentRooms } from '../../hooks/useIncidentRoom';
import { INCIDENT_ROOM_STATUS_LABELS } from '../../lib/incident/types';
import { IncidentSeverityBadge } from '../../components/incident/IncidentSeverityBadge';

export function IncidentRoomListPage() {
  const roomsQ = useIncidentRooms();

  return (
    <main className="mx-auto max-w-6xl px-gutter py-10">
      <header className="max-w-3xl">
        <p className="font-mono text-app-meta uppercase tracking-[0.14em] text-brand">
          Incident dialogue
        </p>
        <h1 className="font-heading text-page-title font-semibold text-ink md:text-h3">
          Structured rooms for high-sensitivity dialogue
        </h1>
        <p className="mt-3 text-app-body leading-relaxed text-ink-secondary">
          Trauma-informed, evidence-tiered environments for facilitators working complex cases with
          large evidence sets. These rooms are not rumor boards — every entry is lane-scoped and
          reviewable.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="incident-room-list">
        <h2 id="incident-room-list" className="sr-only">
          Incident rooms
        </h2>

        {roomsQ.isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-lg border border-line bg-surface motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : roomsQ.isError ? (
          <EmptyState
            heading="Could not load incident rooms"
            body="Check your connection and try again."
          />
        ) : (roomsQ.data?.length ?? 0) === 0 ? (
          <EmptyState
            heading="No incident rooms yet"
            body="When facilitators open a structured incident dialogue, it will appear here."
          />
        ) : (
          <ul className="space-y-4">
            {roomsQ.data?.map((room) => (
              <li key={room.id}>
                <Link
                  to={`/incident/${room.slug}`}
                  className="focus-ring block rounded-lg border border-line bg-surface p-5 transition-[border-color,box-shadow] hover:border-brand/35 hover:shadow-sr-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-heading text-section-title font-semibold text-ink">
                        {room.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-app-body text-ink-secondary">
                        {room.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge variant={room.status === 'active' ? 'live' : 'archived'}>
                        {INCIDENT_ROOM_STATUS_LABELS[room.status]}
                      </StatusBadge>
                      <IncidentSeverityBadge tier={room.severity_tier} />
                    </div>
                  </div>
                  <p className="mt-4 font-mono text-app-meta tabular-nums text-ink-faint">
                    Updated {new Date(room.updated_at).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
