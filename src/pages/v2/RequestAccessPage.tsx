import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { useAccessRequest } from '../../hooks/useAccessRequest';
import { CTA, PILOT_FIT_STRONG, PILOT_FIT_WEAK } from '../../data/siteMessaging';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { SectionLabel } from '../../components/SectionLabel';

const ORG_TYPES = [
  'Mediation practice / ADR center',
  'Ombuds office',
  'City / community safety office',
  'Government or public institution',
  'NGO / civil society',
  'Academic institution',
  'Other',
];

const MATTER_TYPES = [
  'Mediation & dispute resolution',
  'Restorative / de-escalation',
  'City community safety',
  'Ombuds / institutional inquiry',
  'Regional consultation',
  'Other',
];

const ROLE_OPTIONS = [
  'Professional mediator / facilitator',
  'Program lead',
  'Ombuds / investigator',
  'Executive / sponsor',
  'Institutional convener',
  'Other',
];

const SENSITIVITY = ['Standard', 'Elevated', 'High'];
const PUBLIC_RECORD = ['Likely needed', 'Optional', 'Internal-only preferred', 'Unsure'];
const TIMEFRAMES = ['Within 30 days', '1–3 months', '3–6 months', 'Exploratory only'];

const SELECT_CLASS =
  'focus-ring w-full border border-line bg-surface-elevated px-3 py-2.5 text-sm text-ink';

const TRUST_RAIL = [
  'Manual review',
  'Invite-only pilot',
  'Role-scoped access',
  'No open self-serve deployment',
  '5–7 business day response',
] as const;

/**
 * Institutional pilot intake console.
 */
export function RequestAccessPage() {
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email')?.trim() ?? '';
  const { submit, loading, error, submitted } = useAccessRequest();
  const [form, setForm] = useState({
    name: '',
    organisation: '',
    email: prefilledEmail,
    role: '',
    orgType: '',
    matterType: '',
    participants: '',
    region: '',
    sensitivity: '',
    publicRecord: '',
    painPoints: '',
    timeframe: '',
    phone: '',
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const detailBlock = [
      form.painPoints.trim(),
      `Role in process: ${form.role}`,
      `Organization type: ${form.orgType}`,
      `Matter type: ${form.matterType}`,
      `Estimated participants: ${form.participants}`,
      `Region / geography: ${form.region}`,
      `Sensitivity level: ${form.sensitivity}`,
      `Public record may be needed: ${form.publicRecord}`,
      `Desired pilot timeframe: ${form.timeframe}`,
      form.phone ? `Contact phone: ${form.phone}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await submit({
      full_name: form.name,
      organisation: form.organisation || undefined,
      email: form.email,
      use_case: form.matterType || form.orgType,
      description: detailBlock,
    });
  }

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-start py-20">
        <div className={publicShellInnerClass}>
          <div className="max-w-lg border border-line bg-surface-elevated p-8 text-left">
            <p className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              Intake
            </p>
            <h1 className="mt-3 font-display text-h2 font-medium text-ink">Submission received</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Manual review. Expect a response within 5–7 business days — not an automated approval.
            </p>
            <div className="mt-6 space-y-3 text-sm text-ink-secondary">
              <p className="m-0 font-medium text-ink">Possible next steps from the review team</p>
              <ul className="m-0 list-disc space-y-1 pl-5">
                <li>Additional diligence required</li>
                <li>Briefing recommended before review</li>
                <li>Not a fit at this stage</li>
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/" className="btn-institutional btn-institutional--ghost">
                Return home
              </Link>
              <Link to="/contact" className="btn-institutional btn-institutional--primary">
                Request a briefing
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-line pb-20">
      <header className="border-b border-line py-14 md:py-16">
        <div className={publicShellInnerClass}>
          <SectionLabel>Pilot intake</SectionLabel>
          <h1 className="mt-3 max-w-2xl font-display text-display font-medium tracking-tight text-ink">
            Request pilot access
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
            Manual application review for facilitators and institutions. Co-designed pilot scope —
            not self-serve signup.
          </p>
        </div>
      </header>

      <div
        className={`${publicShellInnerClass} mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16`}
      >
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="font-display text-h3 font-medium text-ink">Who this is for</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Mediation practices, ombuds offices, institutional conveners, and city community
              safety teams preparing a governed written room with optional public release.
            </p>
          </section>

          <section className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-ink">Strong fit</h3>
              <ul className="mt-3 m-0 list-disc space-y-2 pl-5 text-sm text-ink-secondary">
                {PILOT_FIT_STRONG.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Likely not a fit</h3>
              <ul className="mt-3 m-0 list-disc space-y-2 pl-5 text-sm text-ink-secondary">
                {PILOT_FIT_WEAK.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display text-h3 font-medium text-ink">How intake works</h2>
            <ol className="mt-4 m-0 list-none space-y-4 p-0">
              {[
                'Submit this application with matter context and sensitivity.',
                'Manual diligence conversation within 5–7 business days.',
                'Co-designed pilot scope and role-scoped invitations — no open deployment.',
              ].map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-ink-secondary">
                  <span className="font-mono text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-h3 font-medium text-ink">Pilot application</h2>
            <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
              {error ? (
                <p
                  className="rounded-md border border-sem-danger/40 bg-sem-danger-soft px-3 py-2 text-sm"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="name" label="Name">
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                  />
                </FormField>
                <FormField id="organisation" label="Organization">
                  <Input
                    id="organisation"
                    required
                    value={form.organisation}
                    onChange={(e) => set('organisation', e.target.value)}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="email" label="Work email">
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </FormField>
                <FormField id="phone" label="Contact phone (optional)">
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </FormField>
              </div>
              <FormField id="role" label="Role in process">
                <select
                  id="role"
                  required
                  className={SELECT_CLASS}
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                >
                  <option value="">Select…</option>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="orgType" label="Organization type">
                  <select
                    id="orgType"
                    required
                    className={SELECT_CLASS}
                    value={form.orgType}
                    onChange={(e) => set('orgType', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {ORG_TYPES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField id="matterType" label="Matter type / use case">
                  <select
                    id="matterType"
                    required
                    className={SELECT_CLASS}
                    value={form.matterType}
                    onChange={(e) => set('matterType', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {MATTER_TYPES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="participants" label="Estimated participants">
                  <Input
                    id="participants"
                    required
                    value={form.participants}
                    onChange={(e) => set('participants', e.target.value)}
                    placeholder="e.g. 6–12"
                  />
                </FormField>
                <FormField id="region" label="Region / operating geography">
                  <Input
                    id="region"
                    required
                    value={form.region}
                    onChange={(e) => set('region', e.target.value)}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="sensitivity" label="Sensitivity level">
                  <select
                    id="sensitivity"
                    required
                    className={SELECT_CLASS}
                    value={form.sensitivity}
                    onChange={(e) => set('sensitivity', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {SENSITIVITY.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField id="publicRecord" label="Whether a public record may be needed">
                  <select
                    id="publicRecord"
                    required
                    className={SELECT_CLASS}
                    value={form.publicRecord}
                    onChange={(e) => set('publicRecord', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {PUBLIC_RECORD.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <FormField id="timeframe" label="Desired pilot timeframe">
                <select
                  id="timeframe"
                  required
                  className={SELECT_CLASS}
                  value={form.timeframe}
                  onChange={(e) => set('timeframe', e.target.value)}
                >
                  <option value="">Select…</option>
                  {TIMEFRAMES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField id="pain" label="Current tools or process pain points">
                <textarea
                  id="pain"
                  required
                  rows={4}
                  className={SELECT_CLASS}
                  value={form.painPoints}
                  onChange={(e) => set('painPoints', e.target.value)}
                />
              </FormField>
              <button
                type="submit"
                className="btn-institutional btn-institutional--primary"
                disabled={loading}
              >
                {loading ? 'Submitting…' : CTA.primaryLabel}
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-display text-h3 font-medium text-ink">
              What happens after submission
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              A human reviews fit, sensitivity, and whether a public record path is appropriate. You
              may be asked for a short briefing before any invitations are issued.
            </p>
            <Link to="/contact" className="mt-4 inline-flex text-sm text-brand">
              Optional: request a briefing first →
            </Link>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            Trust rail
          </p>
          <ul className="mt-3 m-0 list-none space-y-2 p-0">
            {TRUST_RAIL.map((item) => (
              <li
                key={item}
                className="rounded-sm border border-line bg-surface-sunken px-3 py-2 text-xs font-medium text-ink-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            We reduce exposure by design. We do not claim full platform zero-knowledge or
            Signal-grade E2E today.
          </p>
        </aside>
      </div>
    </div>
  );
}
