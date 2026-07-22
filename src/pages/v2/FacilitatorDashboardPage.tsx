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
import { FacilitatorWalkthrough } from '../../components/facilitator/FacilitatorWalkthrough';
import { WorkflowNotificationsBanner } from '../../components/session/WorkflowNotificationsBanner';
import {
  useDashboardMetrics,
  useFacilitatorSessions,
  type FacilitatorSessionRow,
} from '../../hooks/useFacilitatorSessions';
import { appRoutes } from '../../lib/appRoutes';

function attentionHref(s: FacilitatorSessionRow): string {
  if (s.status === 'pending') return appRoutes.sessionParticipants(s.id);
  if (s.status === 'live' || s.status === 'paused') return appRoutes.sessionControl(s.id);
  if (s.status === 'archived') return appRoutes.sessionOutcome(s.id);
  if (s.status === 'released') return appRoutes.sessionRelease(s.id);
  return appRoutes.session(s.id);
}

function attentionHint(s: FacilitatorSessionRow): string {
  if (s.status === 'pending') return 'Verify participants';
  if (s.status === 'live' || s.status === 'paused') return 'Open control room';
  if (s.status === 'archived') return 'Draft or release outcome';
  if (s.status === 'draft') return 'Continue setup';
  return 'Open session';
}

export function FacilitatorDashboardPage() {
  const { sessions, loading, error, isMock } = useFacilitatorSessions();
  const metrics = useDashboardMetrics(sessions);

  const needsAttention = sessions
    .filter((s) => ['pending', 'live', 'paused', 'archived', 'draft'].includes(s.status))
    .slice(0, 5);

  if (loading) return <RouteSkeleton label="Loading dashboard" />;

  return (
    <div data-demo="facilitator-dashboard">
      <PageHeader
        title="Facilitator workspace"
        description="Configure → Verify → Facilitate → Release. Private NGO deliberation is the default path; public ledger is optional."
        action={
          <Button asChild>
            <Link to={appRoutes.sessionNew}>New session</Link>
          </Button>
        }
      />

      <FacilitatorWalkthrough />

      <WorkflowNotificationsBanner />

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
                    body="Create an NGO deliberation session to invite partners and release a private anchored decision memo."
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
                <Badge variant="brand">{needsAttention.length}</Badge>
              </div>
              {needsAttention.length === 0 ? (
                <EmptyState
                  className="py-8"
                  heading="Nothing waiting"
                  body="When sessions need verify, facilitate, or release, they appear here."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {needsAttention.map((s) => (
                    <Link
                      key={s.id}
                      to={attentionHref(s)}
                      className="sr-glass block rounded-lg border border-line p-4 transition-opacity hover:opacity-90"
                    >
                      <p className="text-app-body font-medium text-ink">{s.title}</p>
                      <p className="mt-1 text-app-meta text-ink-secondary">
                        {attentionHint(s)} · {s.status}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                to={appRoutes.sessions}
                className="mt-4 inline-block text-app-meta text-brand underline"
              >
                View all sessions →
              </Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
