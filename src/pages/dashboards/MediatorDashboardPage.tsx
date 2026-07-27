import { useEffect } from 'react';
import { ActivityQueue } from '../../components/dashboard/ActivityQueue';
import { BarChartPanel } from '../../components/dashboard/BarChartPanel';
import { FunnelChartPanel } from '../../components/dashboard/FunnelChartPanel';
import { HeatmapPanel } from '../../components/dashboard/HeatmapPanel';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ProgressRing } from '../../components/dashboard/ProgressRing';
import { RoleWorkspaceFrame } from '../../components/dashboard/RoleWorkspaceFrame';
import { OperationalPageHeader, StatusRail, useShellContext } from '../../components/shell';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import { formatUpdated, portfolioHeatmap } from '../../data/governanceDashboard';
import { appRoutes } from '../../lib/appRoutes';

export function MediatorDashboardPage() {
  const { setContext } = useShellContext();
  const { matters, scopeLabel } = useDemoGovernance();
  const inquiries = matters.filter(
    (m) => m.matter_type === 'ombuds' || m.matter_type === 'mediation',
  );
  const heat = portfolioHeatmap(inquiries.length ? inquiries : matters);

  const open = inquiries.filter(
    (m) => !['released', 'closed', 'archived'].includes(m.stage),
  ).length;
  const contributors = inquiries.reduce((s, m) => s + m.verified_participant_count, 0);
  const pendingStatements = inquiries.filter((m) => m.stage === 'active').length;
  const drafts = inquiries.filter(
    (m) => m.draft_status === 'draft' || m.draft_status === 'in_review',
  ).length;
  const releaseReady = inquiries.filter(
    (m) => m.draft_status === 'approved' || m.stage === 'approvals',
  ).length;
  const redactions = inquiries.filter((m) => m.sensitivity_level === 'high').length;

  useEffect(() => {
    setContext({
      title: 'Inquiry Workspace',
      roleLabel: 'Ombuds / investigator',
      matterLabel: scopeLabel,
      stateLabel: 'Fact-finding',
      nextAction: drafts > 0 ? 'Review findings draft' : 'Continue contributor collection',
      trustNote: 'Only approved summary outputs move beyond the inquiry workspace.',
      lastUpdated: formatUpdated(),
      surface: 'room',
      primaryAction: { label: 'Review findings draft', href: appRoutes.releaseGate },
    });
  }, [setContext, scopeLabel, drafts]);

  return (
    <RoleWorkspaceFrame role="mediator" demoId="mediator-dashboard">
      <OperationalPageHeader
        title="Inquiry Workspace"
        summary="Manage verified contributors, review structured submissions, and prepare defensible summaries for governed release."
        scope={scopeLabel}
        nextAction={
          drafts > 0
            ? 'Review findings drafts awaiting structured approval.'
            : 'Continue contributor collection and verification.'
        }
        trustNote="Only approved summary outputs move beyond the inquiry workspace."
        roleLabel="Ombuds / investigator"
        stateLabel="Room → gate"
        lastUpdated={formatUpdated()}
        primaryAction={{ label: 'Review findings draft', href: appRoutes.releaseGate }}
        roleAccent="mediator"
      />
      <StatusRail
        items={[
          'Verified contributors',
          'Role-scoped visibility',
          'Approved summaries only',
          'No transcript published',
        ]}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Open inquiries" value={open} />
        <KpiCard label="Verified contributors" value={contributors} />
        <KpiCard label="Statements pending" value={pendingStatements} />
        <KpiCard label="Draft findings" value={drafts} />
        <KpiCard label="Release-ready summaries" value={releaseReady} />
        <KpiCard label="Redaction tasks open" value={redactions} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <ProgressRing
          title="Contributor verification"
          segments={[
            { label: 'Verified', value: contributors },
            { label: 'Pending', value: Math.max(open * 2, 1) },
          ]}
          centerLabel="Verify"
        />
        <FunnelChartPanel
          title="Inquiry stage progression"
          steps={[
            { label: 'Intake', value: inquiries.filter((m) => m.stage === 'invited').length + 1 },
            { label: 'Collection', value: pendingStatements },
            { label: 'Review', value: drafts },
            { label: 'Drafting', value: drafts },
            { label: 'Release', value: releaseReady },
            {
              label: 'Closed',
              value: inquiries.filter((m) => m.stage === 'closed' || m.stage === 'released').length,
            },
          ]}
        />
        <BarChartPanel
          title="Source-type breakdown"
          data={[
            { label: 'Statements', value: pendingStatements + 4 },
            { label: 'Facilitator notes', value: 3 },
            { label: 'Attachments', value: 2 },
            { label: 'External', value: 1 },
          ]}
        />
        <HeatmapPanel
          title="Evidence completeness"
          description="Relative completeness by region / unit"
          rows={heat.rows}
          cols={heat.cols}
          cells={heat.cells}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityQueue
          title="Information gaps"
          items={inquiries
            .filter((m) => m.stall_risk || m.days_in_state > 5)
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `${m.days_in_state}d · follow-up required`,
            }))}
        />
        <ActivityQueue
          title="Redaction queue"
          items={inquiries
            .filter((m) => m.sensitivity_level === 'high')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: 'High sensitivity · summary redaction pending',
              href: appRoutes.releaseGate,
            }))}
        />
        <ActivityQueue
          title="Pending release review"
          items={inquiries
            .filter((m) => m.stage === 'approvals' || m.draft_status === 'approved')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `${m.release_mode} release mode`,
              href: appRoutes.releaseGate,
            }))}
        />
      </div>
    </RoleWorkspaceFrame>
  );
}
