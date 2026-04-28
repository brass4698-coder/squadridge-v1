import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HowItWorksStep, WaitlistSection } from '../components';
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

/** Institutional section title — left rule, no decorative pillars */
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 border-l-2 border-teal pl-4 font-heading text-xl font-semibold leading-snug tracking-tight text-landing-ink md:text-2xl"
    >
      {children}
    </h2>
  );
}

const OPERATIONAL_STEPS = [
  'Verify eligibility',
  'Form the cohort',
  'Run the session',
  'Publish the public record',
] as const;

type ProofCard =
  | { title: string; body: string }
  | { title: string; body: string; href: '/security'; linkLabel: string };

const PROOF_CARDS: readonly ProofCard[] = [
  {
    title: 'Facilitator-led',
    body: 'Every active room is structured, bounded, and moderated against a defined pilot model.',
  },
  {
    title: 'Security disclosure',
    body: 'Trust assumptions, privacy boundaries, and system guarantees are documented openly.',
    href: '/security',
    linkLabel: 'Read disclosure',
  },
  {
    title: 'Public artifact',
    body: 'When enabled, a session can produce a citable public outcome instead of disappearing into a private transcript.',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    heading: 'Detect and scope tension',
    body: 'Pilot-scoped signals and facilitator context help determine when a bounded intervention is warranted. Metrics remain governed artifacts, not public feeds.',
  },
  {
    number: '02',
    heading: 'Convene a verified room',
    body: 'Eligible participants enter a small facilitator-led cohort with explicit room rules, clear access boundaries, and a defined intervention scope.',
  },
  {
    number: '03',
    heading: 'Produce a usable outcome',
    body: 'Outcomes are evaluated against pre-registered measures and, where enabled, released as citable public records instead of buried in private notes.',
  },
] as const;

function LandingPublicRecordPreview() {
  return (
    <div className="rounded-lg border border-[#2a3548] bg-[#0b101c] p-5 font-sans sm:p-6">
      <p className="mb-0 font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-slate-500">
        Public outcome record
      </p>
      <p className="mt-2 font-mono text-[0.65rem] font-medium uppercase tracking-[0.1em] text-amber/90">
        Published
      </p>
      <p className="mt-3 font-mono text-[0.75rem] leading-snug text-slate-400">
        Proposal · Demo · <time dateTime="2025-04-01">2025-04-01</time>
      </p>
      <h3 className="mt-3 font-heading text-[1.05rem] font-semibold leading-snug text-landing-ink">
        Sample consensus proposal
      </h3>
      <p className="mt-3 text-[0.85rem] leading-relaxed text-landing-body">
        A public, timestamped outcome—not a transcript.
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {['consensus', 'pilot', 'facilitator-led'].map((t) => (
          <span
            key={t}
            className="rounded border border-[#2d3f55] bg-[#070b12] px-2 py-0.5 font-mono text-[0.62rem] text-slate-500"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-0 bg-navy text-left">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-12 gap-x-6">
        {/* 1. Hero */}
        <section
          className="col-span-12 border-b border-white/[0.06] px-gutter pb-16 pt-[7.5rem] md:pb-20 md:pt-28"
          aria-labelledby="hero-heading"
        >
          <p className="mb-4 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Pilot-by-pilot · facilitator-led · evidence-aware
          </p>
          <h1
            id="hero-heading"
            className="max-w-[40rem] font-heading text-[clamp(1.85rem,4vw,2.65rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-landing-ink"
          >
            Structured intervention before conflict escalates.
          </h1>
          <p className="mt-6 max-w-[42rem] font-sans text-[1rem] leading-[1.65] text-landing-body">
            SquadRidge helps facilitators run verified small-group dialogue pilots and publish
            trusted public outcomes without exposing room-level discussion, attribution, or
            identity.
          </p>
          <p className="mt-4 max-w-[40rem] font-sans text-[0.95rem] leading-[1.65] text-slate-400">
            Built for high-trust cohorts where access control, process discipline, and outcome
            credibility matter more than scale.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              id="hero-waitlist-cta"
              href="#waitlist"
              className="focus-ring btn-primary inline-flex min-h-[44px] items-center justify-center px-6 py-2.5 font-heading text-[0.95rem] font-semibold no-underline"
            >
              Request pilot access
            </a>
            <Link
              to={`/ledger/${DEMO_PROPOSAL_ID}`}
              className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded border border-[#3d4f63] bg-transparent px-5 py-2.5 font-heading text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              View sample public record
            </Link>
          </div>
          <p className="mt-10 max-w-[48rem] border-t border-white/[0.06] pt-6 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-slate-500">
            Verified access <span className="text-slate-600">|</span> Facilitator-led rooms{' '}
            <span className="text-slate-600">|</span> Bounded confidentiality{' '}
            <span className="text-slate-600">|</span> Citable outcomes
          </p>
        </section>

        <hr className="sr-section-rule col-span-12" />

        {/* 2. Operational path */}
        <FullBleed alt className="py-14 md:py-20" innerClassName="bg-transparent">
          <section id="operational-path" aria-labelledby="operational-heading">
            <SectionHeading id="operational-heading">
              Move from eligibility to public outcome through one controlled path.
            </SectionHeading>

            <div className="mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-3">
              {OPERATIONAL_STEPS.map((label, i) => (
                <Fragment key={label}>
                  {i > 0 ? (
                    <span className="hidden font-mono text-slate-600 md:inline" aria-hidden>
                      →
                    </span>
                  ) : null}
                  <span className="rounded border border-[#2d3f55] bg-[#0c121c] px-3 py-2 font-mono text-[0.75rem] font-medium text-slate-300">
                    {label}
                  </span>
                </Fragment>
              ))}
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
              {PROOF_CARDS.map((card) => (
                <div key={card.title} className="border border-[#1e293b] bg-[#080d14] p-5 md:p-6">
                  <h3 className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {card.title}
                  </h3>
                  <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-landing-body">
                    {card.body}
                  </p>
                  {'href' in card ? (
                    <Link
                      to={card.href}
                      className="mt-4 inline-block font-mono text-[0.75rem] font-medium text-teal-light/90 underline-offset-4 hover:underline"
                    >
                      {card.linkLabel}
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* 3. How it works */}
        <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
          <section id="how-it-works" aria-labelledby="how-heading">
            <SectionHeading id="how-heading">How it works</SectionHeading>
            <ol className="mt-10 grid list-none gap-x-10 gap-y-14 md:mt-12 md:grid-cols-3 md:items-stretch md:gap-x-12 md:gap-y-0 lg:gap-x-14">
              {HOW_IT_WORKS_STEPS.map((step) => (
                <HowItWorksStep
                  key={step.number}
                  number={step.number}
                  heading={step.heading}
                  body={step.body}
                  rail="default"
                />
              ))}
            </ol>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* 4. Why standard tools */}
        <FullBleed alt className="py-14 md:py-20" innerClassName="bg-transparent">
          <section aria-labelledby="compare-heading">
            <SectionHeading id="compare-heading">Why standard tools break down</SectionHeading>
            <div className="mt-10 grid gap-8 border border-[#1e293b] md:grid-cols-2 md:gap-0">
              <div className="border-b border-[#1e293b] p-6 md:border-b-0 md:border-r md:p-8">
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Standard tools
                </p>
                <ul className="mt-5 space-y-4 font-sans text-[0.92rem] leading-relaxed text-slate-400">
                  <li className="border-l border-slate-700 pl-4">
                    Open channels expose who said what.
                  </li>
                  <li className="border-l border-slate-700 pl-4">
                    Closed channels hide the process and often erase the outcome.
                  </li>
                  <li className="border-l border-slate-700 pl-4">
                    Most collaboration tools optimize for message volume, not trust, balance, or
                    decision quality.
                  </li>
                </ul>
              </div>
              <div className="bg-[#0a121f] p-6 md:p-8">
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-teal/80">
                  SquadRidge
                </p>
                <ul className="mt-5 space-y-4 font-sans text-[0.92rem] leading-relaxed text-landing-body">
                  <li className="border-l border-teal/40 pl-4">
                    Access can be verified without making identity the product.
                  </li>
                  <li className="border-l border-teal/40 pl-4">
                    Small facilitator-led cohorts reduce noise and create better intervention
                    conditions.
                  </li>
                  <li className="border-l border-teal/40 pl-4">
                    Useful outcomes can leave the room as public records without exposing the room
                    itself.
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-8 max-w-copy font-sans text-[0.88rem] leading-relaxed text-slate-500">
              When participants cannot safely attach their names to the discussion, the
              infrastructure has to protect both access and outcome quality.
            </p>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* 5. Audiences */}
        <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
          <section aria-labelledby="audiences-heading">
            <SectionHeading id="audiences-heading">Audiences</SectionHeading>
            <div className="mt-10 grid gap-6 md:gap-8">
              <article className="border border-[#1e293b] bg-[#080d14] p-6 md:p-7">
                <h3 className="font-heading text-lg font-semibold text-landing-ink">
                  Facilitators and mediators
                </h3>
                <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-landing-body">
                  Run structured sessions with clearer access boundaries, stronger cohort
                  composition, and outcomes others can actually use.
                </p>
              </article>
              <article className="border border-[#1e293b] bg-[#080d14] p-6 md:p-7">
                <h3 className="font-heading text-lg font-semibold text-landing-ink">
                  Veterans, organizers, and cross-border participants
                </h3>
                <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-landing-body">
                  Join sensitive dialogue without being forced to trade personal safety for
                  participation.
                </p>
              </article>
              <article className="border border-[#1e293b] bg-[#080d14] p-6 md:p-7">
                <h3 className="font-heading text-lg font-semibold text-landing-ink">
                  Partners and funders
                </h3>
                <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-landing-body">
                  Support interventions that are easier to audit, easier to evaluate, and more
                  credible outside the room.
                </p>
              </article>
            </div>
            <p className="mt-8 max-w-copy border-l-2 border-[#2d3f55] pl-4 font-sans text-[0.88rem] leading-relaxed text-slate-500">
              <span className="font-medium text-slate-400">Squad definition:</span> A squad is a
              small matched cohort, usually 4 to 8 participants, working through a shared problem
              with facilitator guidance.
            </p>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* 6. Security and privacy */}
        <FullBleed alt className="py-14 md:py-20" innerClassName="bg-transparent">
          <section aria-labelledby="security-heading">
            <SectionHeading id="security-heading">Security and privacy</SectionHeading>
            <ul className="mt-8 max-w-copy space-y-5 font-sans text-[0.95rem] leading-relaxed text-landing-body">
              <li className="border-l border-slate-600 pl-4">
                Eligibility and access controls can be enforced without exposing identity inside the
                room.
              </li>
              <li className="border-l border-slate-600 pl-4">
                Session participation and public release are separated by explicit disclosure
                boundaries.
              </li>
              <li className="border-l border-slate-600 pl-4">
                Public artifacts can be cited without revealing private discussion, attribution, or
                participant identity.
              </li>
            </ul>
            <p className="mt-8 max-w-copy border-l-2 border-teal/35 pl-4 font-sans text-[0.88rem] leading-relaxed text-slate-400">
              This is not privacy as branding. It is privacy as a structural constraint on what the
              system is allowed to reveal.
            </p>
            <Link
              to="/security"
              className="focus-ring mt-8 inline-flex min-h-[44px] items-center border border-[#3d4f63] bg-transparent px-5 py-2.5 font-heading text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              Review security model
            </Link>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* 7. Durable public record */}
        <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
          <section aria-labelledby="record-heading">
            <SectionHeading id="record-heading">
              A strong session can leave a durable public record
            </SectionHeading>
            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start lg:gap-12">
              <div className="min-w-0 space-y-4">
                <p className="max-w-copy font-sans text-[0.98rem] leading-[1.7] text-landing-body">
                  Sensitive dialogue should not disappear when the meeting ends. When a cohort
                  reaches an outcome approved for release, SquadRidge can publish a public,
                  anonymous, timestamped record others can cite, review, and build from.
                </p>
                <p className="max-w-copy font-sans text-[0.9rem] leading-relaxed text-slate-500">
                  The goal is not only safer conversation. It is durable, credible output.
                </p>
              </div>
              <div className="flex min-w-0 flex-col gap-4">
                <LandingPublicRecordPreview />
                <Link
                  to={`/ledger/${DEMO_PROPOSAL_ID}`}
                  className="focus-ring inline-flex min-h-[44px] w-full items-center justify-center border border-[#3d4f63] bg-[#0c121c] px-5 py-2.5 font-heading text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-[#101a28] lg:w-auto"
                >
                  Open sample public record
                </Link>
              </div>
            </div>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* 8. Pilot access */}
        <FullBleed alt className="py-14 md:pb-20" innerClassName="bg-transparent">
          <div className="mx-auto max-w-copy">
            <WaitlistSection />
          </div>
        </FullBleed>

        {!configured ? (
          <>
            <hr className="sr-section-rule col-span-12" />
            <section className="col-span-12 px-gutter pb-12 pt-8" aria-labelledby="env-heading">
              <div className="mx-auto max-w-copy border border-amber/25 bg-navy-light/40 p-6">
                <h2 id="env-heading" className="font-heading text-lg font-semibold text-amber">
                  Configure Supabase to run the live product
                </h2>
                <p className="mt-4 font-sans text-sm leading-relaxed text-landing-body">
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
          </>
        ) : null}
      </div>
    </div>
  );
}
