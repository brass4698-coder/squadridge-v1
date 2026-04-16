import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { HeroWaitlistCounter } from '../components/HeroWaitlistCounter';
import { WaitlistSection } from '../components/WaitlistSection';
import { HowItWorksStep } from '../components/ui/HowItWorksStep';
import { PrimaryCTA } from '../components/ui/PrimaryCTA';
import { StepCard } from '../components/ui/StepCard';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Testimonial } from '../components/ui/Testimonial';
import { isSupabaseConfigured } from '../lib/env';
import { getLastSquadIdFromStorage } from '../lib/squad';

function FullBleed({
  alt,
  children,
  className,
  innerClassName,
}: {
  alt: boolean;
  children: ReactNode;
  className?: string;
  /** Extra classes on the inner max-width wrapper (e.g. bg-transparent). */
  innerClassName?: string;
}) {
  return (
    <div
      className={`col-span-12 w-screen relative left-1/2 -translate-x-1/2 ${alt ? 'bg-navy-light' : 'bg-navy'} ${className ?? ''}`}
    >
      <div className={`mx-auto max-w-6xl px-md ${innerClassName ?? ''}`}>{children}</div>
    </div>
  );
}

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    heading: 'Verify once. Stay anonymous forever.',
    body: 'A zero-knowledge proof confirms you belong in the room — your name, location, and identity never touch our servers. What you prove is yours to choose.',
  },
  {
    number: '02',
    heading: 'Match to a squad that\'s ready to work.',
    body: 'You\'re placed with verified participants across borders, disciplines, and languages — matched for the problem, not the pedigree. Everyone reads in their own language.',
  },
  {
    number: '03',
    heading: 'Work a real problem. Leave a real output.',
    body: 'Structured rounds, equal floor, automatic de-escalation. When the session closes, your squad\'s proposal goes to a public ledger — citable, anonymous, timestamped. Not a transcript. A document.',
  },
] as const;

function ChevronRight() {
  return (
    <svg className="h-8 w-8 shrink-0 opacity-90" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function LandingPage() {
  const lastSquad = getLastSquadIdFromStorage();
  const configured = isSupabaseConfigured();

  return (
    <div className="landing-page-root bg-navy">
      <div className="landing-page-inner mx-auto grid w-full max-w-6xl grid-cols-12 gap-x-6">
        {/* Hero */}
        <section className="landing-hero-section col-span-12 overflow-x-hidden pb-[60px] pt-[140px]" aria-labelledby="hero-heading">
          <div className="relative mx-auto max-w-6xl px-md">
            <div className="relative z-[1]">
              <div className="relative">
                <p
                  className="landing-hero-watermark pointer-events-none absolute right-0 top-1/2 z-0 max-w-[100vw] -translate-y-1/2 select-none font-heading text-[clamp(8rem,20vw,18rem)] font-black leading-none tracking-[-0.04em] text-white [opacity:0.055]"
                  aria-hidden
                >
                  SAFE
                </p>
                <h1
                  id="hero-heading"
                  className="landing-hero-animate-headline relative z-[1] mb-0 font-heading text-[clamp(3rem,5vw,3.8rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-landing-ink"
                >
                  <span className="text-balance">The world&apos;s hardest conversations need better infrastructure.</span>
                </h1>
              </div>
              <p className="landing-hero-animate-sub mt-8 font-sans text-[1.05rem] font-medium leading-[1.7] text-gray-light md:mt-10">
                In 2026, the conflicts that matter most are stuck — not because solutions don&apos;t exist, but because the
                people who have them can&apos;t speak safely across borders.
              </p>
              <p className="landing-hero-animate-sub mt-4 font-sans text-body-lg font-normal leading-[1.7] text-landing-body">
                SquadRidge is verified, anonymous, structured dialogue. Real problems. Real squads. Real outputs — without
                anyone knowing who you are.
              </p>
              <div className="mt-[1.75rem]">
                <PrimaryCTA
                  id="hero-waitlist-cta"
                  label="Request access"
                  href="#waitlist"
                  variant="hero"
                  icon={<ChevronRight />}
                  className="landing-hero-animate-cta inline-flex w-fit overflow-hidden"
                />
                <HeroWaitlistCounter />
              </div>
            </div>
          </div>
        </section>

        <hr className="sr-section-rule col-span-12" />

        {/* Pull quote — stripe is #0d1117 only; no inner box */}
        <FullBleed alt className="py-20 md:py-[5rem]" innerClassName="bg-transparent">
          <Testimonial
            id="quote-heading"
            quote={"We had a breakthrough in 40 minutes that our team couldn't reach in three months of calls."}
            attribution="ANONYMOUS · VERIFIED PARTICIPANT · CROSS-BORDER SESSION"
          />
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* How it works — tighter bottom gap to Early access on laptop */}
        <FullBleed alt={false} className="pt-20 pb-12 md:pt-24 md:pb-14">
          <section id="how-it-works" aria-labelledby="how-heading">
            <h2
              id="how-heading"
              className="mb-0 font-heading text-[clamp(1.8rem,2.5vw,2rem)] font-bold leading-tight text-landing-ink"
            >
              How it works
            </h2>
            <p className="mt-6 font-sans font-normal leading-[1.7] text-landing-body">
              Three steps — then you&apos;re in the room.
            </p>
            <ol className="mt-12 grid list-none gap-12 md:mt-14 md:grid-cols-3 md:gap-10 lg:gap-12">
              {HOW_IT_WORKS_STEPS.map((s) => (
                <HowItWorksStep key={s.number} number={s.number} heading={s.heading} body={s.body} />
              ))}
            </ol>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* Early access */}
        <FullBleed alt className="pt-12 pb-20 md:pt-14 md:pb-24">
          <div className="mx-auto max-w-copy">
            <WaitlistSection />
          </div>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* Problem / solution */}
        <FullBleed alt={false} className="py-16 md:py-20">
          <section aria-labelledby="compare-heading">
            <h2
              id="compare-heading"
              className="mb-0 flex flex-wrap items-center gap-x-2 gap-y-2 font-heading text-[clamp(1.8rem,2.5vw,2rem)] font-bold leading-tight text-landing-ink"
            >
              <span className="min-w-0">The problem and the</span>{' '}
              <span className="font-semibold text-landing-ink">SquadRidge</span>{' '}
              <span className="min-w-0">way</span>
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-10">
              <article className="rounded-lg border border-gray-700/45 bg-navy-light/15 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <h3 className="font-heading text-sm font-semibold text-landing-ink">The problem</h3>
                <ul className="mt-5 space-y-4 font-sans text-[0.95rem] font-normal leading-[1.65] text-landing-body">
                  <li className="border-l border-gray-600 pl-4">
                    The people closest to hard conflicts — activists, veterans, local peacebuilders, cross-border organizers
                    — are the last ones in the room where strategy is made.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Open tools expose who said what. Closed tools serve institutions. Neither fits work that has to stay
                    unattributable.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Most dialogue platforms produce conversation. SquadRidge produces proposals.
                  </li>
                </ul>
              </article>
              <article className="rounded-lg border border-gray-700/45 bg-navy-light/15 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <h3 className="font-heading text-sm font-semibold text-landing-ink">
                  <span className="font-semibold">SquadRidge</span> way
                </h3>
                <ul className="mt-5 space-y-4 font-sans text-[0.95rem] font-normal leading-[1.65] text-landing-body">
                  <li className="border-l border-gray-600 pl-4">
                    Zero-knowledge verification means you prove eligibility without handing over a dossier. Your proof.
                    Your terms.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Structured squads with equal turns, time-boxed rounds, and automatic de-escalation keep the room
                    focused on implementation — not performance.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Every session that reaches consensus generates a citable Proposal on a public ledger. Anonymous.
                    Timestamped. Real.
                  </li>
                </ul>
              </article>
            </div>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* You belong here */}
        <FullBleed alt className="py-16 md:py-20">
          <section aria-labelledby="belong-heading">
            <h2
              id="belong-heading"
              className="mb-0 font-heading text-[clamp(1.8rem,2.5vw,2rem)] font-bold leading-tight text-landing-ink"
            >
              You belong here if…
            </h2>
            <div className="mt-8 space-y-6 font-sans text-onboarding-body leading-[1.7] text-ink-secondary">
              <p className="mb-0 border-l-2 border-[#1a2236] pl-5">
                You&apos;re working on something that matters and you can&apos;t afford to say the wrong thing in the wrong
                room.
              </p>
              <p className="mb-0 border-l-2 border-[#1a2236] pl-5">
                You&apos;re a peacebuilder, cross-border organizer, policy professional, veteran, or activist who needs
                structured, private, implementable strategy — not another group chat.
              </p>
              <p className="mb-0 border-l-2 border-[#1a2236] pl-5">
                You believe the next breakthrough on a hard problem will come from people who&apos;ve never been in the same
                room before.
              </p>
            </div>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* Ledger */}
        <FullBleed alt={false} className="py-16 md:py-20">
          <section aria-labelledby="ledger-heading">
            <h2
              id="ledger-heading"
              className="mb-0 font-heading text-[clamp(1.8rem,2.5vw,2rem)] font-bold leading-tight text-landing-ink"
            >
              Every session leaves a record.
            </h2>
            <p className="mt-6 max-w-copy font-sans font-normal leading-[1.7] text-landing-body">
              When a squad reaches consensus, their proposal goes to the SquadRidge Ledger — public, anonymous, citable,
              timestamped. The work persists beyond the room.
            </p>
            <Link
              to="/ledger"
              className={twMerge(
                'btn-secondary mt-6 inline-flex min-h-[44px] gap-2 text-sm font-semibold text-teal-light',
                'border-teal/35 hover:border-teal/50 hover:text-white',
              )}
            >
              View the Ledger
              <span aria-hidden>→</span>
            </Link>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {!configured && (
          <section className="col-span-12 pb-10 pt-10" aria-labelledby="env-heading">
              <div className="mx-auto max-w-copy rounded-lg border border-amber/30 bg-navy-light p-6">
                <h2 id="env-heading" className="font-heading text-fluid-h3 font-semibold text-amber">
                  Configure Supabase (development)
                </h2>
                <p className="mt-4 font-sans text-fluid-small leading-relaxed text-landing-body">
                  Add <code className="rounded bg-navy-dark px-1.5 py-0.5 text-gray-light">VITE_SUPABASE_URL</code> and{' '}
                  <code className="rounded bg-navy-dark px-1.5 py-0.5 text-gray-light">VITE_SUPABASE_PUBLISHABLE_KEY</code>{' '}
                  to your <code className="rounded bg-navy-dark px-1.5 py-0.5 text-gray-light">.env</code>, enable anonymous
                  sign-in, and run migrations (including <code className="rounded bg-navy-dark px-1.5 py-0.5 text-gray-light">waitlist_signup_count</code> for the counter).
                </p>
              </div>
            </section>
        )}

        {import.meta.env.DEV ? (
          <>
            <hr className="sr-section-rule col-span-12" />

            {/* Developer sandbox — local dev only; hidden in production builds */}
            <section className="col-span-12 pb-12 pt-10 md:pb-16 md:pt-14" aria-labelledby="dev-heading">
              <StepCard variant="sandbox" as="div">
                <SectionLabel variant="muted" className="block">
                  Dev only · Sandbox
                </SectionLabel>
                <h2
                  id="dev-heading"
                  className="mt-4 font-heading text-section-muted font-semibold text-landing-muted"
                >
                  Explore the product
                </h2>
                <p className="mt-4 font-sans text-fluid-small leading-relaxed text-landing-muted">
                  For development only — not part of the public story above.
                </p>
                <ul className="mt-4 space-y-2 font-sans text-fluid-small text-landing-muted/90">
                  <li>Primary path: onboarding → intent → match → live session</li>
                  <li>Optional: offline browser-only demo, Supabase health (dev)</li>
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <PrimaryCTA label="Find a squad" href="/intent" className="min-w-[10rem] justify-center" />
                  <Link to="/onboarding" className="btn-secondary min-w-[10rem] justify-center">
                    Start onboarding
                  </Link>
                  {lastSquad && configured ? (
                    <Link to={`/session/${lastSquad}`} className="btn-secondary min-w-[10rem] justify-center">
                      Resume last session
                    </Link>
                  ) : null}
                  <Link to="/session" className="btn-secondary min-w-[10rem] justify-center">
                    Session hub
                  </Link>
                  <Link
                    to="/session/demo-session-001"
                    className="btn-secondary min-w-[10rem] justify-center border-dashed border-amber/35 text-landing-muted hover:border-amber/50"
                  >
                    Offline demo
                  </Link>
                  <Link to="/dev/supabase" className="btn-secondary min-w-[10rem] justify-center">
                    Supabase health
                  </Link>
                </div>
              </StepCard>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
