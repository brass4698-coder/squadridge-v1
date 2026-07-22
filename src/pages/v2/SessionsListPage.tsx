import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { RouteSkeleton } from '../../components/system/RouteSkeleton';
import { ErrorState } from '../../components/system/ErrorState';
import { useFacilitatorSessions } from '../../hooks/useFacilitatorSessions';
import { appRoutes } from '../../lib/appRoutes';
import type { FacilitatorSessionRow } from '../../hooks/useFacilitatorSessions';

function sessionActionLink(s: FacilitatorSessionRow): { to: string; label: string } {
  if (s.status === 'live' || s.status === 'paused') {
    return { to: appRoutes.sessionRoom(s.id), label: 'Enter room' };
  }
  if (s.status === 'pending') {
    return { to: appRoutes.sessionInvite(s.id), label: 'Manage invites' };
  }
  if (s.status === 'draft' || s.status === 'archived') {
    return { to: appRoutes.sessionOutcome(s.id), label: 'Draft outcome' };
  }
  if (s.status === 'released') {
    return { to: `/ledger/${s.id}`, label: 'View record' };
  }
  return { to: appRoutes.session(s.id), label: 'View' };
}

export function SessionsListPage() {
  const { sessions, loading, error } = useFacilitatorSessions();

  if (loading) return <RouteSkeleton label="Loading sessions" />;

  return (
    <div data-demo="sessions-list">
      <PageHeader
        title="Sessions"
        description="All sessions you have created or facilitated."
        action={
          <Button asChild>
            <Link to={appRoutes.sessionNew}>New session</Link>
          </Button>
        }
      />

      {error && sessions.length === 0 ? (
        <ErrorState title="Sessions unavailable" description={error} />
      ) : sessions.length === 0 ? (
        <EmptyState
          heading="No sessions yet"
          body="Create a session to invite participants and start a structured dialogue."
          action={
            <Button asChild>
              <Link to={appRoutes.sessionNew}>New session</Link>
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                {['Session', 'Organization', 'Status', 'Participants', 'Date', ''].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-5 py-3 text-left text-app-meta font-semibold uppercase tracking-wider text-ink-secondary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const action = sessionActionLink(s);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-line transition-colors last:border-0 hover:bg-surface-accent"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        to={appRoutes.session(s.id)}
                        className="font-medium text-ink hover:underline"
                      >
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-ink-secondary">{s.org}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={s.status}>{s.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-ink-secondary">
                      {s.participants}
                    </td>
                    <td className="px-5 py-3.5 text-ink-secondary">{s.date}</td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={action.to}
                        className="text-app-meta font-medium text-brand underline"
                      >
                        {action.label}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
