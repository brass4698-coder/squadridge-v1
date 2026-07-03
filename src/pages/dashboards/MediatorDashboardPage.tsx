import {
  RoleDashboardShell,
  type DashboardQuickLink,
} from '../../components/dashboard/RoleDashboardShell';

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Sessions to mediate',
    href: '/app/sessions',
    description: 'Live and upcoming sessions where you are assigned as a mediator.',
  },
  {
    label: 'Outcomes in review',
    href: '/app/outcomes/new',
    description: 'Draft or in-progress outcome documents awaiting your input.',
  },
  {
    label: 'Insights',
    href: '/app/insights',
    description: 'Session sentiment traces and de-escalation signals.',
  },
];

export function MediatorDashboardPage() {
  return (
    <RoleDashboardShell
      role="mediator"
      headline="Mediation workspace"
      intro="Your workspace mirrors the facilitator surface with read-write access to mediation-specific tools. Session control still requires a facilitator on the room."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Mediators assist facilitators during high-tension dialogue moments. You can view session state, participate in the room, and co-author outcomes. You cannot create sessions or issue invites."
    />
  );
}
