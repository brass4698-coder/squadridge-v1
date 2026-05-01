import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  BoundaryCard,
  HowItWorksStep,
  InstitutionalPanel,
  PlatformSection,
  ProcessRail,
  SectionKicker,
  TrustCallout,
  WaitlistSection,
} from '../components';
import { DEMO_PROPOSAL_ID, isSupabaseConfigured } from '../lib';

/* ----------------------------------------------------------------------------
 * Layout primitives
 * --------------------------------------------------------------------------*/

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

function SectionHeading({
  id,
  eyebrow,
  children,
}: {
  id: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="mb-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="scroll-mt-24 border-l-2 border-brand pl-4 font-display text-[clamp(1.55rem,2.4vw,2.25rem)] font-semibold leading-tight tracking-[-0.025em] text-ink"
      >
        {children}
      </h2>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Content
 * --------------------------------------------------------------------------*/

const HERO_RAIL = [
  { number: '01', label: 'Verify', detail: 'Eligibility checked before anyone joins.' },
  { number: '02', label: 'Cohort', detail: 'A small, purpose-built squad is formed.' },
  { number: '03', label: 'Room', detail: 'Facilitator-led. Private. Not recorded.' },
  { number: '04', label: 'Outcome', detail: 'Anonymous, timestamped, citable record.' },
] as const;

const FLOW_STEPS = [
  {
    n: '01',
    title: 'Verify eligibility',
    body: 'You and the participants are verified before access. Identity stays out of the room itself.',
  },
  {
    n: '02',
    title: 'Form the squad',
    body: 'A small, purpose-built cohort joins under the boundaries you set. Usually 4–8 people.',
  },
  {
    n: '03',
    title: 'Run the room',
    body: 'You facilitate the session under bounded confidentiality. The room is private and never recorded.',
  },
  {
    n: '04',
    title: 'Publish the outcome',
    body: 'Approved results go out as an anonymous, timestamped public record. Citable. Auditable. Never the room.',
  },
] as const;

const PROCESS_RAIL_STEPS = FLOW_STEPS.map((step) => ({
  label: step.title.split(' ')[0] ?? step.title,
  title: step.title,
  body: step.body,
}));

const BOUNDARY_POINTS = [
  {
    label: 'Sealed room',
    title: 'Temporary, private, facilitator-led',
    body: 'Identity is verified before access, then separated from in-room exposure. The room is not recorded and does not become the durable artifact.',
  },
  {
    label: 'Public record',
    title: 'Approved, anonymous, timestamped',
    body: 'Only the release-scoped outcome leaves. It is structured for citation, review, and institutional memory without exposing the conversation that produced it.',
  },
] as const;

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    heading: 'Set the boundaries',
    body: 'You decide the scope, who can be in the room, and what is allowed to leave it. Built-in access rules carry those decisions through the rest of the flow.',
  },
  {
    number: '02',
    heading: 'Convene the right room',
    body: 'Verified participants join a small facilitator-led session. The quality of the session is protected by structure, not by hoping people behave well in an open channel.',
  },
  {
    number: '03',
    heading: 'Publish a usable outcome',
    body: 'When a result is cleared for release, SquadRidge publishes an anonymous, timestamped public record. Others can cite it without ever seeing inside the room.',
  },
] as const;

type ComparisonCell = { headline: string; detail: string };

const COMPARISON_ROWS: ReadonlyArray<{
  axis: string;
  standard: ComparisonCell;
  squadridge: ComparisonCell;
}> = [
  {
    axis: 'Identity and exposure',
    standard: {
      headline: 'Identity is the access lever.',
      detail: 'To prove you belong, you have to show who you are.',
    },
    squadridge: {
      headline: 'Identity is separate from access.',
      detail: 'Verified access does not require identifying yourself in-room.',
    },
  },
  {
    axis: 'Outcome and retention',
    standard: {
      headline: 'The conversation is the only artifact.',
      detail: 'To cite anything, someone has to expose part of the room.',
    },
    squadridge: {
      headline: 'Room and citation are separate artifacts.',
      detail: 'The public record exists without the room ever leaking.',
    },
  },
  {
    axis: 'Session quality',
    standard: {
      headline: 'Built for speed and reach.',
      detail: 'Optimized for the opposite of a hard conversation.',
    },
    squadridge: {
      headline: 'Built for intervention work.',
      detail: 'Small cohorts, structured rounds, explicit release rules.',
    },
  },
  {
    axis: 'Access rules',
    standard: {
      headline: 'Rules live in policy documents.',
      detail: 'A signup checklist, then everyone shares one room.',
    },
    squadridge: {
      headline: 'Rules live in the tool itself.',
      detail: 'Bound to verification, cohort, and release scope.',
    },
  },
];

const AUDIENCES = [
  {
    title: 'Facilitators and mediators',
    primary: true,
    benefit:
      'Run sensitive sessions with cleaner cohorts and outcomes other people can actually use.',
    example:
      'Example: a workplace harm report where leadership needs an outcome, witnesses need protection, and a transcript would re-traumatize the room.',
  },
  {
    title: 'Veteran, cross-border, and community organizers',
    primary: false,
    benefit:
      'Hold dialogue in contexts where attribution itself is a risk to the people in the room.',
    example:
      'Example: a unit-level processing circle where speaking openly carries career or security cost outside the room.',
  },
  {
    title: 'Partners, funders, and institutions',
    primary: false,
    benefit:
      'Fund and audit programs that produce credible, evaluable outputs without exposing participants.',
    example:
      'Example: a funded reconciliation program where the funder needs proof of work and the participants cannot be named.',
  },
] as const;

const SECURITY_POINTS = [
  {
    label: 'Identity',
    body: 'Eligibility is checked once. Identity is not the access lever inside the room — people do not have to expose themselves to belong.',
  },
  {
    label: 'Confidentiality',
    body: 'What can leave the room is decided before the room opens, not negotiated in the moment by tired participants.',
  },
  {
    label: 'Public record',
    body: 'A separate artifact from the room. A leaked snippet does not produce a citable result — only an approved release does.',
  },
] as const;

const PILOT_BENEFITS = [
  'Private walkthrough of the flow and trust model.',
  'Co-design of your first squad and risk boundaries.',
  'Support in running an initial high-stakes sequence.',
] as const;

/* ----------------------------------------------------------------------------
 * Hero visual — vertical 4-step rail (Verify → Cohort → Room → Outcome)
 * --------------------------------------------------------------------------*/

function HeroFlowRail() {
  return (
    <div
      aria-label="Verify, cohort, room, outcome"
      className="rounded-lg border border-[#1e293b] bg-[#080d14] p-5 sm:p-6"
    >
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
          One controlled path
        </p>
        <span
          aria-hidden
          className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-slate-600"
        >
          pilot-scoped
        </span>
      </div>
      <ol className="relative mt-5 space-y-4">
        <span
          aria-hidden
          className="absolute left-[0.81rem] top-2 bottom-2 w-px bg-gradient-to-b from-teal/50 via-teal/25 to-transparent"
        />
        {HERO_RAIL.map((step, i) => {
          const isLast = i === HERO_RAIL.length - 1;
          return (
            <li key={step.number} className="relative flex gap-3.5">
              <span
                aria-hidden
                className={`relative z-[1] mt-0.5 inline-flex h-[1.625rem] w-[1.625rem] shrink-0 items-center justify-center rounded-full border font-mono text-[0.62rem] font-semibold tabular-nums ${
                  isLast
                    ? 'border-teal/60 bg-teal/15 text-teal-light'
                    : 'border-[#27384b] bg-[#0a121f] text-slate-400'
                }`}
              >
                {step.number}
              </span>
              <div className="min-w-0 pb-0.5">
                <p className="font-heading text-[0.92rem] font-semibold leading-snug text-landing-ink">
                  {step.label}
                </p>
                <p className="mt-1 font-sans text-[0.8rem] leading-relaxed text-slate-400">
                  {step.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Sections
 * --------------------------------------------------------------------------*/

function Hero() {
  return (
    <section
      className="col-span-12 border-b border-white/[0.06] px-gutter pb-12 pt-[5.5rem] md:pb-16 md:pt-24"
      aria-labelledby="hero-heading"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] lg:items-start lg:gap-14">
        <div className="min-w-0">
          <p className="mb-5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brand">
            Verified dialogue infrastructure · Sealed rooms · Public records
          </p>
          <h1
            id="hero-heading"
            className="max-w-[48rem] font-display text-[clamp(2.35rem,5vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink"
          >
            Private facilitator-led dialogue with public, citable outcomes.
          </h1>
          <p className="mt-6 max-w-[42rem] font-sans text-[1.02rem] leading-[1.7] text-ink-secondary md:text-[1.12rem]">
            SquadRidge gives facilitators one controlled path for rooms that cannot be recorded but
            still need durable, anonymous, timestamped results.
          </p>
          <TrustCallout eyebrow="Core distinction" className="mt-7 max-w-[42rem]">
            The room is private and temporary. The public record is deliberate and durable. A leaked
            snippet is not an outcome; only an approved release becomes citable.
          </TrustCallout>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              id="hero-waitlist-cta"
              href="#waitlist"
              className="focus-ring btn-primary inline-flex min-h-[44px] items-center justify-center px-6 py-2.5 font-sans text-[0.95rem] font-semibold no-underline"
            >
              Apply for a pilot
            </a>
            <Link to={`/ledger/${DEMO_PROPOSAL_ID}`} className="btn-secondary text-sm no-underline">
              View a public record
            </Link>
          </div>
        </div>
        <div className="min-w-0 lg:pt-1">
          <HeroFlowRail />
        </div>
      </div>
    </section>
  );
}

function FlowStrip() {
  return (
    <FullBleed alt className="py-12 md:py-16" innerClassName="bg-transparent">
      <section aria-labelledby="flow-heading">
        <SectionHeading id="flow-heading" eyebrow="What happens">
          One path: from eligibility to a public outcome.
        </SectionHeading>
        <p className="mt-4 max-w-copy font-sans text-[0.92rem] leading-relaxed text-slate-400">
          <span className="font-medium text-slate-300">A squad</span> is a small matched cohort
          (usually 4–8 participants) working a shared problem under facilitator guidance. The four
          steps below are how one gets stood up, run, and released.
        </p>
        <ProcessRail steps={PROCESS_RAIL_STEPS} className="mt-9" />
      </section>
    </FullBleed>
  );
}

function SealedRoomPublicRecordModel() {
  return (
    <PlatformSection
      id="sealed-room-public-record"
      labelledBy="boundary-model-heading"
      className="col-span-12 bg-surface"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
        <div>
          <SectionKicker>The operating model</SectionKicker>
          <h2
            id="boundary-model-heading"
            className="mb-0 max-w-[13ch] font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-ink"
          >
            The sealed room and the public record.
          </h2>
          <p className="mt-5 max-w-[38rem] font-sans text-[1rem] leading-[1.7] text-ink-secondary">
            Standard tools collapse the conversation and the artifact into the same thing.
            SquadRidge separates them, then makes that separation operational: access before room,
            release scope before publication, public record after approval.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {BOUNDARY_POINTS.map((point, index) => (
            <BoundaryCard
              key={point.label}
              label={point.label}
              title={point.title}
              tone={index === 0 ? 'sealed' : 'record'}
            >
              <p className="mb-0">{point.body}</p>
            </BoundaryCard>
          ))}
          <InstitutionalPanel className="md:col-span-2">
            <dl className="grid gap-4 md:grid-cols-3">
              {[
                ['Before access', 'Verification and eligibility are resolved first.'],
                ['Before room', 'Facilitators define boundaries and release rules.'],
                ['After approval', 'Only outcome fields become public and citable.'],
              ].map(([label, body]) => (
                <div key={label}>
                  <dt className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    {label}
                  </dt>
                  <dd className="mt-2 font-sans text-[0.86rem] leading-relaxed text-ink-secondary">
                    {body}
                  </dd>
                </div>
              ))}
            </dl>
          </InstitutionalPanel>
        </div>
      </div>
    </PlatformSection>
  );
}

function HowItWorks() {
  return (
    <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
      <section id="how-it-works" aria-labelledby="how-heading">
        <SectionHeading id="how-heading" eyebrow="What you control">
          Three decisions the facilitator makes — the system carries the rest.
        </SectionHeading>
        <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-relaxed text-slate-400">
          What the room is for, who is in it, and what is allowed to leave. Everything else
          (verification, cohort matching, the public record) hangs off those three calls.
        </p>
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
  );
}

function Comparison() {
  return (
    <FullBleed alt className="py-14 md:py-20" innerClassName="bg-transparent">
      <section aria-labelledby="compare-heading">
        <SectionHeading id="compare-heading" eyebrow="Why standard tools break down">
          Slack, Discord, Zoom, and surveys solve a different problem.
        </SectionHeading>
        <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-relaxed text-slate-400">
          When attribution can hurt the people in the room, a general-purpose collaboration tool is
          working against you. The structure of the problem is different, so the structure of the
          tool has to be different.
        </p>

        <div className="mt-10 overflow-hidden rounded-md border border-[#1e293b]">
          <div className="hidden grid-cols-[minmax(10rem,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-[#1e293b] bg-[#070b12] md:grid">
            <div className="border-r border-[#1e293b] px-5 py-3.5">
              <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Axis
              </p>
            </div>
            <div className="border-r border-[#1e293b] px-5 py-3.5">
              <p className="flex items-center gap-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                <span aria-hidden className="text-slate-600">
                  ✕
                </span>
                Standard tools
              </p>
            </div>
            <div className="border-l-2 border-l-teal/40 bg-[#0c1626] px-5 py-3.5">
              <p className="flex items-center gap-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-teal-light">
                <span aria-hidden className="text-teal/70">
                  →
                </span>
                SquadRidge
              </p>
            </div>
          </div>

          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.axis}
              className={`grid gap-0 md:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] ${
                i > 0 ? 'border-t border-[#1e293b]' : ''
              }`}
            >
              <div className="border-b border-[#1e293b] p-5 md:border-b-0 md:border-r md:px-5 md:py-5">
                <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500 md:hidden">
                  Axis
                </p>
                <p className="mt-1 font-heading text-[0.95rem] font-semibold leading-snug text-landing-ink md:mt-0">
                  {row.axis}
                </p>
              </div>
              <div className="border-b border-[#1e293b] p-5 md:border-b-0 md:border-r md:px-5 md:py-5">
                <p className="flex items-center gap-1.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500 md:hidden">
                  <span aria-hidden className="text-slate-600">
                    ✕
                  </span>
                  Standard tools
                </p>
                <p className="mt-2 font-sans text-[0.9rem] font-semibold leading-snug text-slate-300 md:mt-0">
                  {row.standard.headline}
                </p>
                <p className="mt-1.5 font-sans text-[0.82rem] leading-relaxed text-slate-500">
                  {row.standard.detail}
                </p>
              </div>
              <div className="border-l-2 border-l-teal/40 bg-[#0c1626] p-5 md:px-5 md:py-5">
                <p className="flex items-center gap-1.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-teal-light md:hidden">
                  <span aria-hidden className="text-teal/70">
                    →
                  </span>
                  SquadRidge
                </p>
                <p className="mt-2 font-sans text-[0.9rem] font-semibold leading-snug text-landing-ink md:mt-0">
                  {row.squadridge.headline}
                </p>
                <p className="mt-1.5 font-sans text-[0.82rem] leading-relaxed text-landing-body">
                  {row.squadridge.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </FullBleed>
  );
}

function Audience() {
  return (
    <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
      <section aria-labelledby="audiences-heading">
        <SectionHeading id="audiences-heading" eyebrow="Who this is built for">
          Operators running sensitive sessions, not general users.
        </SectionHeading>
        <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-relaxed text-slate-400">
          When attribution is unsafe, every default move — record, summarize, post, share — costs
          you either the room or the outcome. SquadRidge is built so the people below do not have to
          choose.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-6">
          {AUDIENCES.map((audience) => (
            <article
              key={audience.title}
              className={`flex h-full flex-col border bg-[#080d14] p-6 ${
                audience.primary ? 'border-teal/40 bg-[#0a121f]' : 'border-[#1e293b]'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-[1.05rem] font-semibold leading-snug text-landing-ink">
                  {audience.title}
                </h3>
                {audience.primary ? (
                  <span className="rounded border border-teal/40 bg-teal/10 px-2 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-teal-light">
                    Primary
                  </span>
                ) : null}
              </div>
              <p className="mt-3 font-sans text-[0.92rem] leading-relaxed text-landing-body">
                {audience.benefit}
              </p>
              <p className="mt-4 border-t border-[#1e293b] pt-4 font-sans text-[0.82rem] leading-relaxed text-slate-500">
                {audience.example}
              </p>
            </article>
          ))}
        </div>
      </section>
    </FullBleed>
  );
}

function SecurityTeaser() {
  return (
    <FullBleed alt className="py-14 md:py-20" innerClassName="bg-transparent">
      <section aria-labelledby="security-heading">
        <SectionHeading id="security-heading" eyebrow="Security and trust">
          Privacy as a structural constraint, not branding.
        </SectionHeading>

        <blockquote className="mt-8 max-w-copy border-l-2 border-teal pl-5 font-heading text-[1.1rem] font-semibold leading-snug tracking-tight text-landing-ink md:text-[1.25rem]">
          The room stays private. The outcome stays usable. Neither one depends on someone
          remembering to behave well.
        </blockquote>

        <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {SECURITY_POINTS.map((point) => (
            <li key={point.label} className="border border-[#1e293b] bg-[#080d14] p-5 md:p-6">
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {point.label}
              </p>
              <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-landing-body">
                {point.body}
              </p>
            </li>
          ))}
        </ul>

        <Link
          to="/security"
          className="focus-ring mt-8 inline-flex min-h-[44px] items-center border border-[#3d4f63] bg-transparent px-5 py-2.5 font-heading text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
        >
          Read the security disclosure
        </Link>
      </section>
    </FullBleed>
  );
}

function LedgerTeaser() {
  return (
    <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
      <section aria-labelledby="record-heading">
        <SectionHeading id="record-heading" eyebrow="Citable outcomes">
          What got out of the room. What stayed in.
        </SectionHeading>
        <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-[1.65] text-landing-body">
          When a cohort reaches a result that is safe to release, SquadRidge publishes it as an
          anonymous, timestamped public record — not a transcript. An outcome others can cite,
          review, and build from.
        </p>

        {/* Asymmetry artifact — the proof point of the page. Side-by-side on
            md+, stacked on mobile. Each side is a generously padded panel so
            the two beats can breathe. */}
        <div className="mt-10 grid gap-3 md:grid-cols-2 md:gap-4">
          <div className="rounded-md border border-teal/30 bg-[#0a121f] p-6 md:p-7">
            <div className="flex items-center gap-2">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-teal" />
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-teal-light">
                Got out
              </p>
            </div>
            <p className="mt-4 font-heading text-[1.08rem] font-semibold leading-[1.4] text-landing-ink md:text-[1.18rem]">
              A structured, citable consensus and the rounds it took to reach it.
            </p>
          </div>
          <div className="rounded-md border border-[#1e293b] bg-[#080d14] p-6 md:p-7">
            <div className="flex items-center gap-2">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-slate-500/60" />
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Stayed in
              </p>
            </div>
            <p className="mt-4 font-heading text-[1.08rem] font-semibold leading-[1.4] text-slate-400 md:text-[1.18rem]">
              The participants, the words they used, and the disagreement that produced it.
            </p>
          </div>
        </div>

        {/* Closing: short qualifier prose on the left, simplified sample-record
            link card on the right. The asymmetry artifact above did the
            teaching; this card just gives readers a real one to open. */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-center lg:gap-10">
          <p className="max-w-copy font-sans text-[0.92rem] leading-[1.65] text-slate-500">
            The goal is not just safer conversation. It is durable, credible output you can put in
            front of a partner, a funder, or a court.
          </p>
          <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-[#2a3548] bg-[#0b101c] p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Sample record
              </p>
              <p className="font-mono text-[0.62rem] font-medium tracking-[0.1em] text-amber/90">
                2025-04-01
              </p>
            </div>
            <h3 className="font-heading text-[0.98rem] font-semibold leading-snug text-landing-ink">
              Multi-party consensus on a contested decision.
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['consensus', 'pilot', 'facilitator-led'].map((t) => (
                <span
                  key={t}
                  className="rounded border border-[#2d3f55] bg-[#070b12] px-2 py-0.5 font-mono text-[0.62rem] text-slate-500"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                to={`/ledger/${DEMO_PROPOSAL_ID}`}
                className="focus-ring inline-flex min-h-[40px] items-center justify-center border border-[#3d4f63] bg-[#0c121c] px-4 py-2 font-heading text-[0.85rem] font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-[#101a28]"
              >
                Open this record
              </Link>
              <Link
                to="/ledger"
                className="focus-ring inline-flex min-h-[40px] items-center justify-center px-2 py-2 font-heading text-[0.85rem] font-medium text-teal-light underline-offset-4 hover:underline"
              >
                Browse the ledger →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </FullBleed>
  );
}

function PilotAccess() {
  return (
    <FullBleed alt className="py-14 md:pb-20" innerClassName="bg-transparent">
      <div className="mx-auto max-w-copy">
        <section aria-labelledby="pilot-benefits-heading" className="mb-8">
          <div className="border border-teal/30 bg-[#0a121f] p-6 md:p-7">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-teal-light">
              Apply for a pilot
            </p>
            <h2
              id="pilot-benefits-heading"
              className="mt-3 font-heading text-xl font-semibold leading-snug tracking-tight text-landing-ink md:text-2xl"
            >
              For facilitators ready to run one.
            </h2>
            <p className="mt-3 font-sans text-[0.92rem] leading-relaxed text-landing-body">
              Pilots are facilitator-led and pilot-scoped. Accepted facilitators get:
            </p>
            <ul className="mt-5 space-y-3 font-sans text-[0.95rem] leading-relaxed text-landing-body">
              {PILOT_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal/70"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-l-2 border-amber/40 bg-amber/[0.04] px-4 py-3.5">
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-amber/90">
                Order of priority
              </p>
              <p className="mt-2 font-sans text-[0.85rem] leading-relaxed text-slate-300">
                Pilots with a defined facilitator profile, participants, and risk model move first.
              </p>
              <p className="mt-2 font-sans text-[0.85rem] leading-relaxed text-slate-400">
                Earlier-stage applications are welcome — say where you are. We co-design the missing
                pieces with you, we just move at a different pace.
              </p>
            </div>
          </div>
        </section>

        <WaitlistSection />
      </div>
    </FullBleed>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------*/

export function LandingPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-0 bg-navy text-left">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-12 gap-x-6">
        <Hero />
        <hr className="sr-section-rule col-span-12" />
        <SealedRoomPublicRecordModel />
        <hr className="sr-section-rule col-span-12" />
        <FlowStrip />
        <hr className="sr-section-rule col-span-12" />
        <HowItWorks />
        <hr className="sr-section-rule col-span-12" />
        <Comparison />
        <hr className="sr-section-rule col-span-12" />
        <Audience />
        <hr className="sr-section-rule col-span-12" />
        <SecurityTeaser />
        <hr className="sr-section-rule col-span-12" />
        <LedgerTeaser />
        <hr className="sr-section-rule col-span-12" />
        <PilotAccess />

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
