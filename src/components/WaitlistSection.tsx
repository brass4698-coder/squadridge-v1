import type { FormEvent } from 'react';
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
      <legend className="mb-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Role
      </legend>
      <div className="space-y-2">
        {ROLE_CHIPS.map((role) => (
          <label
            key={role}
            className={`flex cursor-pointer items-center gap-3 rounded border px-4 py-3 transition-colors ${
              roleHint === role
                ? 'border-brand/50 bg-brand-soft'
                : 'border-line-strong bg-surface-elevated hover:border-line'
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
              className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-sunken peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:[&_.waitlist-radio-dot]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-sunken"
              aria-hidden
            >
              <span className="waitlist-radio-dot h-1.5 w-1.5 rounded-full bg-brand opacity-0 transition-opacity" />
            </span>
            <span className="font-sans text-[0.9rem] leading-snug text-landing-body">{role}</span>
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

  const titleClass =
    'text-left font-heading text-xl font-semibold leading-snug tracking-tight text-landing-ink md:text-2xl';

  const inputClass =
    'waitlist-email-input w-full min-w-0 flex-1 rounded-none border-0 bg-transparent py-2 px-0 font-sans text-[0.95rem] font-normal text-ink placeholder:text-landing-muted/60 outline-none disabled:opacity-50';

  function Shell({ children }: { children: React.ReactNode }) {
    return <div className="landing-surface-card p-6 md:p-8">{children}</div>;
  }

  const introBlocks = (
    <>
      <p className="mb-0 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Request access
      </p>
      <h2 id="waitlist-heading" className={`mt-3 ${titleClass}`}>
        Request pilot access
      </h2>
      <div className="mt-6 border border-line-strong bg-surface-elevated px-4 py-3">
        <p className="mb-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Priority note
        </p>
        <p className="mb-0 mt-2 font-sans text-[0.85rem] leading-relaxed text-landing-body">
          We prioritize pilots where the facilitator, participant profile, and risk model are
          already defined.
        </p>
      </div>
      <p className="mt-6 font-sans text-[0.95rem] leading-relaxed text-landing-body">
        Leave your role and contact email. We will only reach out when there is a facilitator-led
        pilot or walkthrough that fits your background.
      </p>
    </>
  );

  if (externalUrl) {
    return (
      <section id="waitlist" className="scroll-mt-8 text-left" aria-labelledby="waitlist-heading">
        <Shell>
          {introBlocks}
          <RoleRadios roleHint={roleHint} onChange={setRoleHint} name="waitlist-role-external" />
          <div className="mt-8">
            <a
              href={externalUrl}
              className="focus-ring btn-primary inline-flex min-h-[44px] items-center justify-center px-6 py-2.5 font-heading text-[0.95rem] font-semibold no-underline"
              rel={/^https?:/i.test(externalUrl) ? 'noopener noreferrer' : undefined}
              target={/^https?:/i.test(externalUrl) ? '_blank' : undefined}
            >
              Request pilot access
            </a>
          </div>
        </Shell>
      </section>
    );
  }

  return (
    <section id="waitlist" className="scroll-mt-8 text-left" aria-labelledby="waitlist-heading">
      <Shell>
        {introBlocks}
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
          <div className="mt-8 border border-line-strong bg-surface-elevated p-5 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p
                  id="waitlist-email-heading"
                  className="mb-0 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500"
                >
                  Email
                </p>
                <label
                  id="waitlist-email-label"
                  htmlFor="waitlist-email"
                  className="mt-1 block font-sans text-[0.8rem] text-slate-500"
                >
                  Contact email
                </label>
              </div>
              <div className="min-w-0 border-b border-line-strong pb-1 transition-colors focus-within:border-brand/50">
                <input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className={inputClass}
                  disabled={status === 'loading'}
                  aria-invalid={status === 'error'}
                  aria-labelledby="waitlist-email-heading waitlist-email-label"
                />
              </div>
              <button
                id="waitlist-join-btn"
                type="submit"
                className="focus-ring btn-primary btn-squircle w-full min-h-[44px] justify-center px-6 py-2.5 font-heading text-[0.95rem] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                disabled={status === 'loading' || !configured}
              >
                {status === 'loading' ? 'Sending...' : 'Request pilot access'}
              </button>
            </div>
          </div>
        </form>
        {!configured ? (
          <p
            className="mt-6 font-sans text-fluid-small leading-relaxed text-amber/90"
            role="status"
          >
            Operators: configure Supabase in{' '}
            <code className="rounded bg-navy-dark px-1.5 py-0.5">.env</code> or set{' '}
            <code className="rounded bg-navy-dark px-1.5 py-0.5">VITE_WAITLIST_FORM_URL</code>.
          </p>
        ) : null}
        {feedback ? (
          <p
            className={`mt-4 border px-4 py-3 font-sans text-fluid-small ${
              status === 'error'
                ? 'border-amber/30 bg-amber/[0.07] text-amber'
                : 'border-[#2d4f55] bg-[#0f1724] text-landing-body'
            }`}
            role="status"
            aria-live="polite"
          >
            {feedback}
          </p>
        ) : null}
      </Shell>
    </section>
  );
}
