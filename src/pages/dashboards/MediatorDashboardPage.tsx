import {
  RoleDashboardShell,
  type DashboardQuickLink,
} from '../../components/dashboard/RoleDashboardShell';

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Sessions',
    href: '/app/sessions',
    description: 'Live and upcoming sessions where you assist the facilitator.',
  },
  {
    label: 'Insights',
    href: '/app/insights',
    description: 'Session sentiment traces and de-escalation signals (read-focused).',
  },
  {
    label: 'Public ledger',
    href: '/ledger',
    description: 'Published outcomes only — private releases stay off this index.',
  },
];

export function MediatorDashboardPage() {
  return (
    <RoleDashboardShell
      role="mediator"
      headline="Mediation assist"
      intro="Denser than participant view, lighter than facilitator control. You support the room; session start/end and release remain facilitator-owned."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Mediators assist facilitators during high-tension dialogue. You can view session state and participate in the room. Creating sessions, issuing invites, and releasing outcomes remain facilitator actions."
    />
  );
}
