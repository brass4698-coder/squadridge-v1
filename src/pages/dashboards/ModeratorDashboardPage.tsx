import { useEffect } from 'react';
import { ActivityQueue } from '../../components/dashboard/ActivityQueue';
import { BarChartPanel } from '../../components/dashboard/BarChartPanel';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { RoleWorkspaceFrame } from '../../components/dashboard/RoleWorkspaceFrame';
import { TrustBoundaryExplainer } from '../../components/dashboard/TrustBoundaryExplainer';
import { OperationalPageHeader, StatusRail, useShellContext } from '../../components/shell';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import { formatUpdated } from '../../data/governanceDashboard';
import { appRoutes } from '../../lib/appRoutes';

/**
 * Moderator / safety oversight workspace — demo + facilitator-accessible overview.
 * Distinct clay accent; calm ops language (not militarized).
 */
export function ModeratorDashboardPage() {
  const { setContext } = useShellContext();
  const { matters, scopeLabel } = useDemoGovernance();

  const flagged = matters.filter((m) => m.stall_risk || m.sensitivity_level === 'high').length;
  const active = matters.filter((m) =>
    ['active', 'verified', 'draft', 'approvals'].includes(m.stage),
  ).length;
  const awaitingReview = matters.filter(
    (m) => m.stage === 'approvals' || m.draft_status === 'in_review',
  ).length;
  const closedSafe = matters.filter((m) => m.stage === 'closed' || m.stage === 'released').length;
  const highSensitivity = matters.filter((m) => m.sensitivity_level === 'high').length;

  useEffect(() => {
    setContext({
      title: 'Moderator Workspace',
      roleLabel: 'Moderator',
      matterLabel: scopeLabel,
      stateLabel: 'Safety oversight',
      nextAction:
        flagged > 0
          ? `Review ${flagged} matter${flagged === 1 ? '' : 's'} needing attention`
          : 'Scan active rooms for stall or sensitivity signals',
      trustNote:
        'Moderator views are for safety and process integrity. Room dialogue stays role-scoped; public release remains facilitator-governed.',
      lastUpdated: formatUpdated(),
      surface: 'room',
      primaryAction: { label: 'Open sessions list', href: appRoutes.sessions },
    });
  }, [setContext, scopeLabel, flagged]);

  return (
    <RoleWorkspaceFrame role="moderator" demoId="moderator-dashboard">
      <OperationalPageHeader
        title="Moderator Workspace"
        summary="Oversee room health, sensitivity flags, and process integrity without turning dialogue into a public feed."
        scope={scopeLabel}
        nextAction={
          flagged > 0
            ? `Review ${flagged} matter${flagged === 1 ? '' : 's'} needing attention.`
            : 'Scan active rooms for stall or sensitivity signals.'
        }
        trustNote="Moderator views are for safety and process integrity. Room dialogue stays role-scoped; public release remains facilitator-governed."
        roleLabel="Moderator"
        stateLabel="Oversight · calm intervention"
        lastUpdated={formatUpdated()}
        primaryAction={{ label: 'Open sessions list', href: appRoutes.sessions }}
        roleAccent="moderator"
      />
      <StatusRail
        items={[
          'Safety oversight',
          'Role-scoped review',
          'No auto-publish',
          'Facilitator owns release',
          'Calm intervention',
        ]}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Active rooms watched" value={active} />
        <KpiCard label="Attention flags" value={flagged} />
        <KpiCard label="Awaiting process review" value={awaitingReview} />
        <KpiCard label="High-sensitivity matters" value={highSensitivity} />
        <KpiCard label="Closed or released" value={closedSafe} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <BarChartPanel
          title="Sensitivity by matter"
          description="Relative sensitivity signal across the portfolio"
          data={matters.slice(0, 6).map((m) => ({
            label: m.label.slice(0, 12),
            value: m.sensitivity_level === 'high' ? 3 : m.sensitivity_level === 'elevated' ? 2 : 1,
          }))}
          valueLabel="Level"
        />
        <TrustBoundaryExplainer />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityQueue
          title="Needs moderator attention"
          items={matters
            .filter((m) => m.stall_risk || m.sensitivity_level === 'high')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `${m.stage} · ${m.sensitivity_level} sensitivity${m.stall_risk ? ' · stall risk' : ''}`,
              href: appRoutes.sessions,
            }))}
        />
        <ActivityQueue
          title="Process integrity checks"
          items={matters
            .filter((m) => m.stage === 'approvals' || m.draft_status === 'in_review')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `Approvals ${m.approvals_complete}/${m.approvals_required} · release ${m.release_mode}`,
              href: appRoutes.releaseGate,
            }))}
        />
      </div>
    </RoleWorkspaceFrame>
  );
}
