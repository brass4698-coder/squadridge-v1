import { useEffect, useMemo } from 'react';
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
import { isV2MockDataEnabled } from '../../lib/v2MockMode';
import { useDashboardMetrics, useFacilitatorSessions } from '../../hooks/useFacilitatorSessions';
import { RouteSkeleton } from '../../components/system/RouteSkeleton';
import { ErrorState } from '../../components/system/ErrorState';

/**
 * Facilitator Workspace — room + gate operational command center.
 * Demo portfolio charts only when VITE_V2_MOCK_DATA=true; otherwise live session metrics.
 */
export function FacilitatorDashboardPage() {
  const { setContext } = useShellContext();
  const showDemoPortfolio = isV2MockDataEnabled();
  const { matters, scopeLabel } = useDemoGovernance();
  const { sessions, loading, error } = useFacilitatorSessions();
  const metrics = useDashboardMetrics(sessions);

  const awaitingGate = showDemoPortfolio
    ? matters.filter((m) => m.stage === 'approvals' || m.draft_status === 'in_review')
    : [];

  const nextAction = useMemo(() => {
    if (showDemoPortfolio && awaitingGate.length > 0) {
      return `Review ${awaitingGate.length} draft outcome${awaitingGate.length === 1 ? '' : 's'} awaiting release.`;
    }
    const pending = Number(metrics.kpis[1]?.value ?? 0);
    if (pending > 0) return `Open rooms needing verification (${pending}).`;
    if (sessions.length === 0) return 'Create a session to start Configure → Release.';
    return 'Open rooms needing verification or pacing.';
  }, [showDemoPortfolio, awaitingGate.length, metrics.kpis, sessions.length]);

  useEffect(() => {
    setContext({
      title: 'Facilitator Workspace',
      roleLabel: 'Facilitator',
      matterLabel: showDemoPortfolio ? scopeLabel : 'Your sessions',
      stateLabel: 'Room operations',
      nextAction,
      trustNote:
        'No public record is created unless you explicitly release an approved outcome. Raw room dialogue is visible only inside authorized room views.',
      lastUpdated: formatUpdated(),
      surface: 'room',
      primaryAction: { label: 'Open release queue', href: appRoutes.releaseGate },
    });
  }, [setContext, scopeLabel, nextAction, showDemoPortfolio]);

  if (loading) return <RouteSkeleton label="Loading facilitator workspace" />;
  if (error) return <ErrorState title="Could not load sessions" description={error} />;

  const activeRooms = showDemoPortfolio
    ? matters.filter((m) => ['active', 'verified', 'draft', 'approvals'].includes(m.stage)).length
    : Number(metrics.kpis[0]?.value ?? 0);
  const awaitingVerification = showDemoPortfolio
    ? matters.filter((m) => m.stage === 'invited' || m.stage === 'verified').length
    : Number(metrics.kpis[1]?.value ?? 0);
  const draftsPending = showDemoPortfolio
    ? awaitingGate.length
    : sessions.filter((s) => s.status === 'draft').length;
  const releasedMonth = showDemoPortfolio
    ? matters.filter((m) => m.stage === 'released').length
    : Number(metrics.kpis[2]?.value ?? 0);
  const paused = showDemoPortfolio
    ? matters.filter((m) => m.stall_risk).length
    : sessions.filter((s) => s.status === 'paused').length;
  const participantsToday = showDemoPortfolio
    ? matters.reduce((s, m) => s + m.verified_participant_count, 0)
    : Number(metrics.kpis[3]?.value ?? 0);

  return (
    <RoleWorkspaceFrame role="facilitator" demoId="facilitator-dashboard">
      <OperationalPageHeader
        title="Facilitator Workspace"
        summary="Manage active rooms, verify participation, govern pacing, and release only approved outcomes."
        scope={showDemoPortfolio ? scopeLabel : 'Your sessions'}
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
        Full go-live checklist and abort criteria:{' '}
        <Link to={appRoutes.pilotGuide} className="text-brand">
          Pilot readiness
        </Link>
      </p>
      <WorkflowNotificationsBanner />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Active rooms" value={activeRooms} />
        <KpiCard label="Awaiting verification" value={awaitingVerification} />
        <KpiCard label="Release drafts pending" value={draftsPending} />
        <KpiCard label="Outcomes released" value={releasedMonth} />
        <KpiCard label="Rooms paused / stalled" value={paused} />
        <KpiCard label="Participants engaged" value={participantsToday} />
      </div>

      {showDemoPortfolio ? (
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <FunnelChartPanel
            title="Room lifecycle funnel"
            description="Invited → verified → active → draft → approvals → released"
            steps={funnelFromMatters(matters)}
          />
          <LineChartCard
            title="Weekly room resolution trend"
            description="Illustrative demo portfolio — not live pilot metrics"
            data={weeklyResolutionTrend()}
            valueLabel="Resolved"
          />
          <BarChartPanel
            title="Approval turnaround by room"
            description="Illustrative demo portfolio"
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
      ) : (
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <BarChartPanel
            title="Session status mix"
            description="Counts from your account sessions"
            data={metrics.statusMix.map((s) => ({ label: s.name, value: s.value }))}
            valueLabel="Sessions"
          />
          <aside className="rounded-lg border border-line bg-surface-sunken/40 p-5 text-sm leading-relaxed text-ink-secondary">
            <p className="m-0 font-medium text-ink">Live workspace</p>
            <p className="mt-2 mb-0">
              Portfolio charts and demo queues appear only when{' '}
              <code className="font-mono text-xs">VITE_V2_MOCK_DATA=true</code>. This view uses your
              real sessions — empty counts are expected before the first pilot room.
            </p>
          </aside>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {showDemoPortfolio ? (
          <>
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
          </>
        ) : (
          <>
            <ActivityQueue
              title="Your sessions"
              items={sessions.slice(0, 8).map((s) => ({
                id: s.id,
                title: s.title,
                meta: `${s.status} · ${s.date}`,
                href: appRoutes.sessionControl(s.id),
              }))}
            />
            <ActivityQueue
              title="Next actions"
              items={[
                {
                  id: 'new',
                  title: sessions.length === 0 ? 'Create your first session' : 'Open sessions list',
                  meta: 'Configure → Verify → Facilitate → Release',
                  href: sessions.length === 0 ? appRoutes.sessionNew : appRoutes.sessions,
                },
                {
                  id: 'guide',
                  title: 'Pilot readiness',
                  meta: 'Go-live checklist · abort criteria · deferred scope',
                  href: appRoutes.pilotGuide,
                },
              ]}
            />
          </>
        )}
      </div>

      <p className="mt-8 text-sm text-ink-faint">
        {showDemoPortfolio
          ? 'Demo portfolio signals are active (VITE_V2_MOCK_DATA). '
          : 'Showing live session counts from your account. '}
        <Link to={appRoutes.sessionNew} className="text-brand">
          New session
        </Link>
      </p>
    </RoleWorkspaceFrame>
  );
}
