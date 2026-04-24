import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  HeroWaitlistCounter,
  HowItWorksStep,
  PrimaryCTA,
  Testimonial,
  WaitlistSection,
} from '../components';
import { DEMO_PROPOSAL_ID, isSupabaseConfigured } from '../lib';

function FullBleed({
  alt,
  children,
  className,
  innerClassName,
}: {
  alt: boolean;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={`col-span-12 relative left-1/2 min-w-0 w-[100vw] max-w-[100vw] -translate-x-1/2 ${alt ? 'bg-navy-light' : 'bg-navy'} ${className ?? ''}`}
    >
      <div className={`mx-auto max-w-6xl px-gutter ${innerClassName ?? ''}`}>{children}</div>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="mb-0 flex scroll-mt-24 items-end gap-4">
      <div className="h-12 w-1 shrink-0 rounded-full bg-teal" aria-hidden />
      <h2
        id={id}
        className="mb-0 max-w-[min(100%,40rem)] font-heading text-fluid-h2 font-bold leading-tight text-landing-ink"
      >
        {children}
      </h2>
    </div>
  );
}

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    heading: 'Verify access without exposing identity',
    body: 'SquadRidge confirms that a participant belongs in the room without requiring their name, location, or documents to be exposed inside the conversation surface.',
  },
  {
    number: '02',
    heading: 'Form a small cohort that is ready to work',
    body: 'Participants are matched by role, stakes, region, or shared constraints so the room starts with relevance, balance, and a clearer basis for trust.',
  },
  {
    number: '03',
    heading: 'Leave with an outcome, not just a transcript',
    body: 'When a group reaches consensus, facilitators can publish a public, timestamped proposal that others can cite, review, or build on without revealing participant identities.',
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

function HowItWorksSecurityGhostLink() {
  return (
    <Link
      to="/security"
      className="group inline-flex max-w-full items-center gap-2 rounded-md border border-teal/35 bg-transparent px-3 py-2.5 font-sans text-[0.8125rem] font-medium leading-snug text-teal-light/95 no-underline transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-teal/55 hover:bg-teal/[0.06] hover:text-teal-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/45"
    >
      <span className="min-w-0 border-b border-transparent pb-px text-left transition-[border-color] duration-200 group-hover:border-teal/40">
        See security model
      </span>
    </Link>
  );
}

const TRUST_PILLS = ['Verified entry', 'Small guided cohorts', 'Public citable outputs'] as const;

export function LandingPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="landing-page-root bg-navy">
      <div className="landing-page-inner mx-auto grid w-full min-w-0 max-w-6xl grid-cols-12 gap-x-6">
        <section
          className="landing-hero-section col-span-12 overflow-x-hidden pb-[72px] pt-[132px]"
          aria-labelledby="hero-heading"
        >
          <div className="relative mx-auto max-w-6xl px-gutter">
            <div
              className="pointer-events-none absolute inset-x-0 top-[-3.5rem] z-0 h-[34rem] overflow-hidden"
              aria-hidden
            >
              <div className="landing-hero-aurora landing-hero-aurora-a" />
              <div className="landing-hero-aurora landing-hero-aurora-b" />
              <div className="landing-hero-grid" />
              <div className="landing-hero-orbit landing-hero-orbit-a" />
              <div className="landing-hero-orbit landing-hero-orbit-b" />
            </div>

            <div className="relative z-[1] max-w-[60rem]">
              <div className="relative z-[2] flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
                <p className="mb-0 inline-flex max-w-[min(100%,42rem)] rounded-full border border-white/20 bg-[#0f1624] px-4 py-2.5 font-heading text-[0.8rem] font-semibold leading-snug tracking-[0.02em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:text-[0.82rem]">
                  Pilot-ready for facilitator-led cohorts and investor walkthroughs.
                </p>
                <Link
                  to={`/ledger/${DEMO_PROPOSAL_ID}`}
                  className="inline-flex min-h-[44px] w-fit items-center font-sans text-[0.875rem] font-semibold text-white underline decoration-white/35 underline-offset-[5px] transition-colors hover:text-teal-light hover:decoration-teal-light/70"
                >
                  View sample output
                </Link>
              </div>
              <div className="relative isolate">
                <div
                  className="pointer-events-none absolute right-0 top-1/2 z-[-1] max-w-[100vw] -translate-y-1/2 backdrop-blur-[2px]"
                  aria-hidden
                >
                  <p className="landing-hero-watermark select-none font-heading text-[clamp(8rem,20vw,18rem)] font-black leading-none tracking-[-0.04em]">
                    PEACE
                  </p>
                </div>
                <h1
                  id="hero-heading"
                  className="landing-hero-animate-headline relative z-[1] mt-6 mb-0 max-w-[22ch] font-heading text-display-hero font-extrabold leading-[1.02] tracking-[-0.03em] text-landing-ink"
                >
                  Private, facilitator-led dialogue for groups that cannot safely meet in public.
                </h1>
              </div>

              <p className="landing-hero-animate-sub mt-7 max-w-[58ch] font-sans text-[1.04rem] font-medium leading-[1.75] text-gray-light">
                SquadRidge helps facilitators verify who belongs in the room, form small trusted
                cohorts, and produce citable outcomes without exposing participant identity.
              </p>
              <p className="landing-hero-animate-sub mt-4 max-w-[60ch] font-sans text-body-lg font-normal leading-[1.75] text-landing-body">
                Built for facilitators, peacebuilders, cross-border operators, and partner teams
                running sensitive, high-trust conversations.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <PrimaryCTA
                  id="hero-waitlist-cta"
                  label="Request pilot access"
                  href="#waitlist"
                  variant="hero"
                  shape="squircle"
                  icon={<ChevronRight />}
                  className="landing-hero-animate-cta inline-flex w-fit overflow-hidden"
                />
                <Link
                  to={`/ledger/${DEMO_PROPOSAL_ID}`}
                  className="btn-secondary landing-hero-animate-sub inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-sm font-semibold no-underline"
                >
                  View sample proposal
                </Link>
              </div>
              <div className="landing-hero-animate-sub mt-3">
                <HeroWaitlistCounter />
              </div>

              <div className="landing-hero-animate-sub mt-5 flex flex-wrap gap-3">
                {TRUST_PILLS.map((item) => (
                  <span key={item} className="landing-trust-pill">
                    <span className="landing-trust-pill-dot" aria-hidden />
                    {item}
                  </span>
                ))}
              </div>

              <div className="landing-hero-animate-sub mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
                <Link
                  to="#waitlist"
                  className={twMerge(
                    'landing-surface-card group flex min-h-[44px] flex-col justify-center rounded-lg p-5',
                  )}
                >
                  <span className="font-heading text-sm font-semibold text-landing-ink">
                    Request pilot access
                  </span>
                  <span className="mt-1 font-sans text-[0.85rem] leading-relaxed text-landing-body">
                    Join the shortlist for facilitator-led cohorts, private walkthroughs, and early
                    partner pilots.
                  </span>
                  <span className="mt-3 font-sans text-[0.8rem] font-medium text-teal-light transition-transform duration-300 group-hover:translate-x-1">
                    Request pilot access -&gt;
                  </span>
                </Link>
                <Link
                  to={`/ledger/${DEMO_PROPOSAL_ID}`}
                  className={twMerge(
                    'landing-surface-card group flex min-h-[44px] flex-col justify-center rounded-lg p-5',
                  )}
                >
                  <span className="font-heading text-sm font-semibold text-landing-ink">
                    See the end state
                  </span>
                  <span className="mt-1 font-sans text-[0.85rem] leading-relaxed text-landing-body">
                    Open a sample consensus proposal to see what a successful session can produce
                    outside the room.
                  </span>
                  <span className="mt-3 font-sans text-[0.8rem] font-medium text-teal-light transition-transform duration-300 group-hover:translate-x-1">
                    View sample proposal -&gt;
                  </span>
                </Link>
              </div>

              {configured ? (
                <div className="landing-hero-animate-sub mt-8 max-w-[58ch] space-y-3 font-sans text-[0.98rem] leading-[1.65] text-landing-body">
                  <p className="mb-0">
                    <span className="font-medium text-landing-ink">Live in pilot today:</span>{' '}
                    verification, matching, and session entry are already functional.
                  </p>
                  <p className="mb-0 text-landing-body/95">
                    The product is built for real walkthroughs and facilitator-led pilot cohorts,
                    not just screenshots.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <hr className="sr-section-rule col-span-12" />

        <FullBleed alt className="py-section md:py-section-lg" innerClassName="bg-transparent">
          <Testimonial
            id="quote-heading"
            quote="We reached more clarity in one structured session than we had in months of unstructured calls."
            attribution="Verified participant in a facilitator-led cross-border working session."
            attributionVariant="sentence"
          />
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        <FullBleed alt={false} className="pt-section pb-12 md:pt-section-lg md:pb-16">
          <section
            id="how-it-works"
            aria-labelledby="how-heading"
            className="landing-section-reveal"
          >
            <SectionHeading id="how-heading">How it works</SectionHeading>
            <p className="mt-6 max-w-2xl font-sans font-normal leading-[1.75] text-landing-body sm:mt-8">
              Move from eligibility to action in one structured path.
            </p>
            <ol className="mt-12 grid list-none gap-x-10 gap-y-16 md:mt-16 md:grid-cols-3 md:gap-x-12 md:gap-y-0 lg:gap-x-16">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <HowItWorksStep
                  key={step.number}
                  number={step.number}
                  heading={step.heading}
                  body={step.body}
                  rail={index === 0 ? 'lead' : 'default'}
                  footer={index === 0 ? <HowItWorksSecurityGhostLink /> : undefined}
                />
              ))}
            </ol>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        <FullBleed alt className="py-16 md:py-section">
          <section aria-labelledby="compare-heading" className="landing-section-reveal">
            <SectionHeading id="compare-heading">Why it&apos;s different</SectionHeading>
            <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-10">
              <article className="landing-surface-card rounded-lg p-6">
                <h3 className="font-heading text-fluid-h3 font-semibold text-landing-ink">
                  Why generic tools fail in sensitive dialogue
                </h3>
                <ul className="mt-5 space-y-4 font-sans text-body-lg font-normal leading-[1.65] text-landing-body">
                  <li className="border-l border-gray-600 pl-4">
                    Open channels expose who said what.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Closed channels hide the process and the outcome.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Most collaboration tools optimize for volume, not trust, balance, or decision
                    quality.
                  </li>
                </ul>
              </article>
              <article className="landing-surface-card rounded-lg p-6">
                <h3 className="font-heading text-fluid-h3 font-semibold text-landing-ink">
                  Why SquadRidge works differently
                </h3>
                <ul className="mt-5 space-y-4 font-sans text-body-lg font-normal leading-[1.65] text-landing-body">
                  <li className="border-l border-gray-600 pl-4">
                    Access can be verified without turning identity into the product.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Small facilitator-led cohorts make the room calmer, more balanced, and easier to
                    trust.
                  </li>
                  <li className="border-l border-gray-600 pl-4">
                    Useful outcomes can leave the room as citable public proposals instead of
                    vanishing inside private transcripts.
                  </li>
                </ul>
              </article>
            </div>
            <p className="mt-8 max-w-copy font-sans text-[0.88rem] leading-relaxed text-landing-muted">
              When participants cannot safely attach their names to a conversation, the
              infrastructure has to protect both access and outcome quality.
            </p>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        <FullBleed alt={false} className="py-16 md:py-section">
          <section aria-labelledby="belong-heading" className="landing-section-reveal">
            <SectionHeading id="belong-heading">
              Built for people who cannot afford sloppy infrastructure
            </SectionHeading>
            <div className="mt-8 space-y-8 font-sans leading-[1.7] text-ink-secondary">
              <div className="border-l-2 border-[#1a2236] pl-5">
                <h3 className="mb-2 font-heading text-fluid-h3 font-semibold text-landing-ink">
                  Facilitators and mediators
                </h3>
                <p className="mb-0 text-body-lg text-landing-body">
                  Run higher-trust sessions with clearer access boundaries, better cohort
                  composition, and more usable outcomes.
                </p>
              </div>
              <div className="border-l-2 border-[#1a2236] pl-5">
                <h3 className="mb-2 font-heading text-fluid-h3 font-semibold text-landing-ink">
                  Peacebuilders, veterans, organizers, and cross-border teams
                </h3>
                <p className="mb-0 text-body-lg text-landing-body">
                  Participate in structured dialogue without being forced to trade safety for
                  access.
                </p>
              </div>
              <div className="border-l-2 border-[#1a2236] pl-5">
                <h3 className="mb-2 font-heading text-fluid-h3 font-semibold text-landing-ink">
                  Partners and funders
                </h3>
                <p className="mb-0 text-body-lg text-landing-body">
                  Support processes that are easier to trust, easier to audit, and more credible
                  outside the room.
                </p>
              </div>
            </div>
            <p className="mt-8 max-w-copy font-sans text-[0.88rem] leading-relaxed text-landing-muted">
              A squad is a small matched cohort, usually 4 to 8 participants, working through a
              shared problem with facilitator guidance.
            </p>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        <FullBleed alt className="py-16 md:py-section">
          <section aria-labelledby="security-preview-heading" className="landing-section-reveal">
            <SectionHeading id="security-preview-heading">
              Security and privacy, by design
            </SectionHeading>
            <ul className="mt-8 max-w-copy space-y-4 font-sans text-[0.95rem] font-normal leading-[1.65] text-landing-body">
              <li className="border-l border-gray-600 pl-4">
                Access control without identity exposure in the room
              </li>
              <li className="border-l border-gray-600 pl-4">
                Clear boundaries between session participation and public output
              </li>
              <li className="border-l border-gray-600 pl-4">
                Public artifacts that are citable without revealing private discussion details
              </li>
            </ul>
            <Link
              to="/security"
              className="btn-secondary mt-8 inline-flex min-h-[44px] w-fit items-center justify-center px-5 py-2.5 text-sm font-semibold no-underline"
            >
              Review security model
            </Link>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        <FullBleed alt={false} className="py-16 md:py-section">
          <section aria-labelledby="ledger-heading" className="landing-section-reveal">
            <SectionHeading id="ledger-heading">
              Every strong session can leave a record
            </SectionHeading>
            <p className="mt-6 max-w-copy font-sans font-normal leading-[1.7] text-landing-body">
              Sensitive dialogue should not disappear the moment the meeting ends. When a squad
              reaches consensus, SquadRidge can publish a public, anonymous, timestamped proposal
              that others can cite, review, and build on.
            </p>
            <p className="mt-4 max-w-copy font-sans text-[0.95rem] font-medium leading-relaxed text-landing-muted">
              The goal is not just safer conversation. It is durable, credible output.
            </p>
            <Link
              to={`/ledger/${DEMO_PROPOSAL_ID}`}
              className={twMerge(
                'btn-secondary mt-8 inline-flex min-h-[44px] gap-2 text-sm font-semibold text-teal-light no-underline',
                'border-teal/35 hover:border-teal/50 hover:text-white',
              )}
            >
              Open sample proposal
              <span aria-hidden>-&gt;</span>
            </Link>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        <FullBleed alt className="pt-section-sm pb-section md:pt-14 md:pb-section-lg">
          <div className="mx-auto max-w-copy">
            <WaitlistSection />
          </div>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {!configured && (
          <section className="col-span-12 pb-10 pt-10" aria-labelledby="env-heading">
            <div className="landing-surface-card mx-auto max-w-copy rounded-lg border border-amber/30 bg-navy-light/60 p-6">
              <h2 id="env-heading" className="font-heading text-fluid-h3 font-semibold text-amber">
                Configure Supabase to run the live product
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
                enable anonymous sign-in, and apply the migrations.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
