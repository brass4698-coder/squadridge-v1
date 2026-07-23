import { RoleDashboardShell } from './RoleDashboardShell';

export function ObserverDashboardPage() {
  return (
    <RoleDashboardShell
      eyebrow="Observer"
      title="Entitled outcomes"
      subtitle="Read-only anchors and released records you are permitted to see — no room dialogue, no intervention controls."
      quickLinks={[{ label: 'Ledger', href: '/ledger', description: 'Public outcome records' }]}
    >
      <div
        className="mt-8 rounded-lg border px-5 py-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          No entitled anchors in this illustrative workspace yet. When a release completes, anchors
          appear here with the same language as the public ledger.
        </p>
      </div>
    </RoleDashboardShell>
  );
}
