import { useState } from 'react';
import { Link } from 'react-router-dom';

type FormData = {
  name: string;
  org: string;
  role: string;
  useCase: string;
  region: string;
  email: string;
};

const initialData: FormData = { name: '', org: '', role: '', useCase: '', region: '', email: '' };

export function RequestAccessPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  function validate(): Partial<FormData> {
    const e: Partial<FormData> = {};
    if (!formData.name.trim()) e.name = 'Your name is required.';
    if (!formData.org.trim()) e.org = 'Organisation name is required.';
    if (!formData.role.trim()) e.role = 'Your role is required.';
    if (!formData.useCase.trim()) e.useCase = 'Please describe your use case.';
    if (!formData.email.trim()) e.email = 'Email address is required.';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) e.email = 'Enter a valid email address.';
    return e;
  }

  function handleChange(key: keyof FormData, value: string) {
    setFormData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setFormState('submitting');
    // Replace with real API call
    setTimeout(() => setFormState('success'), 1400);
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
      <section className="mx-auto max-w-xl px-6 py-20">

        {/* Hero */}
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Pilot programme
        </p>
        <h1
          className="mb-4 text-4xl font-medium tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Request pilot access.
        </h1>
        <p
          className="mb-12 text-base leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          SquadRidge is in structured pilot. We review every application individually
          and work with facilitators and organisations whose use cases match our
          current capacity. No automated approvals.
        </p>

        {formState === 'success' ? (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border p-10 text-center"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <p
              className="mb-3 text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Your application has been received.
            </p>
            <p
              className="mb-8 text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              We review every application individually. If your use case is a match,
              we'll reach out to arrange a briefing call. Thank you for your interest.
            </p>
            <Link
              to="/"
              className="text-sm underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Return to home →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-6"
            aria-label="Pilot access application form"
          >
            {/* Text fields */}
            {([
              { id: 'name',  label: 'Your full name',          type: 'text',  key: 'name'  as const },
              { id: 'org',   label: 'Organisation',            type: 'text',  key: 'org'   as const },
              { id: 'role',  label: 'Your role or title',      type: 'text',  key: 'role'  as const },
              { id: 'region',label: 'Region or country',       type: 'text',  key: 'region'as const },
              { id: 'email', label: 'Work email address',      type: 'email', key: 'email' as const },
            ] as const).map((field) => (
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
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  aria-invalid={!!errors[field.key]}
                  aria-describedby={errors[field.key] ? `${field.id}-error` : undefined}
                  className="w-full rounded border px-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    borderColor: errors[field.key] ? 'var(--color-danger)' : 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                {errors[field.key] && (
                  <p
                    id={`${field.id}-error`}
                    role="alert"
                    className="mt-1.5 text-xs"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    {errors[field.key]}
                  </p>
                )}
              </div>
            ))}

            {/* Use case textarea */}
            <div>
              <label
                htmlFor="useCase"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Describe your use case
              </label>
              <p
                id="useCase-hint"
                className="mb-2 text-xs"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                What kind of sessions do you facilitate? What problem are you solving?
              </p>
              <textarea
                id="useCase"
                rows={5}
                value={formData.useCase}
                onChange={(e) => handleChange('useCase', e.target.value)}
                aria-describedby={errors.useCase ? 'useCase-error' : 'useCase-hint'}
                aria-invalid={!!errors.useCase}
                className="w-full rounded border px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  borderColor: errors.useCase ? 'var(--color-danger)' : 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  resize: 'vertical',
                }}
              />
              {errors.useCase && (
                <p
                  id="useCase-error"
                  role="alert"
                  className="mt-1.5 text-xs"
                  style={{ color: 'var(--color-danger)' }}
                >
                  {errors.useCase}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formState === 'submitting'}
              className="w-full rounded py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {formState === 'submitting' ? 'Submitting…' : 'Submit Application'}
            </button>

            {formState === 'error' && (
              <p
                role="alert"
                className="text-center text-xs"
                style={{ color: 'var(--color-danger)' }}
              >
                We couldn't submit your application. Please try again or contact us directly.
              </p>
            )}

            <p
              className="text-center text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              By submitting, you agree to our{' '}
              <Link to="/privacy" className="underline">Privacy Policy</Link>
              {' '}and{' '}
              <Link to="/terms" className="underline">Terms of Use</Link>.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
