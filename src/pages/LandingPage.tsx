import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  HeroWaitlistCounter,
  HowItWorksStep,
  PrimaryCTA,
  SectionLabel,
  StepCard,
  Testimonial,
  WaitlistSection,
} from '../components';
import { useDemoWalkthrough } from '../demo';
import { DEMO_PROPOSAL_ID, getLastSquadIdFromStorage, isSupabaseConfigured } from '../lib';

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
      className={`col-span-12 relative left-1/2 min-w-0 w-[100vw] max-w-[100vw] -translate-x-1/2 ${alt ? 'bg-navy-light' : 'bg-navy'} ${className ?? ''}`}
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
    heading: "Match to a squad that's ready to work.",
    body: "You're placed with verified participants across borders, disciplines, and languages — matched for the problem, not the pedigree. Everyone reads in their own language.",
  },
  {
    number: '03',
    heading: 'Work a real problem. Leave a real output.',
    body: "A structured squad room with de-escalation affordances and translation. When the session closes, your squad's proposal can go to a public ledger — citable, anonymous, timestamped. Not a transcript. A document.",
  },
] as const;

function ChevronRight() {
  return (
    <svg
      className="h-8 w-8 shrink-0 opacity-90"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Ghost secondary — dimmed amber / underline glow (no default link chrome). */
function HowItWorksIntentGhostLink() {
  return (
    <Link
      to="/intent"
      className="group inline-flex max-w-full items-center gap-2 rounded-md border border-amber/30 bg-transparent px-3 py-2.5 font-sans text-[0.8125rem] font-medium leading-snug no-underline transition-[color,background-color,border-color,box-shadow,text-shadow] duration-200 [color:rgba(194,130,26,0.88)] visited:[color:rgba(194,130,26,0.82)] hover:border-amber/55 hover:bg-amber/[0.06] hover:[color:#F7C15C] hover:shadow-[0_0_28px_rgba(245,166,35,0.22),inset_0_1px_0_0_rgba(255,255,255,0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber/50"
    >
      <svg
        className="size-4 shrink-0 transition-[color,filter] duration-200 [color:rgba(194,130,26,0.85)] group-hover:[color:#F7C15C] group-hover:drop-shadow-[0_0_10px_rgba(245,166,35,0.45)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      <span className="min-w-0 border-b border-transparent pb-px text-left transition-[border-color,text-shadow] duration-200 group-hover:border-amber/45 group-hover:[text-shadow:0_0_16px_rgba(245,166,35,0.42),0_1px_0_rgba(0,0,0,0.35)]">
        Intent &amp; use-case guidelines
      </span>
    </Link>
  );
}

export function LandingPage() {
  const { startWalkthrough } = useDemoWalkthrough();
  const lastSquad = getLastSquadIdFromStorage();
  const configured = isSupabaseConfigured();

  return (
    <div className="landing-page-root bg-navy">
      <div className="landing-page-inner mx-auto grid w-full min-w-0 max-w-6xl grid-cols-12 gap-x-6">
        {/* Hero */}
        <section
          className="landing-hero-section col-span-12 overflow-x-hidden pb-[60px] pt-[140px]"
          aria-labelledby="hero-heading"
        >
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
                  <span className="text-balance">
                    The world&apos;s hardest conversations need better infrastructure.
                  </span>
                </h1>
              </div>
              <p className="landing-hero-animate-sub mt-8 font-sans text-[1.05rem] font-medium leading-[1.7] text-gray-light md:mt-10">
                In 2026, the conflicts that matter most are stuck — not because solutions don&apos;t
                exist, but because the people who have them can&apos;t speak safely across borders.
              </p>
              <p className="landing-hero-animate-sub mt-4 font-sans text-body-lg font-normal leading-[1.7] text-landing-body">
                SquadRidge is verified, anonymous, structured dialogue. Real problems. Real squads.
                Real outputs — without anyone knowing who you are.
              </p>
              <div className="mt-[1.75rem]">
                <PrimaryCTA
                  id="hero-waitlist-cta"
                  label="Request access"
                  href="#waitlist"
                  variant="hero"
                  shape="squircle"
                  icon={<ChevronRight />}
                  className="landing-hero-animate-cta inline-flex w-fit overflow-hidden"
                />
                <HeroWaitlistCounter />
              </div>
              <div className="landing-hero-animate-sub mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  onClick={() => startWalkthrough()}
                  className="btn-secondary min-h-[44px] justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Start guided tour
                </button>
                <Link
                  to="/onboarding"
                  className="btn-secondary inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-sm font-semibold"
                >
                  Enter onboarding
                </Link>
                <span className="font-sans text-[0.9rem] text-landing-body">
                  or{' '}
                  <Link
                    to="/intent"
                    className="font-medium text-teal-light underline-offset-4 hover:text-teal-light hover:underline"
                  >
                    explore on your own
                  </Link>
                </span>
              </div>
              <p className="landing-hero-animate-sub mt-6 font-sans text-[0.95rem] leading-relaxed text-landing-body">
                <Link
                  to="/security"
                  className="font-medium text-teal-light underline-offset-4 hover:text-teal-light hover:underline"
                >
                  See how we protect anonymity
                </Link>
              </p>
              <div className="landing-hero-animate-sub mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
                <Link
                  to="#waitlist"
                  className={twMerge(
                    'group flex min-h-[44px] flex-col justify-center rounded-lg border border-gray-700/45 bg-navy-light/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-teal/35',
                  )}
                >
                  <span className="font-heading text-sm font-semibold text-landing-ink">
                    Request early access
                  </span>
                  <span className="mt-1 font-sans text-[0.85rem] leading-relaxed text-landing-body">
                    Join the waitlist for the live product.
                  </span>
                  <span className="mt-3 font-sans text-[0.8rem] font-medium text-teal-light group-hover:underline">
                    Go to form →
                  </span>
                </Link>
                <Link
                  to={`/ledger/${DEMO_PROPOSAL_ID}`}
                  className={twMerge(
                    'group flex min-h-[44px] flex-col justify-center rounded-lg border border-gray-700/45 bg-navy-light/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-teal/35',
                  )}
                >
                  <span className="font-heading text-sm font-semibold text-landing-ink">
                    View public ledger (demo)
                  </span>
                  <span className="mt-1 font-sans text-[0.85rem] leading-relaxed text-landing-body">
                    Open a sample proposal record—no account required.
                  </span>
                  <span className="mt-3 font-sans text-[0.8rem] font-medium text-teal-light group-hover:underline">
                    Open demo ledger →
                  </span>
                </Link>
              </div>
              {import.meta.env.DEV ? (
                <p className="landing-hero-animate-sub mt-6 font-sans text-[0.85rem] text-landing-muted">
                  <Link
                    to="/admin/health"
                    className="text-teal-light/90 underline-offset-4 hover:text-teal-light hover:underline"
                  >
                    Supabase health
                  </Link>{' '}
                  (moderator account · local dev)
                </p>
              ) : null}
              {configured ? (
                <p className="landing-hero-animate-sub mt-8 max-w-[52ch] font-sans text-[0.98rem] leading-[1.65] text-landing-body">
                  <span className="font-medium text-landing-ink">Live app:</span>{' '}
                  <Link
                    to="/intent"
                    className="font-semibold text-teal-light underline-offset-4 hover:text-teal-light hover:underline"
                  >
                    Find a squad
                  </Link>{' '}
                  — intent, matchmaking queue, then your room so both perspectives are matched
                  together (not a hand-picked UUID).
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <hr className="sr-section-rule col-span-12" />

        {/* Pull quote — stripe is #0d1117 only; no inner box */}
        <FullBleed alt className="py-20 md:py-[5rem]" innerClassName="bg-transparent">
          <Testimonial
            id="quote-heading"
            quote={
              "We had a breakthrough in 40 minutes that our team couldn't reach in three months of calls."
            }
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
            <p className="mt-6 max-w-2xl font-sans font-normal leading-[1.75] text-landing-body sm:mt-8">
              Three steps — then you&apos;re in the room.
            </p>
            <ol className="mt-12 grid list-none gap-x-10 gap-y-16 md:mt-16 md:grid-cols-3 md:gap-x-12 md:gap-y-0 lg:gap-x-16">
              {HOW_IT_WORKS_STEPS.map((s, i) => (
                <HowItWorksStep
                  key={s.number}
                  number={s.number}
                  heading={s.heading}
                  body={s.body}
                  rail={i === 0 ? 'lead' : 'default'}
                  footer={i === 0 ? <HowItWorksIntentGhostLink /> : undefined}
                />
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
                    The people closest to hard conflicts — activists, veterans, local peacebuilders,
                    cross-border organizers — are the last ones in the room where strategy is made.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Open tools expose who said what. Closed tools serve institutions. Neither fits
                    work that has to stay unattributable.
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
                    Zero-knowledge verification means you prove eligibility without handing over a
                    dossier. Your proof. Your terms.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Structured squads, balanced matchmaking across perspectives, and in-room
                    de-escalation affordances keep the work focused on implementation — not
                    performance.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Every session that reaches consensus generates a citable Proposal on a public
                    ledger. Anonymous. Timestamped. Real.
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
                You&apos;re working on something that matters and you can&apos;t afford to say the
                wrong thing in the wrong room.
              </p>
              <p className="mb-0 border-l-2 border-[#1a2236] pl-5">
                You&apos;re a peacebuilder, cross-border organizer, policy professional, veteran, or
                activist who needs structured, private, implementable strategy — not another group
                chat.
              </p>
              <p className="mb-0 border-l-2 border-[#1a2236] pl-5">
                You believe the next breakthrough on a hard problem will come from people
                who&apos;ve never been in the same room before.
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
              When a squad reaches consensus, their proposal goes to the SquadRidge Ledger — public,
              anonymous, citable, timestamped. The work persists beyond the room.
            </p>
            <Link
              to={`/ledger/${DEMO_PROPOSAL_ID}`}
              className={twMerge(
                'btn-secondary mt-6 inline-flex min-h-[44px] gap-2 text-sm font-semibold text-teal-light',
                'border-teal/35 hover:border-teal/50 hover:text-white',
              )}
            >
              View public ledger (demo)
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
                Add{' '}
                <code className="rounded bg-navy-dark px-1.5 py-0.5 text-gray-light">
                  VITE_SUPABASE_URL
                </code>{' '}
                and{' '}
                <code className="rounded bg-navy-dark px-1.5 py-0.5 text-gray-light">
                  VITE_SUPABASE_PUBLISHABLE_KEY
                </code>{' '}
                to your{' '}
                <code className="rounded bg-navy-dark px-1.5 py-0.5 text-gray-light">.env</code>,
                enable anonymous sign-in, and run migrations (including{' '}
                <code className="rounded bg-navy-dark px-1.5 py-0.5 text-gray-light">
                  waitlist_signup_count
                </code>{' '}
                for the counter).
              </p>
            </div>
          </section>
        )}

        {import.meta.env.DEV ? (
          <>
            <hr className="sr-section-rule col-span-12" />

            {/* Developer sandbox — local dev only; hidden in production builds */}
            <section
              className="col-span-12 pb-12 pt-10 md:pb-16 md:pt-14"
              aria-labelledby="dev-heading"
            >
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
                  <li>Primary path: intent → match → live session</li>
                  <li>Optional: offline browser-only demo, Supabase health (dev)</li>
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <PrimaryCTA
                    label="Find a squad"
                    href="/intent"
                    shape="squircle"
                    className="min-w-0 w-full justify-center sm:min-w-[10rem] sm:w-auto"
                  />
                  <Link
                    to="/settings/profile"
                    className="btn-secondary min-w-0 w-full justify-center sm:min-w-[10rem] sm:w-auto"
                  >
                    Profile settings
                  </Link>
                  {lastSquad && configured ? (
                    <Link
                      to={`/session/${lastSquad}`}
                      className="btn-secondary min-w-0 w-full justify-center sm:min-w-[10rem] sm:w-auto"
                    >
                      Resume last session
                    </Link>
                  ) : null}
                  <Link
                    to="/session"
                    className="btn-secondary min-w-0 w-full justify-center sm:min-w-[10rem] sm:w-auto"
                  >
                    Session hub
                  </Link>
                  <Link
                    to="/session/demo-session-001"
                    className="btn-secondary min-w-0 w-full justify-center border-dashed border-amber/35 text-landing-muted hover:border-amber/50 sm:min-w-[10rem] sm:w-auto"
                  >
                    Offline demo
                  </Link>
                  <Link
                    to="/admin/health"
                    className="btn-secondary min-w-0 w-full justify-center sm:min-w-[10rem] sm:w-auto"
                  >
                    Supabase health (mods)
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
