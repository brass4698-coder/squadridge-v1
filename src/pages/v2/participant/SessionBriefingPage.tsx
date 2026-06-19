import { useNavigate, useSearchParams } from 'react-router-dom';

const groundRules = [
  'All contributions within the room are confidential to participants.',
  'Speak from your own perspective. Avoid attributing views to others.',
  'The facilitator may pause the dialogue at any time to maintain process integrity.',
  'If you need to withdraw, do so quietly. You are not required to explain.',
  'No recording, screenshotting, or note-sharing outside the session without facilitator approval.',
];

export function SessionBriefingPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? 'demo-token';
  const navigate = useNavigate();

  function enter() {
    navigate(`/p/waiting?token=${token}`);
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-xl">
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Session Briefing
        </p>
        <h1
          className="mb-3 text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Northern Watershed Consultation
        </h1>
        <p
          className="mb-8 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          You are about to enter a protected dialogue session. Read the details below before proceeding.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-4">
          {[
            { label: 'Date', value: 'Jun 20, 2024' },
            { label: 'Start time', value: '10:00 AM' },
            { label: 'Facilitator', value: 'Regional Mediation Centre' },
            { label: 'Outcome format', value: 'Joint Statement' },
            { label: 'Max participants', value: '12' },
            { label: 'Your role', value: 'Participant' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border p-4"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                {item.label}
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <section
          className="mb-8 rounded-lg border p-6"
          aria-labelledby="ground-rules-heading"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <h2
            id="ground-rules-heading"
            className="mb-4 text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Ground rules
          </h2>
          <ul className="flex flex-col gap-3">
            {groundRules.map((rule) => (
              <li key={rule} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="mt-0.5 text-base leading-none" style={{ color: 'var(--color-accent)' }}>·</span>
                {rule}
              </li>
            ))}
          </ul>
        </section>

        <div
          className="mb-8 rounded-lg border p-5"
          style={{
            borderColor: 'var(--color-pending-strip)',
            backgroundColor: 'var(--color-pending-strip)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
            <strong>Outcome note:</strong> This session may produce a joint statement. If drafted and approved by all designated parties, it will be published to the public ledger. The room itself — including all dialogue — remains permanently private.
          </p>
        </div>

        <button
          onClick={enter}
          className="w-full rounded py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Enter Waiting Room →
        </button>
      </div>
    </div>
  );
}
