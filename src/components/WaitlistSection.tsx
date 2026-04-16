import type { FormEvent } from 'react';
import { useWaitlistForm } from '../hooks/useWaitlistForm';
import { PrimaryCTA } from './ui/PrimaryCTA';

export function WaitlistSection() {
  const { email, setEmail, status, feedback, handleSubmit, waitlistCount, configured, externalUrl } = useWaitlistForm();

  const titleClass =
    'text-left font-heading text-[clamp(1.8rem,2.5vw,2rem)] font-bold leading-tight text-landing-ink';

  const inputClass =
    'waitlist-email-input w-full min-w-0 max-w-md flex-1 rounded-none border-0 border-b border-[#2d3748] bg-transparent py-2 px-0 font-sans text-[0.95rem] font-normal text-[#e2e8f0] placeholder:text-landing-muted/70 outline-none transition-colors focus:border-gray-500 disabled:opacity-50';

  function CounterLine() {
    if (!configured || waitlistCount === null) return null;
    if (waitlistCount === 0) {
      return (
        <p className="mt-4 font-sans text-sm text-landing-muted">
          You&apos;re early — be among the first on the list.
        </p>
      );
    }
    const label =
      waitlistCount === 1
        ? '1 person on the waitlist'
        : `${waitlistCount.toLocaleString()} people on the waitlist`;
    return (
      <p className="mt-4 font-sans text-sm tabular-nums text-landing-muted">
        {label}
        <span className="text-landing-muted/80"> — and growing.</span>
      </p>
    );
  }

  if (externalUrl) {
    return (
      <section id="waitlist" className="scroll-mt-8 text-left" aria-labelledby="waitlist-heading">
        <h2 id="waitlist-heading" className={titleClass}>
          Early access
        </h2>
        <p className="mt-3 font-sans text-[0.95rem] italic leading-snug text-landing-muted">
          No account. No name. Just a seat in the room.
        </p>
        <p className="mt-6 font-sans font-normal leading-[1.7] text-landing-body">
          Leave your email — we&apos;ll only write when there&apos;s a verified squad forming around a problem that matches
          your background.
        </p>
        <div className="mt-8">
          <PrimaryCTA label="Request access" href={externalUrl} size="md" />
        </div>
        <CounterLine />
      </section>
    );
  }

  return (
    <section id="waitlist" className="scroll-mt-8 text-left" aria-labelledby="waitlist-heading">
      <h2 id="waitlist-heading" className={titleClass}>
        Early access
      </h2>
      <p className="mt-3 font-sans text-[0.95rem] italic leading-snug text-landing-muted">
        No account. No name. Just a seat in the room.
      </p>
      <p className="mt-6 font-sans font-normal leading-[1.7] text-landing-body">
        Leave your email — we&apos;ll only write when there&apos;s a verified squad forming around a problem that matches
        your background.
      </p>
      <form
        onSubmit={(e: FormEvent<HTMLFormElement>) => void handleSubmit(e)}
        className="mt-8 border-0 bg-transparent p-0 shadow-none"
        aria-label="Join waitlist"
      >
        {/* Honeypot: leave empty; bots often fill "website" */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
          defaultValue=""
        />
        <div className="flex flex-col gap-6 border-0 bg-transparent sm:flex-row sm:items-end">
          <label htmlFor="waitlist-email" className="sr-only">
            Email for waitlist
          </label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            disabled={status === 'loading'}
            aria-invalid={status === 'error'}
          />
          <PrimaryCTA
            id="waitlist-join-btn"
            label={status === 'loading' ? 'Sending…' : 'Request access'}
            type="submit"
            size="md"
            className="!rounded-[8px] shrink-0 px-8"
            disabled={status === 'loading' || !configured}
          />
        </div>
      </form>
      <CounterLine />
      {!configured ? (
        <p className="mt-6 font-sans text-fluid-small leading-relaxed text-amber/90" role="status">
          Operators: configure Supabase in <code className="rounded bg-navy-dark px-1.5 py-0.5">.env</code> or set{' '}
          <code className="rounded bg-navy-dark px-1.5 py-0.5">VITE_WAITLIST_FORM_URL</code>.
        </p>
      ) : null}
      {feedback ? (
        <p
          className={`mt-4 font-sans text-fluid-small ${status === 'error' ? 'text-amber' : 'text-landing-body'}`}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
