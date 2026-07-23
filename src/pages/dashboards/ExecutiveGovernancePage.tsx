import { useEffect } from 'react';
import { ActivityQueue } from '../../components/dashboard/ActivityQueue';
import { BarChartPanel } from '../../components/dashboard/BarChartPanel';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ProgressRing } from '../../components/dashboard/ProgressRing';
import { OperationalPageHeader, StatusRail, useShellContext } from '../../components/shell';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import {
  formatUpdated,
  releaseModeDistribution,
  weeklyResolutionTrend,
} from '../../data/governanceDashboard';
import { appRoutes } from '../../lib/appRoutes';

/**
 * Executive / sponsor governance — no room dialogue links.
 */
export function ExecutiveGovernancePage() {
  const { setContext } = useShellContext();
  const { matters, scopeLabel } = useDemoGovernance();

  const underGov = matters.filter((m) => !['closed', 'archived'].includes(m.stage)).length;
  const concluded = matters.filter((m) => m.stage === 'closed' || m.stage === 'released').length;
  const publicRec = matters.filter((m) => m.public_record_id).length;
  const internal = matters.filter(
    (m) => m.release_mode === 'internal' && (m.stage === 'released' || m.stage === 'closed'),
  ).length;
  const avgDur = Math.round(
    matters.reduce((s, m) => s + m.days_in_state, 0) / Math.max(matters.length, 1),
  );
  const sponsorPending = matters.filter((m) => m.escalation_flag || m.stage === 'approvals').length;

  useEffect(() => {
    setContext({
      title: 'Executive Governance View',
      roleLabel: 'Executive / sponsor',
      matterLabel: scopeLabel,
      stateLabel: 'Governance',
      nextAction:
        sponsorPending > 0
          ? `Review ${sponsorPending} sponsor attention item${sponsorPending === 1 ? '' : 's'}`
          : 'Monitor release posture across portfolio',
      trustNote: 'This view supports governance without exposing room-level dialogue.',
      lastUpdated: formatUpdated(),
      surface: 'portfolio',
      primaryAction: { label: 'Review sponsor attention', href: appRoutes.releaseGate },
    });
  }, [setContext, scopeLabel, sponsorPending]);

  return (
    <div>
      <OperationalPageHeader
        title="Executive Governance View"
        summary="Review matters under governance, monitor release posture, and track overall process health."
        scope={scopeLabel}
        nextAction={
          sponsorPending > 0
            ? `Review ${sponsorPending} sponsor attention item${sponsorPending === 1 ? '' : 's'}.`
            : 'Monitor release posture across the portfolio.'
        }
        trustNote="This view supports governance without exposing room-level dialogue."
        roleLabel="Executive / sponsor"
        stateLabel="Portfolio oversight"
        lastUpdated={formatUpdated()}
        primaryAction={{ label: 'Review sponsor attention', href: '#sponsor-queue' }}
      />
      <StatusRail
        items={[
          'No room dialogue',
          'Release posture only',
          'Public record optional',
          'Documented limits apply',
        ]}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Under governance" value={underGov} />
        <KpiCard label="Concluded" value={concluded} />
        <KpiCard label="Public records released" value={publicRec} />
        <KpiCard label="Internal-only outcomes" value={internal} />
        <KpiCard label="Avg governance duration" value={`${avgDur}d`} />
        <KpiCard label="Sponsor actions pending" value={sponsorPending} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <LineChartCard
          title="Quarterly matter trend"
          description="Illustrative closure / release cadence"
          data={weeklyResolutionTrend()}
          valueLabel="Matters"
        />
        <ProgressRing
          title="Governance status overview"
          segments={[
            { label: 'Active', value: underGov },
            { label: 'Concluded', value: concluded },
            { label: 'Attention', value: sponsorPending },
          ]}
        />
        <BarChartPanel
          title="Institutional area breakdown"
          data={Object.entries(
            matters.reduce<Record<string, number>>((acc, m) => {
              acc[m.department] = (acc[m.department] ?? 0) + 1;
              return acc;
            }, {}),
          ).map(([label, value]) => ({ label: label.slice(0, 14), value }))}
        />
        <BarChartPanel title="Release pathway" data={releaseModeDistribution(matters)} />
        <BarChartPanel
          title="Sensitivity distribution"
          data={[
            {
              label: 'Standard',
              value: matters.filter((m) => m.sensitivity_level === 'standard').length,
            },
            {
              label: 'Elevated',
              value: matters.filter((m) => m.sensitivity_level === 'elevated').length,
            },
            {
              label: 'High',
              value: matters.filter((m) => m.sensitivity_level === 'high').length,
            },
          ]}
        />
        <BarChartPanel
          title="Time in state"
          data={matters.slice(0, 6).map((m) => ({
            label: m.label.slice(0, 10),
            value: m.days_in_state,
          }))}
          valueLabel="Days"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2" id="sponsor-queue">
        <ActivityQueue
          title="Sponsor attention queue"
          items={matters
            .filter((m) => m.escalation_flag || m.stage === 'approvals')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `State: ${m.stage} · release mode: ${m.release_mode} · no room access from this view`,
            }))}
        />
        <ActivityQueue
          title="Pending release signoffs"
          items={matters
            .filter((m) => m.stage === 'approvals')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `${m.approvals_complete}/${m.approvals_required} approvals`,
            }))}
        />
        <ActivityQueue
          title="Recently concluded"
          items={matters
            .filter((m) => m.stage === 'released' || m.stage === 'closed')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: m.public_record_id
                ? `Public record ${m.public_record_id}`
                : `${m.release_mode} closure`,
              href: m.public_record_id ? `/ledger/${m.public_record_id}` : appRoutes.appLedger,
            }))}
        />
        <ActivityQueue
          title="Governance notes"
          items={[
            {
              id: 'note-1',
              title: 'Documented privacy limits remain in force',
              meta: 'Not full platform zero-knowledge; not Signal-grade E2E today.',
              href: '/security#reviewers',
            },
          ]}
        />
      </div>
    </div>
  );
}
