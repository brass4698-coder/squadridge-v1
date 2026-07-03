import {
  RoleDashboardShell,
  type DashboardQuickLink,
} from '../../components/dashboard/RoleDashboardShell';

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Enter with an invitation link',
    href: '/invite',
    description: 'Have a fresh invite email? Paste the code or open the link from your inbox.',
  },
  {
    label: 'Published outcomes',
    href: '/ledger',
    description: 'Ledger records for sessions whose outcomes have been publicly published.',
  },
  {
    label: 'Your profile',
    href: '/settings',
    description: 'Manage the display name and notification preferences tied to your account.',
  },
];

export function ParticipantDashboardPage() {
  return (
    <RoleDashboardShell
      role="participant"
      headline="Your participation home"
      intro="Most of what you do happens via the invitation links your facilitators send. This page is a home base if you sign in directly."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Participants enter sessions via single-use invitation links. Your name inside the room is a pseudonymous codename — your real identity is never revealed to other participants, and only aggregated outcomes may become public."
    />
  );
}
