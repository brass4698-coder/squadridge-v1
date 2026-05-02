import type { FormEvent } from 'react';
import { useWaitlistForm } from '../hooks';
import { InstitutionalPanel, SectionKicker, TrustCallout } from './ui/PlatformPrimitives';

const ROLE_CHIPS = [
  'Mediator / peacebuilder',
  'Facilitator / coach',
  'Program operator',
  'Partner / funder',
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(14rem,100%),1fr))] gap-3">
        {ROLE_CHIPS.map((role) => {
          const active = roleHint === role;
          return (
            <label
              key={role}
              className={`group flex min-h-[60px] min-w-0 cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 transition-colors duration-150 ${
                active
                  ? 'border-brand bg-brand-soft text-ink'
                  : 'border-line bg-surface-elevated hover:border-line-strong'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={role}
                checked={active}
                onChange={() => onChange(role)}
                className="peer sr-only"
              />
              <span
                className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink-faint bg-surface-sunken transition-colors peer-checked:border-brand peer-checked:bg-brand peer-checked:[&_.waitlist-radio-dot]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
                aria-hidden
              >
                <span className="waitlist-radio-dot h-1.5 w-1.5 rounded-full bg-brand-on opacity-0 transition-opacity" />
              </span>
              <span
                className={`min-w-0 whitespace-normal break-words font-sans text-[0.88rem] leading-[1.35] transition-colors ${
                  active ? 'font-medium text-ink' : 'text-ink-secondary group-hover:text-ink'
                }`}
              >
                {role}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function WaitlistSection({ showIntro = true }: { showIntro?: boolean } = {}) {
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
    'text-left font-sans text-[clamp(1.4rem,2.4vw,1.85rem)] font-semibold leading-tight tracking-[-0.02em] text-ink';

  const inputClass =
    'waitlist-email-input w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-2.5 font-sans text-[1rem] font-normal text-ink placeholder:text-ink-subtle outline-none disabled:opacity-50';

  function Shell({ children }: { children: React.ReactNode }) {
    return (
      <InstitutionalPanel tone="sealed" className="rounded-md p-6 md:p-7">
        {children}
      </InstitutionalPanel>
    );
  }

  const introBlocks = (
    <>
      <SectionKicker>Scoped pilot intake</SectionKicker>
      <h2 id="waitlist-heading" className={`mt-3 ${titleClass}`}>
        Tell us what room you need to run.
      </h2>
      <p className="mt-4 max-w-[44rem] font-sans text-[0.98rem] leading-relaxed text-ink-secondary">
        Apply when you have a facilitator-led room where recording would change participant
        behavior, but the work still needs a usable public outcome.
      </p>
      <p className="mt-3 max-w-[44rem] font-sans text-[0.9rem] leading-relaxed text-ink-secondary">
        We review the facilitator profile, participant boundary, risk model, and proposed release
        format before scheduling a walkthrough.
      </p>
      <p className="mt-3 max-w-[44rem] font-sans text-[0.9rem] leading-relaxed text-brand-hover">
        Review timeline: usually within five business days. Most accepted pilots start with 1-3
        squads over 4-6 weeks.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {READINESS_SIGNALS.map((signal) => (
          <div
            key={signal}
            className="rounded-md border border-line bg-surface-elevated px-3.5 py-3 transition-colors duration-150 hover:border-line-strong"
          >
            <p className="mb-0 font-sans text-[0.83rem] leading-relaxed text-ink-secondary">
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
          {showIntro ? (
            introBlocks
          ) : (
            <h2 id="waitlist-heading" className="sr-only">
              Apply for pilot access
            </h2>
          )}
          <RoleRadios roleHint={roleHint} onChange={setRoleHint} name="waitlist-role-external" />
          {showIntro ? (
            <TrustCallout eyebrow="What happens next" className="mt-8">
              We review fit for a high-stakes facilitated room, then schedule a walkthrough or pilot
              design conversation.
            </TrustCallout>
          ) : null}
          <div className="mt-7">
            <a
              href={externalUrl}
              className="focus-ring btn-primary inline-flex min-h-[44px] items-center justify-center px-6 py-2.5 font-sans text-[0.92rem] font-semibold no-underline"
              rel={/^https?:/i.test(externalUrl) ? 'noopener noreferrer' : undefined}
              target={/^https?:/i.test(externalUrl) ? '_blank' : undefined}
            >
              Apply for pilot access
            </a>
          </div>
        </Shell>
      </section>
    );
  }

  return (
    <section id="waitlist" className="scroll-mt-8 text-left" aria-labelledby="waitlist-heading">
      <Shell>
        {showIntro ? (
          introBlocks
        ) : (
          <h2 id="waitlist-heading" className="sr-only">
            Apply for pilot access
          </h2>
        )}
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => void handleSubmit(e)}
          className="mt-0 border-0 bg-transparent p-0 shadow-none"
          aria-label="Apply for pilot access"
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
          <div className="mt-8 rounded-md border border-line bg-surface-elevated p-5 transition-colors focus-within:border-brand/60 sm:p-6">
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
                  className="mt-1 block font-sans text-[0.82rem] leading-relaxed text-ink-faint"
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
                className="focus-ring btn-primary w-full min-h-[44px] justify-center px-6 py-2.5 font-sans text-[0.92rem] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                disabled={status === 'loading' || !configured}
              >
                {status === 'loading' ? 'Sending...' : 'Apply for pilot access'}
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
