import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-12">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          About
        </p>
        <h1
          className="mb-4 text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Why we built MENDguild
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Most dialogue fails not because people are unwilling to talk, but because the conditions are wrong. The room is unsafe. The process has no structure. The outcome is unverifiable. And the technology — if used at all — was built for something else entirely.
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-6 text-sm leading-loose" style={{ color: 'var(--color-text-secondary)' }}>
        <p>
          MENDguild was built to address a specific gap: there was no serious, purpose-built platform for facilitator-led, high-stakes dialogue that combined participant protection, process control, and a credible path to a public outcome record.
        </p>
        <p>
          The platforms people use — video conferencing tools, shared document editors, discussion forums, collaboration suites — were not built for this. They lack eligibility gating, identity protection, facilitator control over the session lifecycle, and a formal, verifiable output.
        </p>
        <p>
          MENDguild is not a collaboration tool. It is structured facilitation infrastructure. The session room is private. The approved outcome can be public. And every step between those two states is controlled by the facilitator, not the platform.
        </p>
        <p>
          We are in an early access phase. The platform is currently available to a limited number of facilitators, mediators, and institutions on a pilot basis. We work closely with pilot partners to ensure the platform is fit for purpose before broader release.
        </p>
      </div>

      <div
        className="mb-10 rounded-xl border p-8"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Platform principles
        </h2>
        <ul className="flex flex-col gap-3">
          {[
            'The room is private. Always. The outcome is public only if approved.',
            'Facilitators are in control of the session lifecycle, not the platform.',
            'Participants must be eligible. Verification is not optional for high-stakes sessions.',
            'Public records must be credible. We do not publish unverified or unapproved content.',
            'We are honest about what the platform does and does not guarantee.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }}>→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-6">
        <Link
          to="/request-access"
          className="text-sm font-medium underline transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-accent)' }}
        >
          Request pilot access →
        </Link>
        <Link
          to="/how-it-works"
          className="text-sm font-medium underline transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          How it works
        </Link>
      </div>
    </div>
  );
}
