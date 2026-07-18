import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { useAccessRequest } from '../../hooks/useAccessRequest';
import { PilotAccessVisual } from '../../components/institutional';
import { EvaluatorPath, MarketingSection, SectionLabel } from '../../components/shared';
import { CTA, PILOT_FIT_STRONG, PILOT_FIT_WEAK } from '../../data/siteMessaging';

const USE_CASE_OPTIONS = [
  'Mediator / dispute resolution professional',
  'Mediation program or ADR center',
  'City / community safety office',
  'Government or public institution',
  'NGO / civil society organization',
  'Peace-tech or conflict-tech researcher',
  'Academic institution',
  'Legal professional',
  'Journalist / documentarian',
  'Other',
];

const ROLE_OPTIONS = [
  'Professional mediator / facilitator',
  'Mediation program lead',
  'NGO / peacebuilding programme lead',
  'Government or public institution',
  'Ombuds / internal investigator',
  'Researcher or academic',
  'Other',
];

const FREQUENCY_OPTIONS = [
  'A few sessions per year',
  'Monthly',
  'Weekly or more',
  'One-off pilot only',
];

const SELECT_CLASS =
  'focus-ring w-full border border-line bg-surface-elevated px-3 py-2.5 text-sm text-ink';

export function RequestAccessPage() {
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email')?.trim() ?? '';
  const { submit, loading, error, submitted } = useAccessRequest();
  const [form, setForm] = useState({
    name: '',
    organisation: '',
    email: prefilledEmail,
    role: '',
    sessionFrequency: '',
    referral: '',
    useCase: '',
    description: '',
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const detailBlock = [
      form.description.trim(),
      form.role ? `Role: ${form.role}` : '',
      form.sessionFrequency ? `Session frequency: ${form.sessionFrequency}` : '',
      form.referral ? `Referral: ${form.referral}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    await submit({
      full_name: form.name,
      organisation: form.organisation || undefined,
      email: form.email,
      use_case: form.useCase,
      description: detailBlock,
    });
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-start justify-center px-6 py-16 md:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <div
            className="mb-5 flex h-10 w-10 items-center justify-center border border-line bg-surface-elevated text-ink-secondary"
            aria-hidden
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-display text-h2 font-medium text-ink">Request received</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-secondary">
            We review all pilot applications manually. You will hear from us within 5–7 business
            days.
          </p>
          <Link to="/" className="btn-institutional btn-institutional--ghost mt-8 inline-flex">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MarketingSection className="!pb-8 !pt-16">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-16">
          <PilotAccessVisual className="order-2 lg:order-1" />
          <div className="order-1 max-w-xl lg:order-2">
            <SectionLabel text="Pilot intake" />
            <h1 className="font-display text-h1 font-medium tracking-tight text-ink">
              Request pilot access
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{CTA.pilotBody}</p>
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              No urgency gimmicks. No auto-approval. We co-design with pilot mediators so the
              platform fits real casework before broader release.
            </p>
          </div>
        </div>
      </MarketingSection>

      <section className="border-t border-line bg-surface-sunken/30 px-6 py-12 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
              Strong fit
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-secondary">
              {PILOT_FIT_STRONG.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-ink-faint">
                    +
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
              Likely not a fit
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-secondary">
              {PILOT_FIT_WEAK.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-ink-faint">
                    −
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mx-auto flex max-w-xl flex-col gap-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="access-name" label="Full name">
              <Input
                id="access-name"
                required
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </FormField>
            <FormField id="access-org" label="Organization">
              <Input
                id="access-org"
                placeholder="Optional"
                value={form.organisation}
                onChange={(e) => set('organisation', e.target.value)}
              />
            </FormField>
          </div>

          <FormField id="access-email" label="Work email">
            <Input
              id="access-email"
              required
              type="email"
              placeholder="jane@organization.org"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </FormField>

          <FormField id="access-role" label="Your role">
            <select
              id="access-role"
              required
              className={SELECT_CLASS}
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            >
              <option value="">Select…</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="access-frequency" label="How often do you run sensitive sessions?">
            <select
              id="access-frequency"
              className={SELECT_CLASS}
              value={form.sessionFrequency}
              onChange={(e) => set('sessionFrequency', e.target.value)}
            >
              <option value="">Select…</option>
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="access-referral" label="How did you hear about SquadRidge?">
            <Input
              id="access-referral"
              placeholder="Optional"
              value={form.referral}
              onChange={(e) => set('referral', e.target.value)}
            />
          </FormField>

          <FormField id="access-use-case" label="Primary use case">
            <select
              id="access-use-case"
              required
              className={SELECT_CLASS}
              value={form.useCase}
              onChange={(e) => set('useCase', e.target.value)}
            >
              <option value="">Select…</option>
              {USE_CASE_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="access-description" label="Operational context">
            <textarea
              id="access-description"
              required
              rows={4}
              className={SELECT_CLASS}
              placeholder="Describe your dialogue context, facilitator capacity, and what you need from verification…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </FormField>

          {error ? (
            <p className="text-sm text-sem-danger" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-institutional btn-institutional--primary w-full disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Submit request'}
          </button>

          <p className="text-center text-xs text-ink-faint">
            We review all applications manually. Your information is kept confidential.
          </p>
        </form>
      </section>

      <MarketingSection className="!py-12">
        <div className="mx-auto max-w-6xl">
          <EvaluatorPath current="apply" />
        </div>
      </MarketingSection>
    </div>
  );
}
