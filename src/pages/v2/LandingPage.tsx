import { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Private vs Public table data ───────────────────────────────────────────
const comparisonRows = [
  { feature: 'Session content', private: 'Protected. Never published.', public: 'Full transcript exposed' },
  { feature: 'Participant identities', private: 'Verified but not disclosed', public: 'Searchable and indexed' },
  { feature: 'What becomes public', private: 'Approved outcome text only', public: 'Everything, by default' },
  { feature: 'Outcome authority', private: 'Facilitator-controlled release', public: 'Platform-controlled' },
  { feature: 'Auditability', private: 'Verification anchor on every record', public: 'None' },
];

// ─── How it works steps ──────────────────────────────────────────────────────
const steps = [
  {
    number: '01',
    heading: 'Configure',
    body: 'Before any participant enters, eligibility requirements, verification steps, and ground rules are locked.',
  },
  {
    number: '02',
    heading: 'Verify',
    body: 'Every participant completes an eligibility and identity assurance process. Access is not granted until verification is confirmed.',
  },
  {
    number: '03',
    heading: 'Facilitate',
    body: 'The session runs inside a protected room. Raw discussion is not stored for public access.',
  },
  {
    number: '04',
    heading: 'Draft & Release',
    body: 'After the session closes, the facilitator leads outcome drafting. No text is published until every required approval is recorded.',
  },
];

// ─── Audience cards ──────────────────────────────────────────────────────────
const audiences = [
  { label: 'Mediators & Facilitators', description: 'Run credible dialogue without losing control of the room or the record.' },
  { label: 'NGOs & Civil Society', description: 'Produce defensible outcomes for programmes where accountability matters.' },
  { label: 'Government & Diplomacy', description: 'Convene sensitive conversations that produce verifiable, citable results.' },
  { label: 'Research & Academia', description: 'Generate ethically-sourced primary records from structured deliberation.' },
  { label: 'Institutional Funders', description: 'Require outcome evidence that meets your due diligence standards.' },
];

// ─── Sample record preview ───────────────────────────────────────────────────
const sampleRecord = {
  id: 'SQR-2024-0147',
  title: 'Community Land Use — Joint Statement of Principles',
  org: 'Regional Mediation Centre',
  released: 'March 14, 2024',
  participants: '12 verified',
  outcome: 'Agreement reached on three core principles governing future land-use consultations in the northern watershed region.',
};

export function LandingPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', org: '', role: '', useCase: '', email: '' });
  const [formErrors, setFormErrors] = useState<Partial<typeof formData>>({});

  function validate() {
    const errs: Partial<typeof formData> = {};
    if (!formData.name.trim()) errs.name = 'Your name is required.';
    if (!formData.org.trim()) errs.org = 'Organization is required.';
    if (!formData.role.trim()) errs.role = 'Your role is required.';
    if (!formData.useCase.trim()) errs.useCase = 'Please describe your use case.';
    if (!formData.email.trim()) errs.email = 'Email address is required.';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) errs.email = 'Enter a valid email address.';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormState('submitting');
    // Simulate async submit — replace with real API call
    setTimeout(() => setFormState('success'), 1200);
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-24 text-center">
        <p
          className="mb-5 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Privacy-first dialogue infrastructure
        </p>
        <h1
          className="mb-6 text-5xl font-medium leading-tight tracking-tight sm:text-6xl md:text-7xl"
          style={{ color: 'var(--color-text-primary)', lineHeight: '1.08' }}
        >
          The room stays private.
          <br />
          The outcome becomes a record.
        </h1>
        <p
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          SquadRidge is structured dialogue infrastructure for facilitators who need
          verified participants, protected sessions, and credible public outcomes —
          without exposing what happened inside.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/request-access"
            className="rounded px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-label="Request pilot access to SquadRidge"
          >
            Request Pilot Access
          </Link>
          <Link
            to="/how-it-works"
            className="rounded border px-6 py-3 text-sm font-medium transition-opacity hover:opacity-70"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* ── PROOF STRIP ──────────────────────────────────────────────────────── */}
      <section
        className="border-y py-8"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-6 text-center sm:grid-cols-3">
          {[
            { stat: 'Pilot access', label: 'Apply for structured access — not open sign-up' },
            { stat: 'No public session data', label: 'Raw dialogue is never published' },
            { stat: 'Verified outcomes only', label: 'Every public record carries a verification anchor' },
          ].map((item) => (
            <div key={item.stat}>
              <p className="mb-1 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {item.stat}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY ORDINARY TOOLS FAIL ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <h2
              className="mb-6 text-3xl font-medium tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Ordinary collaboration tools
              weren't built for this.
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Video calls produce no record. Shared docs expose everything to everyone.
              Survey tools aggregate but don't verify. None of them were designed for
              dialogue where the stakes are high, the participants are sensitive, and
              the outcome needs to be both credible and protected.
            </p>
          </div>
          <div>
            <h2
              className="mb-6 text-3xl font-medium tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              SquadRidge was.
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Every part of the platform — verification, session architecture, outcome
              drafting, approval flow, and public ledger — is designed around a single
              operating principle: the room is never the record. What participants say
              stays protected. What they agree to becomes verifiable.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section
        className="border-y py-24"
        style={{ borderColor: 'var(--color-border)' }}
        id="how-it-works"
      >
        <div className="mx-auto max-w-3xl px-6">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            The session lifecycle
          </p>
          <h2
            className="mb-16 text-4xl font-medium tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Four stages. One protected process.
          </h2>
          <ol className="flex flex-col gap-12">
            {steps.map((step) => (
              <li key={step.number} className="flex gap-8">
                <span
                  className="mt-1 shrink-0 text-3xl font-light tabular-nums"
                  style={{ color: 'var(--color-border)', minWidth: '3rem' }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <div>
                  <h3
                    className="mb-2 text-lg font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {step.heading}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── WHO IT'S FOR ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2
          className="mb-12 text-4xl font-medium tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Built for the work that
          requires precision.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a) => (
            <div
              key={a.label}
              className="rounded-lg border p-6"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {a.label}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {a.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRIVATE VS PUBLIC TABLE ───────────────────────────────────────────── */}
      <section
        className="border-y py-24"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="mx-auto max-w-4xl px-6">
          <h2
            className="mb-12 text-4xl font-medium tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            What stays private.
            What becomes public.
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <th
                    className="py-3 pr-8 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-secondary)' }}
                    scope="col"
                  >
                    Aspect
                  </th>
                  <th
                    className="py-3 pr-8 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-accent)' }}
                    scope="col"
                  >
                    SquadRidge
                  </th>
                  <th
                    className="py-3 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-secondary)' }}
                    scope="col"
                  >
                    Standard tools
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className="border-b"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <td
                      className="py-4 pr-8 font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {row.feature}
                    </td>
                    <td
                      className="py-4 pr-8"
                      style={{ color: 'var(--color-success)' }}
                    >
                      {row.private}
                    </td>
                    <td
                      className="py-4"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {row.public}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SAMPLE RECORD PREVIEW ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Public ledger
        </p>
        <h2
          className="mb-10 text-4xl font-medium tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          This is what a public record looks like.
        </h2>
        <Link
          to="/ledger/demo-proposal-001"
          className="block rounded-lg border p-8 transition-shadow hover:shadow-md"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-ledger-bg)',
          }}
          aria-label="View sample public outcome record"
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p
                className="mb-1 font-mono text-xs"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {sampleRecord.id}
              </p>
              <h3
                className="text-xl font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {sampleRecord.title}
              </h3>
            </div>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: '#DCEDE3', color: '#2A5438' }}
            >
              Released
            </span>
          </div>
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {sampleRecord.outcome}
          </p>
          <div
            className="flex flex-wrap gap-6 border-t pt-4 text-xs"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <span>Organisation: {sampleRecord.org}</span>
            <span>Released: {sampleRecord.released}</span>
            <span>Participants: {sampleRecord.participants}</span>
          </div>
        </Link>
        <p className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          The session that produced this outcome is not public.{' '}
          <Link to="/ledger" className="underline" style={{ color: 'var(--color-accent)' }}>
            Browse all public records →
          </Link>
        </p>
      </section>

      {/* ── PILOT ACCESS CTA ─────────────────────────────────────────────────── */}
      <section
        className="border-t py-24"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2
            className="mb-4 text-4xl font-medium tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Apply for pilot access.
          </h2>
          <p
            className="mb-10 text-base leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            SquadRidge is in structured pilot. We work with a limited number of
            facilitators and organisations at a time. If your use case is a match,
            we'll be in touch.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/request-access"
              className="rounded px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
              aria-label="Apply for SquadRidge pilot access"
            >
              Apply for Access
            </Link>
            <Link
              to="/for-facilitators"
              className="text-sm underline transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              For facilitators specifically →
            </Link>
          </div>
        </div>
      </section>

      {/* ── INLINE PILOT FORM (below fold) ───────────────────────────────────── */}
      <section
        className="border-t py-20"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(255,255,255,0.5)' }}
        id="apply"
        aria-labelledby="apply-heading"
      >
        <div className="mx-auto max-w-lg px-6">
          <h2
            id="apply-heading"
            className="mb-2 text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Request pilot access
          </h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            We review every application individually. No automated approvals.
          </p>

          {formState === 'success' ? (
            <div
              role="alert"
              className="rounded-lg border p-8 text-center"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <p className="mb-2 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Your application has been received.
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                We review every application individually. If your use case is a match,
                we'll reach out to arrange a briefing call. Thank you.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {([
                { id: 'name', label: 'Your name', type: 'text', key: 'name' as const },
                { id: 'org', label: 'Organisation', type: 'text', key: 'org' as const },
                { id: 'role', label: 'Your role', type: 'text', key: 'role' as const },
                { id: 'email', label: 'Email address', type: 'email', key: 'email' as const },
              ]).map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="mb-1.5 block text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    autoComplete={field.id}
                    value={formData[field.key]}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, [field.key]: e.target.value }))
                    }
                    aria-invalid={!!formErrors[field.key]}
                    aria-describedby={formErrors[field.key] ? `${field.id}-error` : undefined}
                    className="w-full rounded border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                    style={{
                      borderColor: formErrors[field.key] ? 'var(--color-danger)' : 'var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  {formErrors[field.key] && (
                    <p
                      id={`${field.id}-error`}
                      role="alert"
                      className="mt-1.5 text-xs"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      {formErrors[field.key]}
                    </p>
                  )}
                </div>
              ))}

              <div>
                <label
                  htmlFor="useCase"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Describe your use case
                </label>
                <textarea
                  id="useCase"
                  rows={4}
                  value={formData.useCase}
                  onChange={(e) => setFormData((d) => ({ ...d, useCase: e.target.value }))}
                  aria-invalid={!!formErrors.useCase}
                  aria-describedby={formErrors.useCase ? 'useCase-error' : undefined}
                  className="w-full rounded border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                  style={{
                    borderColor: formErrors.useCase ? 'var(--color-danger)' : 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    resize: 'vertical',
                  }}
                />
                {formErrors.useCase && (
                  <p
                    id="useCase-error"
                    role="alert"
                    className="mt-1.5 text-xs"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    {formErrors.useCase}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={formState === 'submitting'}
                className="w-full rounded py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                {formState === 'submitting' ? 'Submitting…' : 'Submit Application'}
              </button>

              {formState === 'error' && (
                <p role="alert" className="text-center text-xs" style={{ color: 'var(--color-danger)' }}>
                  We couldn't submit your application. Please try again or contact us directly.
                </p>
              )}
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
