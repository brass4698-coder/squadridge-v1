import { Link } from 'react-router-dom';
import { RoleDashboardShell } from './RoleDashboardShell';

const invites = [
  {
    id: 'inv-1',
    title: 'Northern Watershed Consultation',
    status: 'Verified — ready to enter',
    next: '/p/waiting/demo-token',
    cta: 'Enter waiting room',
  },
  {
    id: 'inv-2',
    title: 'Urban Housing Policy Working Group',
    status: 'Verification pending',
    next: '/p/verify/demo-token-2',
    cta: 'Continue verification',
  },
];

export function ParticipantDashboardPage() {
  return (
    <RoleDashboardShell
      eyebrow="Participant"
      title="Your next step"
      subtitle="Invites, verification, and room entry — no ops chrome. Only what you need to stay in the dialogue."
    >
      <div className="mt-8 space-y-4">
        {invites.map((inv) => (
          <article
            key={inv.id}
            className="rounded-lg border px-5 py-4"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {inv.title}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {inv.status}
            </p>
            <Link
              to={inv.next}
              className="mt-3 inline-flex rounded px-3 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {inv.cta}
            </Link>
          </article>
        ))}
      </div>

      <div
        className="mt-8 rounded-lg border px-5 py-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          In the room
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Use Slow down when you need a breath. Pull back retracts a recent message within the time
          window. Facilitators may suggest pacing — they never see a “mood score.”
        </p>
        <Link
          to="/p/room/demo-token"
          className="mt-3 inline-block text-sm font-medium underline-offset-2 hover:underline"
          style={{ color: 'var(--color-accent)' }}
        >
          Open practice room
        </Link>
      </div>
    </RoleDashboardShell>
  );
}
