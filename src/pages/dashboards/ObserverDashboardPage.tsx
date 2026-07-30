import { Link } from 'react-router-dom';
import { RoleDashboardShell } from './RoleDashboardShell';

const entitled = [
  {
    id: 'anc-1',
    title: 'Joint weekly monitoring window',
    released: 'Illustrative · public ledger',
    href: '/ledger',
  },
];

export function ObserverDashboardPage() {
  return (
    <RoleDashboardShell
      eyebrow="Observer"
      title="Entitled outcomes"
      subtitle="Read-only anchors and released records you are permitted to see — no room dialogue, no intervention controls."
      quickLinks={[{ label: 'Ledger', href: '/ledger', description: 'Public outcome records' }]}
    >
      <ul className="mt-8 space-y-3">
        {entitled.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border px-5 py-4"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {a.title}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {a.released}
            </p>
            <Link
              to={a.href}
              className="mt-3 inline-block text-sm font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              View anchor
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        Observers never receive room message bodies. Entitlement is release-gated.
      </p>
    </RoleDashboardShell>
  );
}
