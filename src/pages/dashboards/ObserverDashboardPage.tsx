import {
  RoleDashboardShell,
  type DashboardQuickLink,
} from '../../components/dashboard/RoleDashboardShell';

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Public outcome ledger',
    href: '/ledger',
    description: 'Released public records only. Private NGO releases are not listed.',
  },
  {
    label: 'How it works',
    href: '/how-it-works',
    description: 'Configure → Verify → Facilitate → Release in plain language.',
  },
  {
    label: 'Security & privacy',
    href: '/security',
    description: 'Honest boundaries: what is protected, what operators can still read.',
  },
];

export function ObserverDashboardPage() {
  return (
    <RoleDashboardShell
      role="observer"
      headline="Observer view"
      intro="Lightest shell: public records and documentation. Session rooms and participant identities are not accessible from this role."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Observers can read published outcomes and platform documentation. This role is intended for accountability partners and researchers who do not participate in dialogue directly."
    />
  );
}
