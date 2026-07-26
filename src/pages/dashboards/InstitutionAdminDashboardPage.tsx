import { useEffect } from 'react';
import { ActivityQueue } from '../../components/dashboard/ActivityQueue';
import { BarChartPanel } from '../../components/dashboard/BarChartPanel';
import { FunnelChartPanel } from '../../components/dashboard/FunnelChartPanel';
import { HeatmapPanel } from '../../components/dashboard/HeatmapPanel';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { OperationalPageHeader, StatusRail, useShellContext } from '../../components/shell';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import {
  formatUpdated,
  funnelFromMatters,
  portfolioHeatmap,
  releaseModeDistribution,
  useCaseBreakdown,
  weeklyResolutionTrend,
} from '../../data/governanceDashboard';
import { appRoutes } from '../../lib/appRoutes';

export function InstitutionAdminDashboardPage() {
  const { setContext } = useShellContext();
  const { matters, scopeLabel } = useDemoGovernance();
  const heat = portfolioHeatmap(matters);

  const active = matters.filter((m) =>
    ['active', 'verified', 'draft', 'approvals', 'invited'].includes(m.stage),
  ).length;
  const intake = matters.filter((m) => m.stage === 'intake' || m.stage === 'invited').length;
  const gate = matters.filter(
    (m) => m.stage === 'approvals' || m.draft_status === 'in_review',
  ).length;
  const publicReleases = matters.filter(
    (m) => m.release_mode === 'public' && m.stage === 'released',
  ).length;
  const internal = matters.filter(
    (m) => m.release_mode === 'internal' && (m.stage === 'released' || m.stage === 'closed'),
  ).length;
  const avgDays = Math.round(
    matters.reduce((s, m) => s + m.days_in_state, 0) / Math.max(matters.length, 1),
  );

  useEffect(() => {
    setContext({
      title: 'Program Oversight',
      roleLabel: 'Program lead',
      matterLabel: scopeLabel,
      stateLabel: 'Portfolio',
      nextAction:
        gate > 0
          ? `Review ${gate} matter${gate === 1 ? '' : 's'} in release gate`
          : 'Review active matters across units',
      trustNote: 'Oversight views show matter state and governance signals, not room dialogue.',
      lastUpdated: formatUpdated(),
      surface: 'portfolio',
      primaryAction: { label: 'Review active matters', href: appRoutes.sessions },
    });
  }, [setContext, scopeLabel, gate]);

  return (
    <div data-demo="institution-dashboard">
      <OperationalPageHeader
        title="Program Oversight"
        summary="Track matters across your institution, monitor lifecycle state, and identify areas needing intervention."
        scope={scopeLabel}
        nextAction={
          gate > 0
            ? `Review ${gate} matter${gate === 1 ? '' : 's'} in release gate.`
            : 'Review active matters across units.'
        }
        trustNote="Oversight views show matter state and governance signals, not room dialogue."
        roleLabel="Program lead"
        stateLabel="Portfolio"
        lastUpdated={formatUpdated()}
        primaryAction={{ label: 'Review active matters', href: appRoutes.sessions }}
      />
      <StatusRail
        items={[
          'Role-scoped visibility',
          'No room dialogue here',
          'Public release optional',
          'Operator-readable today',
        ]}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Active matters" value={active} />
        <KpiCard label="Intake queue" value={intake} />
        <KpiCard label="In release gate" value={gate} />
        <KpiCard label="Public releases" value={publicReleases} />
        <KpiCard label="Internal-only closures" value={internal} />
        <KpiCard label="Avg days in state" value={avgDays} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <HeatmapPanel
          title="Portfolio heatmap"
          description="Matter concentration by region and unit"
          rows={heat.rows}
          cols={heat.cols}
          cells={heat.cells}
        />
        <FunnelChartPanel title="Lifecycle distribution" steps={funnelFromMatters(matters)} />
        <LineChartCard
          title="Time-to-resolution trend"
          data={weeklyResolutionTrend()}
          valueLabel="Closed"
        />
        <BarChartPanel title="Use-case breakdown" data={useCaseBreakdown(matters)} />
        <BarChartPanel title="Release mode" data={releaseModeDistribution(matters)} />
        <BarChartPanel
          title="Facilitator load"
          description="Matters per facilitator id"
          data={Object.entries(
            matters.reduce<Record<string, number>>((acc, m) => {
              acc[m.facilitator_id] = (acc[m.facilitator_id] ?? 0) + 1;
              return acc;
            }, {}),
          ).map(([label, value]) => ({ label, value }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityQueue
          title="Matters needing escalation"
          items={matters
            .filter((m) => m.escalation_flag || m.stall_risk)
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `${m.department} · ${m.days_in_state}d · ${m.stage}`,
              href: appRoutes.releaseGate,
            }))}
        />
        <ActivityQueue
          title="Delayed approvals"
          items={matters
            .filter((m) => m.stage === 'approvals' && m.days_in_state > 2)
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `${m.approvals_complete}/${m.approvals_required} · ${m.days_in_state}d in gate`,
              href: appRoutes.releaseGate,
            }))}
        />
      </div>
    </div>
  );
}
