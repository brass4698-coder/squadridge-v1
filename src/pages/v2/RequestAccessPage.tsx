import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { useAccessRequest } from '../../hooks/useAccessRequest';

const USE_CASE_OPTIONS = [
  'Mediator / dispute resolution professional',
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand"
          aria-hidden
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mb-2 text-page-title text-ink">Request received</h1>
        <p className="max-w-sm text-app-body leading-relaxed text-ink-secondary">
          We review all pilot applications manually. You will hear from us within 5–7 business days.
        </p>
        <Button asChild variant="link" className="mt-6">
          <Link to="/">Return to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="mb-10 text-center">
        <p className="mb-2 text-app-meta font-semibold uppercase tracking-widest text-ink-secondary">
          Pilot access
        </p>
        <h1 className="mb-2 text-page-title text-ink">Request access</h1>
        <p className="text-app-body leading-relaxed text-ink-secondary">
          SquadRidge is currently in a closed pilot. Tell us about your use case and we will be in
          touch.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
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
            className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink"
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
            className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink"
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
            className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink"
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

        <FormField id="access-description" label="Brief description">
          <textarea
            id="access-description"
            required
            rows={4}
            className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink"
            placeholder="Describe the conflict context you work in and how you would use SquadRidge…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </FormField>

        {error ? (
          <p className="text-app-meta text-sem-danger" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Submit request
        </Button>

        <p className="text-center text-app-meta text-ink-secondary">
          We review all applications manually. Your information is kept confidential.
        </p>
      </form>
    </div>
  );
}
