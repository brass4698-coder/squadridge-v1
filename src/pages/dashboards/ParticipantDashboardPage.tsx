import {
  RoleDashboardShell,
  type DashboardQuickLink,
} from '../../components/dashboard/RoleDashboardShell';

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Enter with an invitation link',
    href: '/invite',
    description: 'Have a fresh invite email? Open the link from your inbox, or paste the code.',
  },
  {
    label: 'Public outcome ledger',
    href: '/ledger',
    description:
      'Only publicly published outcomes appear here. Private NGO releases stay off this index.',
  },
  {
    label: 'Your profile',
    href: '/settings',
    description: 'Display name and notification preferences for your account.',
  },
];

export function ParticipantDashboardPage() {
  return (
    <RoleDashboardShell
      role="participant"
      headline="Participation home"
      intro="Most work happens through facilitator invitation links. This page is a quiet home base if you sign in directly."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Participants join via single-use invitation links and use a session codename in the room. Facilitators and platform operators can still see operational metadata required to run the session — room content is protected by access controls, not Signal-grade encryption against the operator. Only facilitator-approved outcomes may be released."
    />
  );
}
