import { Link } from 'react-router-dom';
import { DonutChartCard } from '../../components/charts/DonutChartCard';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { useDashboardMetrics, useFacilitatorSessions } from '../../hooks/useFacilitatorSessions';
import { appRoutes } from '../../lib/appRoutes';
import { RouteSkeleton } from '../../components/system/RouteSkeleton';
import { ErrorState } from '../../components/system/ErrorState';

export function InsightsPage() {
  const { sessions, loading, error } = useFacilitatorSessions();
  const metrics = useDashboardMetrics(sessions);

  if (loading) return <RouteSkeleton label="Loading insights" />;
  if (error && sessions.length === 0) {
    return <ErrorState title="Insights unavailable" description={error} />;
  }

  return (
    <div>
      <PageHeader
        title="Insights"
        description="Resolution progress, session composition, and participant activity."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <LineChartCard
          title="Resolution progress"
          description="Outcomes published per week (pilot metric)"
          data={metrics.sentimentTrend}
          valueLabel="Index"
        />
        <DonutChartCard
          title="Session status mix"
          description="Current facilitator workspace"
          data={metrics.statusMix}
        />
      </div>

      <p className="mt-8 text-app-meta text-ink-faint">
        Metrics are derived from session records in your workspace.{' '}
        <Link to={appRoutes.dashboard} className="text-brand underline">
          Return to dashboard
        </Link>
      </p>
    </div>
  );
}
