import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { ActivityQueue } from '../../components/dashboard/ActivityQueue';
import { BarChartPanel } from '../../components/dashboard/BarChartPanel';
import { FunnelChartPanel } from '../../components/dashboard/FunnelChartPanel';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { RoleWorkspaceFrame } from '../../components/dashboard/RoleWorkspaceFrame';
import { OperationalPageHeader, StatusRail, useShellContext } from '../../components/shell';
import { FacilitatorWalkthrough } from '../../components/facilitator/FacilitatorWalkthrough';
import { WorkflowNotificationsBanner } from '../../components/session/WorkflowNotificationsBanner';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import {
  approvalTurnaround,
  formatUpdated,
  funnelFromMatters,
  releaseModeDistribution,
  weeklyResolutionTrend,
} from '../../data/governanceDashboard';
import { appRoutes } from '../../lib/appRoutes';
import { useDashboardMetrics, useFacilitatorSessions } from '../../hooks/useFacilitatorSessions';
import { RouteSkeleton } from '../../components/system/RouteSkeleton';
import { ErrorState } from '../../components/system/ErrorState';

/**
 * Facilitator Workspace — room + gate operational command center.
 */
export function FacilitatorDashboardPage() {
  const { setContext } = useShellContext();
  const { matters, scopeLabel } = useDemoGovernance();
  const { sessions, loading, error } = useFacilitatorSessions();
  const metrics = useDashboardMetrics(sessions);

  const awaitingGate = matters.filter(
    (m) => m.stage === 'approvals' || m.draft_status === 'in_review',
  );
  const nextAction =
    awaitingGate.length > 0
      ? `Review ${awaitingGate.length} draft outcome${awaitingGate.length === 1 ? '' : 's'} awaiting release.`
      : 'Open rooms needing verification or pacing.';

  useEffect(() => {
    setContext({
      title: 'Facilitator Workspace',
      roleLabel: 'Facilitator',
      matterLabel: scopeLabel,
      stateLabel: 'Room operations',
      nextAction,
      trustNote:
        'No public record is created unless you explicitly release an approved outcome. Raw room dialogue is visible only inside authorized room views.',
      lastUpdated: formatUpdated(),
      surface: 'room',
      primaryAction: { label: 'Open release queue', href: appRoutes.releaseGate },
    });
  }, [setContext, scopeLabel, nextAction]);

  if (loading) return <RouteSkeleton label="Loading facilitator workspace" />;
  if (error) return <ErrorState title="Could not load sessions" description={error} />;

  const activeRooms = matters.filter((m) =>
    ['active', 'verified', 'draft', 'approvals'].includes(m.stage),
  ).length;
  const awaitingVerification = matters.filter(
    (m) => m.stage === 'invited' || m.stage === 'verified',
  ).length;
  const draftsPending = awaitingGate.length;
  const releasedMonth = matters.filter((m) => m.stage === 'released').length;
  const paused = matters.filter((m) => m.stall_risk).length;
  const participantsToday = matters.reduce((s, m) => s + m.verified_participant_count, 0);

  return (
    <RoleWorkspaceFrame role="facilitator" demoId="facilitator-dashboard">
      <OperationalPageHeader
        title="Facilitator Workspace"
        summary="Manage active rooms, verify participation, govern pacing, and release only approved outcomes."
        scope={scopeLabel}
        nextAction={nextAction}
        trustNote="No public record is created unless you explicitly release an approved outcome. Raw room dialogue is visible only inside authorized room views."
        roleLabel="Facilitator"
        stateLabel="Configure → Verify → Facilitate → Release"
        lastUpdated={formatUpdated()}
        primaryAction={{ label: 'Open release queue', href: appRoutes.releaseGate }}
        roleAccent="facilitator"
      />
      <StatusRail
        items={[
          'Invite-only',
          'Verified participants',
          'Approvals pending',
          'Public release optional',
          'Operator-readable today',
          'No transcript published',
        ]}
      />

      <FacilitatorWalkthrough />
      <p className="mb-6 -mt-4 text-sm text-ink-faint">
        Full preflight and abort criteria:{' '}
        <Link to={appRoutes.pilotGuide} className="text-brand">
          Pilot readiness guide
        </Link>
      </p>
      <WorkflowNotificationsBanner />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Active rooms" value={activeRooms || Number(metrics.kpis[0]?.value ?? 0)} />
        <KpiCard label="Awaiting verification" value={awaitingVerification} />
        <KpiCard label="Release drafts pending" value={draftsPending} />
        <KpiCard
          label="Outcomes released"
          value={releasedMonth || Number(metrics.kpis[2]?.value ?? 0)}
        />
        <KpiCard label="Rooms paused / stalled" value={paused} />
        <KpiCard label="Participants engaged" value={participantsToday} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <FunnelChartPanel
          title="Room lifecycle funnel"
          description="Invited → verified → active → draft → approvals → released"
          steps={funnelFromMatters(matters)}
        />
        <LineChartCard
          title="Weekly room resolution trend"
          description="Matters reaching closure or release"
          data={weeklyResolutionTrend()}
          valueLabel="Resolved"
        />
        <BarChartPanel
          title="Approval turnaround by room"
          description="Average hours from draft to approval"
          data={approvalTurnaround()}
          valueLabel="Hours"
        />
        <BarChartPanel
          title="Release outcome distribution"
          description="Public · internal · no-release closes"
          data={releaseModeDistribution(matters)}
          valueLabel="Matters"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityQueue
          title="Rooms needing action now"
          items={matters
            .filter((m) => m.stall_risk || m.stage === 'approvals' || m.stage === 'verified')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `${m.stage} · ${m.days_in_state}d in state${m.stall_risk ? ' · stall risk' : ''}`,
              href: appRoutes.sessions,
            }))}
        />
        <ActivityQueue
          title="Drafts awaiting facilitator review"
          items={awaitingGate.map((m) => ({
            id: m.matter_id,
            title: m.label,
            meta: `Approvals ${m.approvals_complete}/${m.approvals_required} · ${m.release_mode} release`,
            href: appRoutes.releaseGate,
          }))}
        />
        <ActivityQueue
          title="Pending participant verification"
          items={matters
            .filter((m) => m.stage === 'invited' || m.stage === 'verified')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: `${m.verified_participant_count} verified · ${m.region}`,
              href: appRoutes.participants,
            }))}
        />
        <ActivityQueue
          title="Recent releases"
          items={matters
            .filter((m) => m.stage === 'released')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: m.public_record_id
                ? `Record ${m.public_record_id} · ${m.anchor_hash ?? 'anchor pending'}`
                : 'Released without public ledger',
              href: m.public_record_id ? `/ledger/${m.public_record_id}` : appRoutes.appLedger,
            }))}
        />
      </div>

      <p className="mt-8 text-sm text-ink-faint">
        Live session counts from your account are blended with demo portfolio signals when seeded
        data is active.{' '}
        <Link to={appRoutes.sessionNew} className="text-brand">
          New session
        </Link>
      </p>
    </RoleWorkspaceFrame>
  );
}
