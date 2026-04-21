import type { FormEvent } from 'react';
import { useWaitlistForm } from '../hooks';
import { PrimaryCTA } from './ui/PrimaryCTA';

const ROLE_CHIPS = [
  'Peacebuilder or mediator',
  'Facilitator or coach',
  'Cross-border operator',
  'Partner or funder',
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
      <legend className="mb-3 font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-teal/80">
        Your role
      </legend>
      <div className="space-y-2">
        {ROLE_CHIPS.map((role) => (
          <label
            key={role}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-[border-color,background-color] ${
              roleHint === role
                ? 'border-teal/45 bg-teal/[0.07]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/[0.18]'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={role}
              checked={roleHint === role}
              onChange={() => onChange(role)}
              className="h-4 w-4 shrink-0 accent-teal"
            />
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
    'text-left font-heading text-[clamp(1.8rem,2.5vw,2rem)] font-bold leading-tight text-landing-ink';

  const inputClass =
    'waitlist-email-input w-full min-w-0 flex-1 rounded-none border-0 bg-transparent py-2 px-0 font-sans text-[0.95rem] font-normal text-[#e2e8f0] placeholder:text-landing-muted/60 outline-none disabled:opacity-50';

  function Shell({ children }: { children: React.ReactNode }) {
    return (
      <div className="landing-surface-card rounded-[1.5rem] px-6 py-7 md:px-8 md:py-8">
        {children}
      </div>
    );
  }

  const introBlocks = (
    <>
      <p className="mb-0 font-heading text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
        Pilot access
      </p>
      <h2 id="waitlist-heading" className={`mt-3 ${titleClass}`}>
        Join the shortlist for live cohorts and private walkthroughs
      </h2>
      <div className="mt-5 max-w-copy rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 font-sans text-[0.82rem] leading-relaxed text-landing-muted">
        <p className="mb-0 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-teal/75">
          Priority note
        </p>
        <p className="mb-0 mt-2 text-landing-body">
          We prioritize pilots where the facilitator, participant profile, and risk model are
          already defined.
        </p>
      </div>
      <p className="mt-6 max-w-copy font-sans font-normal leading-[1.7] text-landing-body">
        Leave your email and role, and we&apos;ll only reach out when there is a facilitator-led
        pilot, verified cohort, or walkthrough that matches your background.
      </p>
    </>
  );

  if (externalUrl) {
    return (
      <section id="waitlist" className="scroll-mt-8 text-left" aria-labelledby="waitlist-heading">
        <Shell>
          {introBlocks}
          <RoleRadios roleHint={roleHint} onChange={setRoleHint} name="waitlist-role-external" />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PrimaryCTA
              label="Request pilot access"
              href={externalUrl}
              size="md"
              shape="squircle"
            />
          </div>
          <p className="mt-3 font-sans text-[0.8rem] leading-relaxed text-landing-muted">
            We&apos;ll only contact you for relevant pilots or walkthroughs.
          </p>
          <p className="mt-4 font-sans text-[0.82rem] leading-relaxed text-landing-muted">
            No public profile. No open directory. Just a way to contact you when the right pilot is
            ready.
          </p>
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
          aria-label="Join waitlist"
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
          <div className="mt-8 rounded-[1.15rem] border border-white/10 bg-[#0d1420]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex flex-col gap-2">
              <div>
                <p
                  id="waitlist-email-heading"
                  className="mb-0 font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-teal/80"
                >
                  Email
                </p>
                <label
                  id="waitlist-email-label"
                  htmlFor="waitlist-email"
                  className="mt-1 block font-sans text-[0.8rem] text-landing-muted"
                >
                  Work or preferred contact email
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 border-b border-[#2d3748] pb-1 transition-colors focus-within:border-teal/60">
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
                <PrimaryCTA
                  id="waitlist-join-btn"
                  label={status === 'loading' ? 'Sending...' : 'Request pilot access'}
                  type="submit"
                  size="md"
                  shape="squircle"
                  className="shrink-0 px-8"
                  disabled={status === 'loading' || !configured}
                />
              </div>
              <p className="mb-0 mt-3 font-sans text-[0.8rem] leading-relaxed text-landing-muted">
                We&apos;ll only contact you for relevant pilots or walkthroughs.
              </p>
              <p className="mb-0 mt-2 font-sans text-[0.8rem] leading-relaxed text-landing-muted">
                No public profile. No open directory. Just a way to contact you when the right pilot
                is ready.
              </p>
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
            className={`mt-4 rounded-xl border px-4 py-3 font-sans text-fluid-small ${
              status === 'error'
                ? 'border-amber/30 bg-amber/[0.07] text-amber'
                : 'border-teal/20 bg-teal/[0.06] text-landing-body'
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
