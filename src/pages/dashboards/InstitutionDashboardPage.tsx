import { Link } from 'react-router-dom';
import { RoleDashboardShell } from './RoleDashboardShell';

const cohorts = [
  {
    id: 'coh-1',
    name: 'Watershed cohort — June pilot',
    invitesSent: 12,
    accepted: 9,
    policy: 'Written-only rounds · release gate required',
  },
  {
    id: 'coh-2',
    name: 'Housing working group',
    invitesSent: 6,
    accepted: 4,
    policy: 'Observer read-only after release',
  },
];

const policyDefaults = [
  { label: 'Outcome release', value: 'All parties + facilitator must approve' },
  { label: 'Room retention', value: 'Ephemeral dialogue · no public transcript' },
  { label: 'Pacing interventions', value: 'Metadata audit only · never message bodies' },
];

export function InstitutionDashboardPage() {
  return (
    <RoleDashboardShell
      eyebrow="Institution"
      title="Org, invites, policy"
      subtitle="Workspace for institution admins: invite cohorts, policy defaults, and audit exports — not live room facilitation."
      quickLinks={[
        {
          label: 'Request access (public)',
          href: '/request-access',
          description: 'Pilot intake for new institutional partners',
        },
        {
          label: 'Settings',
          href: '/settings',
          description: 'Account and notification preferences',
        },
        {
          label: 'Public ledger',
          href: '/ledger',
          description: 'Released records only — diligence surface',
        },
      ]}
    >
      <section className="mt-8" aria-labelledby="institution-cohorts">
        <h2
          id="institution-cohorts"
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Invite cohorts
        </h2>
        <ul className="mt-3 space-y-3">
          {cohorts.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border px-5 py-4"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {c.name}
                </h3>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {c.accepted}/{c.invitesSent} accepted
                </span>
              </div>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {c.policy}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="institution-policy">
        <h2
          id="institution-policy"
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Policy defaults
        </h2>
        <dl
          className="mt-3 space-y-3 rounded-lg border px-5 py-4"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          {policyDefaults.map((row) => (
            <div key={row.label}>
              <dt
                className="text-xs uppercase tracking-wide"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {row.label}
              </dt>
              <dd className="mt-0.5 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        Audit exports stay metadata-only. For ops moderation (reports, rooms), use{' '}
        <Link
          to="/admin/rooms"
          className="underline-offset-2 hover:underline"
          style={{ color: 'var(--color-accent)' }}
        >
          /admin
        </Link>
        — clearly labeled operations, not this workspace.
      </p>
    </RoleDashboardShell>
  );
}
