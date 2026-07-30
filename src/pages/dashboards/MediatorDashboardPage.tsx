import { RoleDashboardShell } from './RoleDashboardShell';

const matters = [
  {
    id: 'mat-1',
    title: 'Watershed — joint statement',
    stage: 'Release draft in review',
    parties: 2,
    nextAction: 'Review approval chips before release gate',
  },
  {
    id: 'mat-2',
    title: 'Housing working group — clause B',
    stage: 'Agreement framing',
    parties: 3,
    nextAction: 'Confirm parties ready for written-only round',
  },
];

export function MediatorDashboardPage() {
  return (
    <RoleDashboardShell
      eyebrow="Mediator"
      title="Matters in progress"
      subtitle="Case-centric workspace: agreements, release drafts, and party readiness — overlapping tools with facilitators, different information architecture."
      quickLinks={[
        {
          label: 'Open sessions list',
          href: '/sessions',
          description: 'Live and scheduled rooms linked to your matters',
        },
        {
          label: 'Public ledger',
          href: '/ledger',
          description: 'Released records only — never private room dialogue',
        },
      ]}
    >
      <ul className="mt-8 space-y-3">
        {matters.map((m) => (
          <li
            key={m.id}
            className="rounded-lg border px-5 py-4"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {m.title}
              </h2>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {m.parties} parties
              </span>
            </div>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-accent)' }}>
              {m.stage}
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Next: {m.nextAction}
            </p>
          </li>
        ))}
      </ul>
    </RoleDashboardShell>
  );
}
