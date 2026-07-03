import {
  RoleDashboardShell,
  type DashboardQuickLink,
} from '../../components/dashboard/RoleDashboardShell';

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Published outcomes',
    href: '/ledger',
    description: 'The public ledger of released outcome records.',
  },
  {
    label: 'How it works',
    href: '/how-it-works',
    description: 'Explainer of the session, verification, and release protocols.',
  },
  {
    label: 'Security & privacy',
    href: '/security',
    description: 'What is visible to whom, and what remains encrypted.',
  },
];

export function ObserverDashboardPage() {
  return (
    <RoleDashboardShell
      role="observer"
      headline="Observer view"
      intro="You have read-only access to public outcomes and documentation. Session rooms and participant identities are not accessible from this role."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Observers can read published outcomes and platform documentation. This role is intended for accountability partners, press, and researchers who do not participate in dialogue directly."
    />
  );
}
