import { useEffect } from 'react';
import { ActivityQueue } from '../../components/dashboard/ActivityQueue';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ProgressRing } from '../../components/dashboard/ProgressRing';
import { TrustBoundaryExplainer } from '../../components/dashboard/TrustBoundaryExplainer';
import { BarChartPanel } from '../../components/dashboard/BarChartPanel';
import { OperationalPageHeader, StatusRail, useShellContext } from '../../components/shell';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import { formatUpdated } from '../../data/governanceDashboard';
import { appRoutes } from '../../lib/appRoutes';

export function ParticipantDashboardPage() {
  const { setContext } = useShellContext();
  const { matters, scopeLabel } = useDemoGovernance();

  const active = matters.filter((m) =>
    ['active', 'verified', 'draft', 'approvals'].includes(m.stage),
  );
  const awaitingMe = matters.filter(
    (m) => m.stage === 'active' || m.draft_status === 'in_review',
  ).length;
  const drafts = matters.filter((m) => m.draft_status !== 'none').length;
  const approved = matters.filter((m) => m.stage === 'released').length;
  const closed = matters.filter((m) => m.stage === 'closed').length;
  const current = active[0];

  useEffect(() => {
    setContext({
      title: 'Participant Workspace',
      roleLabel: 'Participant',
      matterLabel: current?.label ?? scopeLabel,
      stateLabel: current?.stage ?? 'Orientation',
      nextAction: current
        ? `Continue written round in ${current.label}`
        : 'Await invitation to an active room',
      trustNote:
        'Room dialogue stays private to authorized participants and facilitators; only approved outcome text may be released.',
      lastUpdated: formatUpdated(),
      surface: 'room',
      primaryAction: current
        ? { label: 'Continue current room', href: appRoutes.sessions }
        : { label: 'Enter credential', href: '/enter/credential' },
    });
  }, [setContext, current, scopeLabel]);

  return (
    <div>
      <OperationalPageHeader
        title="Participant Workspace"
        summary="Review your invited matters, complete written rounds, and inspect approved outcomes."
        scope={scopeLabel}
        nextAction={
          current
            ? `Continue written round in ${current.label}.`
            : 'Await invitation to an active room.'
        }
        trustNote="Room dialogue stays private to authorized participants and facilitators; only approved outcome text may be released."
        roleLabel="Participant"
        stateLabel="Room orientation"
        lastUpdated={formatUpdated()}
        primaryAction={
          current
            ? { label: 'Continue current room', href: appRoutes.sessions }
            : { label: 'Enter credential', href: '/enter/credential' }
        }
      />
      <StatusRail
        items={[
          'Invite-linked access',
          'Role-scoped visibility',
          'No transcript published',
          'Approved outcomes only',
        ]}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="My active rooms" value={active.length} />
        <KpiCard label="Actions awaiting me" value={awaitingMe} />
        <KpiCard label="Drafts to review" value={drafts} />
        <KpiCard label="Approved outcomes" value={approved} />
        <KpiCard label="Closed matters" value={closed} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <ProgressRing
          title="My action status"
          description="Where your attention is needed"
          centerLabel="Status"
          segments={[
            { label: 'Action needed', value: awaitingMe },
            { label: 'Waiting on others', value: Math.max(active.length - awaitingMe, 0) },
            { label: 'Under review', value: drafts },
            { label: 'Released', value: approved },
          ]}
        />
        <BarChartPanel
          title="Participation history"
          description="Rounds completed over recent matters"
          data={matters.slice(0, 5).map((m) => ({
            label: m.label.slice(0, 10),
            value: m.round_count,
          }))}
          valueLabel="Rounds"
        />
        <TrustBoundaryExplainer className="lg:col-span-2" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2" id="drafts">
        <ActivityQueue
          title="Next required actions"
          items={active.map((m) => ({
            id: m.matter_id,
            title: m.label,
            meta: `Round ${m.round_count || 1} · ${m.days_in_state}d in ${m.stage}`,
          }))}
        />
        <ActivityQueue
          title="Approved documents available"
          items={matters
            .filter((m) => m.public_record_id || m.stage === 'released')
            .map((m) => ({
              id: m.matter_id,
              title: m.label,
              meta: m.public_record_id ?? 'Internal approved outcome',
              href: m.public_record_id ? `/ledger/${m.public_record_id}` : undefined,
            }))}
        />
        <ActivityQueue
          title="Access validity"
          items={[
            {
              id: 'access',
              title: 'Invitation-linked participant access',
              meta: 'Role-scoped · invite-only · no open signup',
              href: '/enter/credential',
            },
          ]}
        />
        <ActivityQueue
          title="Matter progress"
          items={matters.map((m) => ({
            id: m.matter_id,
            title: m.label,
            meta: `Stage: ${m.stage} · other parties’ content is not shown here`,
          }))}
        />
      </div>
    </div>
  );
}
