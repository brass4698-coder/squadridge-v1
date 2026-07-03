import { Link } from 'react-router-dom';
import { DonutChartCard } from '../../components/charts/DonutChartCard';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { RouteSkeleton } from '../../components/system/RouteSkeleton';
import { ErrorState } from '../../components/system/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useDashboardMetrics, useFacilitatorSessions } from '../../hooks/useFacilitatorSessions';
import { appRoutes } from '../../lib/appRoutes';

const pendingApprovals = [
  {
    id: 'appr-001',
    title: 'Urban Housing Policy — Outcome Draft',
    requestedBy: 'M. Osei',
    due: 'Today',
  },
  {
    id: 'appr-002',
    title: 'Trade Framework — Amendment Clause B',
    requestedBy: 'K. Lindqvist',
    due: 'Tomorrow',
  },
];

export function FacilitatorDashboardPage() {
  const { sessions, loading, error, isMock } = useFacilitatorSessions();
  const metrics = useDashboardMetrics(sessions);

  if (loading) return <RouteSkeleton label="Loading dashboard" />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Active sessions, pending approvals, and recent outcomes at a glance."
        action={
          <Button asChild>
            <Link to={appRoutes.sessionNew}>New session</Link>
          </Button>
        }
      />

      {isMock ? (
        <p className="mb-6 rounded-md border border-line bg-surface-secondary px-4 py-2 text-app-meta text-ink-secondary">
          Showing demo workspace data. Connect Supabase and set{' '}
          <code className="font-mono">VITE_V2_MOCK_DATA=false</code> for live records.
        </p>
      ) : null}

      {error && sessions.length === 0 ? (
        <ErrorState title="Dashboard unavailable" description={error} />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.kpis.map((kpi) => (
              <StatCard key={kpi.label} label={kpi.label} value={kpi.value} />
            ))}
          </div>

          <div className="mb-10 grid gap-6 lg:grid-cols-2">
            <LineChartCard
              title="Resolution trend"
              description="Weekly resolution index (pilot)"
              data={metrics.sentimentTrend}
              valueLabel="Index"
            />
            <DonutChartCard
              title="Session status"
              description="Workspace snapshot"
              data={metrics.statusMix}
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <section className="lg:col-span-2" aria-labelledby="recent-sessions-heading">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="recent-sessions-heading" className="text-section-title text-ink">
                  Active sessions
                </h2>
                <Link to={appRoutes.sessions} className="text-app-meta text-brand underline">
                  View all
                </Link>
              </div>

              <Card className="overflow-hidden">
                {loading ? (
                  <TableSkeleton />
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
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        {['Session', 'Status', 'Participants', 'Date'].map((h) => (
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
                      {sessions.slice(0, 6).map((s) => (
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
                          <td className="px-5 py-3.5">
                            <Badge variant={s.status}>{s.status}</Badge>
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-ink-secondary">
                            {s.participants}
                          </td>
                          <td className="px-5 py-3.5 text-ink-secondary">{s.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </section>

            <section aria-labelledby="pending-approvals-heading">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="pending-approvals-heading" className="text-section-title text-ink">
                  Needs attention
                </h2>
                <Badge variant="brand">{pendingApprovals.length}</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {pendingApprovals.map((a) => (
                  <Link
                    key={a.id}
                    to={appRoutes.outcome(a.id)}
                    className="sr-glass block rounded-lg border border-line p-4 transition-opacity hover:opacity-90"
                  >
                    <p className="text-app-body font-medium text-ink">{a.title}</p>
                    <p className="mt-1 text-app-meta text-ink-secondary">
                      Requested by {a.requestedBy} · Due {a.due}
                    </p>
                  </Link>
                ))}
              </div>
              <Link
                to={appRoutes.insights}
                className="mt-4 inline-block text-app-meta text-brand underline"
              >
                View all insights →
              </Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
