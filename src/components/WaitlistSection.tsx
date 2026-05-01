import type { FormEvent } from 'react';
import { useWaitlistForm } from '../hooks';
import { InstitutionalPanel, SectionKicker, TrustCallout } from './ui/PlatformPrimitives';

const ROLE_CHIPS = [
  'Mediator/peacebuilder',
  'Facilitator/coach',
  'Program operator',
  'Partner/funder',
  'Other',
] as const;

const READINESS_SIGNALS = [
  'A defined facilitator or convening team',
  'A bounded participant group or eligibility model',
  'A sensitive room where recording would change behavior',
  'A need for a durable outcome funders or partners can cite',
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
      <legend className="mb-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        Operator role
      </legend>
      {/* 2-column grid on sm+ halves the vertical real estate. The 5th option
          (Other) sits alone in the final row, which is acceptable and reads as
          a deliberate "none of the above" affordance. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ROLE_CHIPS.map((role) => (
          <label
            key={role}
            className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded border px-3.5 py-2.5 transition-colors ${
              roleHint === role
                ? 'border-brand bg-brand-soft'
                : 'border-line bg-surface-elevated hover:border-line-strong'
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
              className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink-faint bg-surface-sunken peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:[&_.waitlist-radio-dot]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
              aria-hidden
            >
              <span className="waitlist-radio-dot h-1.5 w-1.5 rounded-full bg-brand opacity-0 transition-opacity" />
            </span>
            <span className="font-sans text-[0.88rem] leading-snug text-ink-secondary">{role}</span>
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
    'text-left font-display text-[clamp(1.65rem,3vw,2.35rem)] font-semibold leading-tight tracking-[-0.03em] text-ink';

  const inputClass =
    'waitlist-email-input w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-2 font-sans text-[0.95rem] font-normal text-ink placeholder:text-ink-subtle outline-none disabled:opacity-50';

  function Shell({ children }: { children: React.ReactNode }) {
    return (
      <InstitutionalPanel tone="sealed" className="p-6 md:p-8">
        {children}
      </InstitutionalPanel>
    );
  }

  const introBlocks = (
    <>
      <SectionKicker>Apply for pilot access</SectionKicker>
      <h2 id="waitlist-heading" className={`mt-3 ${titleClass}`}>
        Serious rooms need serious intake.
      </h2>
      <p className="mt-4 max-w-[44rem] font-sans text-[0.98rem] leading-relaxed text-ink-secondary">
        This is not a generic waitlist. Tell us who you are in the operating model and where to
        reach you. We prioritize facilitator-led pilots with a clear room, release boundary, and
        public-interest outcome.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {READINESS_SIGNALS.map((signal) => (
          <div key={signal} className="border border-line bg-surface-elevated px-3 py-2.5">
            <p className="mb-0 font-sans text-[0.82rem] leading-relaxed text-ink-secondary">
              {signal}
            </p>
          </div>
        ))}
      </div>
    </>
  );

  if (externalUrl) {
    return (
      <section id="waitlist" className="scroll-mt-8 text-left" aria-labelledby="waitlist-heading">
        <Shell>
          {introBlocks}
          <RoleRadios roleHint={roleHint} onChange={setRoleHint} name="waitlist-role-external" />
          <TrustCallout eyebrow="What happens next" className="mt-8">
            We review fit for a high-stakes facilitated room, then schedule a walkthrough or pilot
            design conversation.
          </TrustCallout>
          <div className="mt-6">
            <a
              href={externalUrl}
              className="focus-ring btn-primary inline-flex min-h-[44px] items-center justify-center px-6 py-2.5 font-heading text-[0.95rem] font-semibold no-underline"
              rel={/^https?:/i.test(externalUrl) ? 'noopener noreferrer' : undefined}
              target={/^https?:/i.test(externalUrl) ? '_blank' : undefined}
            >
              Apply for a pilot
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
          <div className="mt-8 border border-line bg-surface-elevated p-5 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p
                  id="waitlist-email-heading"
                  className="mb-0 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-faint"
                >
                  Email
                </p>
                <label
                  id="waitlist-email-label"
                  htmlFor="waitlist-email"
                  className="mt-1 block font-sans text-[0.8rem] text-ink-faint"
                >
                  Contact email
                </label>
              </div>
              <div className="min-w-0 border-b border-line-strong pb-1 transition-colors focus-within:border-brand">
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
                className="focus-ring btn-primary w-full min-h-[44px] justify-center px-6 py-2.5 font-heading text-[0.95rem] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                disabled={status === 'loading' || !configured}
              >
                {status === 'loading' ? 'Sending...' : 'Apply for a pilot'}
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
                ? 'border-sem-warning bg-sem-warning-soft text-sem-warning'
                : 'border-brand bg-brand-soft text-ink-secondary'
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
