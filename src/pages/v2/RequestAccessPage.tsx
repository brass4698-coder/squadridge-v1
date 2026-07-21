import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { useAccessRequest } from '../../hooks/useAccessRequest';
import { CTA, PILOT_FIT_STRONG, PILOT_FIT_WEAK } from '../../data/siteMessaging';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

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

/**
 * Request access — single intake composition: criteria + process + form.
 * No marketing-hero kit, no evaluator path filler.
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
      <div className="flex min-h-[70vh] items-start py-20">
        <div className={publicShellInnerClass}>
          <div className="max-w-md border border-line bg-surface-elevated p-8 text-left">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
              Intake
            </p>
            <h1 className="mt-3 font-display text-h2 font-medium text-ink">Request received</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Manual review. Expect a response within 5–7 business days — not an automated approval.
            </p>
            <Link to="/" className="btn-institutional btn-institutional--ghost mt-8 inline-flex">
              Return home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-line">
      <div
        className={`${publicShellInnerClass} grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]`}
      >
        {/* Left rail — criteria & process (sticky on large screens) */}
        <aside className="border-b border-line py-14 lg:sticky lg:top-14 lg:self-start lg:border-b-0 lg:border-r lg:py-16 lg:pr-12">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
            Pilot intake
          </p>
          <h1 className="mt-4 font-display text-display font-medium text-ink">
            Request pilot access
          </h1>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink-secondary">
            {CTA.pilotBody} No urgency gimmicks. No auto-approval.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-brand">
                Strong fit
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
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
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
                Likely not a fit
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
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

          <ol className="mt-10 space-y-3 border-t border-line pt-8 text-sm text-ink-secondary">
            <li className="flex gap-3">
              <span className="font-mono text-xs text-ink-faint">01</span>
              Submit operational context
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-ink-faint">02</span>
              Manual fit review
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-ink-faint">03</span>
              Diligence conversation & co-designed scope
            </li>
          </ol>
        </aside>

        {/* Form */}
        <div className="py-14 lg:py-16 lg:pl-12">
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="flex w-full max-w-lg flex-col gap-5 text-left"
          >
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
              Application
            </p>

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
                placeholder="Dialogue context, facilitator capacity, what you need from verification…"
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
              {loading ? 'Submitting…' : 'Submit for manual review'}
            </button>

            <p className="text-xs leading-relaxed text-ink-faint">
              Information is reviewed confidentially. This is not self-serve account creation.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
