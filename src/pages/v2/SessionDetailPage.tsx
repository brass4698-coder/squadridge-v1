import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RouteSkeleton } from '../../components/system/RouteSkeleton';
import { useFacilitatorSessions } from '../../hooks/useFacilitatorSessions';
import { useSessionAudit } from '../../hooks/useSessionAudit';
import { SessionAuditPanel } from '../../components/session/SessionAuditPanel';
import { appRoutes } from '../../lib/appRoutes';

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions, loading } = useFacilitatorSessions();
  const { events, loading: auditLoading, error: auditError } = useSessionAudit(sessionId);
  const session = sessions.find((s) => s.id === sessionId);

  if (loading) return <RouteSkeleton label="Loading session" />;

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-page-title text-ink">Session not found</h1>
        <p className="mt-2 text-app-body text-ink-secondary">
          This session does not exist or you do not have access to it.
        </p>
        <Button asChild variant="link" className="mt-6">
          <Link to={appRoutes.sessions}>Back to sessions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={appRoutes.sessions}
        className="text-app-meta text-ink-secondary transition-opacity hover:opacity-70"
      >
        ← All sessions
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink">{session.title}</h1>
          <p className="mt-1 text-app-body text-ink-secondary">
            {session.org} · {session.date}
          </p>
        </div>
        <Badge variant={session.status}>{session.status}</Badge>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface-elevated p-4">
          <dt className="text-app-meta font-semibold uppercase tracking-wider text-ink-secondary">
            Participants
          </dt>
          <dd className="mt-1 tabular-nums text-lg font-semibold text-ink">
            {session.participants}
          </dd>
        </div>
        <div className="rounded-lg border border-line bg-surface-elevated p-4">
          <dt className="text-app-meta font-semibold uppercase tracking-wider text-ink-secondary">
            Status
          </dt>
          <dd className="mt-1 text-sm font-medium capitalize text-ink">{session.status}</dd>
        </div>
        <div className="rounded-lg border border-line bg-surface-elevated p-4">
          <dt className="text-app-meta font-semibold uppercase tracking-wider text-ink-secondary">
            Session ID
          </dt>
          <dd className="mt-1 font-mono text-sm text-ink">{session.id}</dd>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="text-section-title text-ink">Actions</h2>
        <ul className="mt-4 flex flex-col gap-2">
          <li>
            <Button asChild>
              <Link to={appRoutes.sessionControl(session.id)}>Open session control</Link>
            </Button>
          </li>
          <li>
            <Button asChild variant="secondary">
              <Link to={appRoutes.sessionInvite(session.id)}>Invite participants</Link>
            </Button>
          </li>
          <li>
            <Button asChild variant="secondary">
              <Link to={appRoutes.sessionParticipants(session.id)}>Review participants</Link>
            </Button>
          </li>
          <li>
            <Button asChild variant="secondary">
              <Link to={appRoutes.sessionControl(session.id)}>Session controls</Link>
            </Button>
          </li>
          <li>
            <Button asChild variant="secondary">
              <Link to={appRoutes.sessionOutcome(session.id)}>Draft outcome</Link>
            </Button>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-section-title text-ink">Session audit trail</h2>
        <p className="mt-2 text-sm text-ink-secondary">
          Metadata-only lifecycle events for diligence review. Message bodies are never logged.
        </p>
        <div className="mt-4">
          <SessionAuditPanel events={events} loading={auditLoading} error={auditError} />
        </div>
      </section>
    </div>
  );
}
