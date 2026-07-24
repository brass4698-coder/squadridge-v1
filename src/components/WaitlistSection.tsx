import type { FormEvent } from 'react';
import { FormField } from './ui/FormField';
import { FormPanel } from './ui/FormPanel';
import { Input } from './ui/Input';
import { useWaitlistForm } from '../hooks';

const ROLE_CHIPS = [
  'Mediator/peacebuilder',
  'Facilitator/coach',
  'Cross-border operator',
  'Partner/funder',
  'Other',
] as const;

function RoleRadios({
  roleHint,
  onChange,
  name,
}: {
  roleHint: string;
  onChange: (value: string) => void;
  name: string;
}) {
  return (
    <fieldset className="mt-6 border-0 p-0">
      <legend className="mb-3 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
        Role
      </legend>
      <div className="space-y-2">
        {ROLE_CHIPS.map((role) => (
          <label
            key={role}
            className={`sr-form-tile focus-ring flex cursor-pointer flex-row items-center gap-3 !p-3 ${
              roleHint === role ? 'border-brand/40 bg-surface-accent' : ''
            }`}
          >
            <input
              type="radio"
              name={name}
              value={role}
              checked={roleHint === role}
              onChange={() => onChange(role)}
              className="peer sr-only"
            />
            <span
              className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-sunken peer-checked:border-brand peer-checked:bg-brand/15 peer-checked:[&_.waitlist-radio-dot]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40"
              aria-hidden
            >
              <span className="waitlist-radio-dot h-1.5 w-1.5 rounded-full bg-brand opacity-0 transition-opacity" />
            </span>
            <span className="text-sm leading-snug text-ink">{role}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function WaitlistSection() {
  const {
    email,
    setEmail,
    roleHint,
    setRoleHint,
    status,
    feedback,
    handleSubmit,
    configured,
    externalUrl,
  } = useWaitlistForm();

  const introBlocks = (
    <>
      <div className="mt-2 rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken/70 px-4 py-3">
        <p className="mb-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.12em] text-ink-faint">
          Priority note
        </p>
        <p className="mb-0 mt-2 text-sm leading-relaxed text-ink-secondary">
          We prioritize pilots where the facilitator, participant profile, and risk model are
          already defined.
        </p>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-ink-secondary">
        Leave your role and contact email. We will only reach out when there is a facilitator-led
        pilot or walkthrough that fits your background.
      </p>
    </>
  );

  if (externalUrl) {
    return (
      <section id="waitlist" className="scroll-mt-8 text-left" aria-labelledby="waitlist-heading">
        <FormPanel
          eyebrow="Request access"
          title="Request pilot access"
          titleId="waitlist-heading"
          description={introBlocks}
        >
          <RoleRadios roleHint={roleHint} onChange={setRoleHint} name="waitlist-role-external" />
          <div className="mt-8">
            <a
              href={externalUrl}
              className="btn-institutional btn-institutional--primary inline-flex min-h-[44px] items-center justify-center no-underline"
              rel={/^https?:/i.test(externalUrl) ? 'noopener noreferrer' : undefined}
              target={/^https?:/i.test(externalUrl) ? '_blank' : undefined}
            >
              Request pilot access
            </a>
          </div>
        </FormPanel>
      </section>
    );
  }

  return (
    <section id="waitlist" className="scroll-mt-8 text-left" aria-labelledby="waitlist-heading">
      <FormPanel
        eyebrow="Request access"
        title="Request pilot access"
        titleId="waitlist-heading"
        description={introBlocks}
        footer={
          !configured
            ? 'Operators: configure Supabase in .env or set VITE_WAITLIST_FORM_URL.'
            : undefined
        }
      >
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => void handleSubmit(e)}
          className="mt-0 border-0 bg-transparent p-0 shadow-none"
          aria-label="Request pilot access"
          aria-busy={status === 'loading'}
        >
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
            defaultValue=""
          />
          <RoleRadios roleHint={roleHint} onChange={setRoleHint} name="waitlist-role" />
          <div className="mt-8 space-y-4">
            <FormField id="waitlist-email" label="Contact email" instrument>
              <Input
                id="waitlist-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                disabled={status === 'loading'}
                invalid={status === 'error'}
              />
            </FormField>
            <button
              id="waitlist-join-btn"
              type="submit"
              className="btn-institutional btn-institutional--primary w-full min-h-[44px] justify-center disabled:cursor-not-allowed disabled:opacity-50"
              disabled={status === 'loading' || !configured}
            >
              {status === 'loading' ? 'Sending...' : 'Request pilot access'}
            </button>
          </div>
        </form>
        {feedback ? (
          <p
            className={`mt-4 rounded-[var(--sr-radius-md)] border px-4 py-3 text-sm ${
              status === 'error'
                ? 'border-sem-warning/40 bg-sem-warning-soft text-ink'
                : 'border-line bg-surface-sunken text-ink-secondary'
            }`}
            role="status"
            aria-live="polite"
          >
            {feedback}
          </p>
        ) : null}
      </FormPanel>
    </section>
  );
}
