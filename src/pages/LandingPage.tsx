import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Check,
  Clock3,
  Fingerprint,
  Lock,
  ScrollText,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { WaitlistSection } from '../components';
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
      className={`col-span-12 relative left-1/2 min-w-0 w-[100vw] max-w-[100vw] -translate-x-1/2 ${alt ? 'bg-band-black' : 'bg-band-navy'} ${className ?? ''}`}
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
        <p className="mb-3 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="scroll-mt-24 font-sans text-[clamp(1.4rem,2vw,1.75rem)] font-semibold leading-[1.2] tracking-[-0.015em] text-ink"
      >
        {children}
      </h2>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="col-span-12" aria-hidden>
      <div className="sr-divider-mark my-6 md:my-10" />
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Content
 * --------------------------------------------------------------------------*/

const HERO_PROOF_CHIPS = ['Not recorded', 'Verified access', 'Timestamped public record'] as const;

const PILOT_OPERATING_SCOPE = ['Facilitator-led', '1-3 squads', '4-6 weeks'] as const;

const FLOW_STEPS = [
  {
    n: '01',
    short: 'Verify',
    title: 'Verify access',
    body: 'Confirm eligibility and participant fit before anyone enters the room.',
    Icon: Fingerprint,
  },
  {
    n: '02',
    short: 'Sealed',
    title: 'Run the sealed session',
    body: 'Facilitate a private room with explicit boundaries and no recording or permanent transcript.',
    Icon: Lock,
  },
  {
    n: '03',
    short: 'Release',
    title: 'Release the public record',
    body: 'Publish only the approved anonymous outcome as a timestamped artifact others can cite.',
    Icon: ScrollText,
  },
] as const;

type ComparisonCell = { headline: string; detail: string };

const COMPARISON_ROWS: ReadonlyArray<{
  axis: string;
  standard: ComparisonCell;
  squadridge: ComparisonCell;
}> = [
  {
    axis: 'Identity exposure',
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
    axis: 'Recording and transcript risk',
    standard: {
      headline: 'The transcript becomes the artifact.',
      detail: 'To preserve value, the room has to be captured or summarized.',
    },
    squadridge: {
      headline: 'The room is never the artifact.',
      detail: 'No recording or permanent transcript is required for accountability.',
    },
  },
  {
    axis: 'Publishable outcomes',
    standard: {
      headline: 'Outputs are informal or exposed.',
      detail: 'Screenshots, notes, and surveys do not create a clean public record.',
    },
    squadridge: {
      headline: 'Only the approved outcome is released.',
      detail: 'Anonymous, timestamped, and structured for partners or funders to cite.',
    },
  },
];

const AUDIENCES = [
  {
    title: 'Facilitators and mediators',
    primary: true,
    benefit: 'Run sensitive sessions and produce outcomes leadership can use.',
    Icon: Users,
  },
  {
    title: 'Veteran, cross-border, and community organizers',
    primary: false,
    benefit: 'Hold dialogue where attribution itself is a risk to the people in the room.',
    Icon: Shield,
  },
  {
    title: 'Partners, funders, and institutions',
    primary: false,
    benefit: 'Audit and fund programs without exposing the participants in the room.',
    Icon: BarChart3,
  },
] as const;

const SECURITY_POINTS = [
  {
    label: 'Identity',
    body: 'Eligibility is checked once. Identity is not the access lever inside the room — people do not have to expose themselves to belong.',
    happens: 'Eligibility proven once at the door.',
    prevents: 'Prevents identity from becoming the room currency.',
    Icon: Fingerprint,
  },
  {
    label: 'Confidentiality',
    body: 'What can leave the room is decided before the room opens, not negotiated in the moment by tired participants.',
    happens: 'Release boundary set before opening.',
    prevents: 'Prevents in-the-moment leakage decisions.',
    Icon: Lock,
  },
  {
    label: 'Public record',
    body: 'A separate artifact from the room. A leaked snippet does not produce a citable result — only an approved release does.',
    happens: 'Approved outcome published as a timestamped record.',
    prevents: 'Prevents leaked snippets from passing as outputs.',
    Icon: Clock3,
  },
] as const;

const PILOT_MEASURES = [
  {
    label: 'Cohort readiness',
    body: 'Facilitator, participant boundary, and eligibility model.',
  },
  {
    label: 'Room safety',
    body: 'Consent checkpoints, moderation actions, and return rate.',
  },
  {
    label: 'Release quality',
    body: 'Whether the anonymous record is specific enough to cite.',
  },
] as const;

const PILOT_INCLUDES = [
  'Private walkthrough',
  'First-squad co-design',
  'Release model review',
] as const;

const PILOT_FIT_SIGNALS = [
  'Recording changes participant behavior',
  'A partner needs a durable outcome',
  'The release boundary can be defined up front',
] as const;

/* ----------------------------------------------------------------------------
 * Hero visual support
 * --------------------------------------------------------------------------*/

function BoundaryDiagram() {
  return (
    <div
      aria-label="Sealed room to public record model"
      className="rounded-md border border-line bg-surface-elevated p-4 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] sm:items-stretch">
        <div className="rounded-md border border-line bg-surface-sealed p-4">
          <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Private
          </p>
          <p className="mt-3 font-sans text-[0.95rem] font-semibold leading-snug text-ink">
            Private sealed room
          </p>
          <p className="mt-2 font-sans text-[0.78rem] leading-relaxed text-ink-secondary">
            Facilitated dialogue. No transcript. No permanent room artifact.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex w-full items-center justify-center gap-1.5 sm:flex-col">
            <span className="hidden h-px w-6 bg-line-strong sm:block sm:h-6 sm:w-px" aria-hidden />
            <span className="inline-flex items-center gap-1 rounded-[4px] border border-brand/60 bg-brand-soft px-2 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-brand-hover">
              <ArrowRight aria-hidden className="size-3" />
              Approved release
            </span>
            <span className="hidden h-px w-6 bg-line-strong sm:block sm:h-6 sm:w-px" aria-hidden />
          </div>
        </div>
        <div className="rounded-md border-l-[3px] border-l-brand border-y border-r border-y-line border-r-line bg-surface-elevated p-4">
          <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-brand">
            Public
          </p>
          <p className="mt-3 font-sans text-[0.95rem] font-semibold leading-snug text-ink">
            Released public record
          </p>
          <p className="mt-2 font-sans text-[0.78rem] leading-relaxed text-ink-secondary">
            Anonymous, timestamped outcome other stakeholders can cite.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Sections
 * --------------------------------------------------------------------------*/

function ThesisBar() {
  return (
    <section
      className="col-span-12 px-gutter pb-10 pt-16 md:pb-14 md:pt-20"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-[58rem]">
        <p className="mb-5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brand">
          Verified dialogue infrastructure for sensitive facilitator-led sessions
        </p>
        <h1
          id="hero-heading"
          className="sr-reveal max-w-[52rem] font-sans text-display-hero font-semibold tracking-[-0.025em] text-ink"
        >
          Run private rooms without losing public accountability.
        </h1>
        <p className="mt-6 max-w-[46rem] font-sans text-[1.02rem] leading-[1.7] text-ink-secondary md:text-[1.08rem]">
          SquadRidge verifies eligibility, keeps facilitator-led sessions sealed, and publishes only
          approved anonymous records that others can cite.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <a
            id="hero-waitlist-cta"
            href="#waitlist"
            className="focus-ring btn-primary inline-flex min-h-[44px] items-center justify-center px-6 py-2.5 font-sans text-[0.92rem] font-semibold no-underline"
          >
            Apply for pilot access
          </a>
          <Link
            to={`/ledger/${DEMO_PROPOSAL_ID}`}
            className="btn-secondary inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-sm no-underline"
          >
            View sample public record
          </Link>
        </div>
      </div>
      <ul className="mt-9 grid gap-2 border-y border-line-divider py-4 sm:grid-cols-3 sm:gap-4">
        {HERO_PROOF_CHIPS.map((chip) => (
          <li
            key={chip}
            className="flex items-center gap-2.5 font-sans text-[0.88rem] text-ink-secondary"
          >
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span>{chip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CoreModel() {
  return (
    <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
      <section aria-labelledby="core-model-heading">
        <SectionHeading id="core-model-heading" eyebrow="Core model">
          One private room. One deliberate public artifact.
        </SectionHeading>
        <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-relaxed text-ink-secondary">
          The session is not the record. Participants can speak inside a bounded room, while
          partners and funders receive only the approved anonymous outcome.
        </p>

        <div className="mt-8">
          <BoundaryDiagram />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-line bg-surface-elevated p-5">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Stays private
            </p>
            <p className="mt-3 font-sans text-[0.92rem] leading-relaxed text-ink-secondary">
              Participant identity, the words used in the room, the disagreement that produced the
              outcome, and any transcript-like record.
            </p>
          </div>
          <div className="rounded-md border-l-[3px] border-l-brand border-y border-r border-y-line border-r-line bg-surface-elevated p-5">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-brand-hover">
              Can be released
            </p>
            <p className="mt-3 font-sans text-[0.92rem] leading-relaxed text-ink-secondary">
              A facilitator-approved anonymous public record with a timestamp, structure, and enough
              context to be cited.
            </p>
          </div>
        </div>
      </section>
    </FullBleed>
  );
}

/**
 * Horizontal flow diagram for "How it works" — three icon nodes with
 * short labels above the fold of the section, connected by chevrons. The
 * detail cards sit below the diagram so the visual progression
 * (Verify → Sealed → Release) is what a scanning visitor sees first.
 *
 * Mobile: the chevrons rotate 90° and the nodes stack vertically.
 */
function FlowDiagram() {
  return (
    <div
      role="img"
      aria-label="Three-step flow: Verify access, then a sealed session, then release the public record."
      className="rounded-md border border-line bg-surface-elevated px-4 py-6 md:px-8 md:py-8"
    >
      <ol className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
        {FLOW_STEPS.map((step, i) => {
          const Icon = step.Icon;
          return (
            <li key={step.n} className="contents">
              <div className="flex flex-col items-start gap-3 md:items-center md:text-center">
                <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Step {i + 1}
                </span>
                <span
                  aria-hidden
                  className={`relative inline-flex size-14 shrink-0 items-center justify-center rounded-full border ${
                    i === 2
                      ? 'border-brand bg-brand-soft text-brand-hover'
                      : 'border-line-strong bg-surface text-ink-secondary'
                  }`}
                >
                  <Icon className="size-6" strokeWidth={1.6} />
                </span>
                <p className="font-sans text-[0.95rem] font-semibold leading-snug text-ink">
                  {step.short}
                </p>
              </div>
              {i < FLOW_STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className="mx-1 my-1 flex items-center justify-center text-ink-faint md:mx-0 md:my-0"
                >
                  {/* Vertical chevron on mobile, horizontal on md+ */}
                  <ArrowRight className="size-5 rotate-90 md:rotate-0" strokeWidth={1.5} />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FlowStrip() {
  return (
    <FullBleed alt className="py-14 md:py-20" innerClassName="bg-transparent">
      <section id="how-it-works" className="scroll-mt-24" aria-labelledby="flow-heading">
        <SectionHeading id="flow-heading" eyebrow="How it works">
          Verify the room. Hold the session. Release only the outcome.
        </SectionHeading>
        <p className="mt-4 max-w-copy font-sans text-[0.92rem] leading-relaxed text-ink-secondary">
          A squad is a small matched cohort working a shared problem under facilitator guidance.
          SquadRidge keeps the access model, session boundary, and public release tied together.
        </p>

        <div className="mt-8">
          <FlowDiagram />
        </div>

        <ol className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
          {FLOW_STEPS.map((step) => (
            <li key={step.n} className="sr-card flex flex-col p-4 md:p-5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-brand-hover">
                  {step.n} · {step.short}
                </span>
              </div>
              <h3 className="mt-3 font-sans text-[0.96rem] font-semibold leading-snug text-ink">
                {step.title}
              </h3>
              <p className="mt-2 font-sans text-[0.86rem] leading-[1.55] text-ink-secondary">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-copy font-sans text-[0.9rem] leading-relaxed text-brand-hover">
          The room stays private; the approved public record remains usable.
        </p>
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
        <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-relaxed text-ink-secondary">
          When attribution can hurt the people in the room, a general-purpose collaboration tool is
          working against you. The structure of the problem is different, so the structure of the
          tool has to be different.
        </p>

        <div className="mt-10 overflow-hidden rounded-md border border-line">
          <div className="hidden grid-cols-[minmax(10rem,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-line bg-surface-secondary md:grid">
            <div className="border-r border-line px-5 py-3.5">
              <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Axis
              </p>
            </div>
            <div className="border-r border-line px-5 py-3.5">
              <p className="flex items-center gap-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                <X aria-hidden className="size-3.5 text-ink-subtle" strokeWidth={2} />
                Standard tools
              </p>
            </div>
            <div className="border-l-[3px] border-l-brand px-5 py-3.5">
              <p className="flex items-center gap-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-brand-hover">
                <Check aria-hidden className="size-3.5" strokeWidth={2.25} />
                SquadRidge
              </p>
            </div>
          </div>

          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.axis}
              className={`sr-compare-row grid gap-0 md:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] ${
                i > 0 ? 'border-t border-line' : ''
              }`}
            >
              <div className="border-b border-line p-5 md:border-b-0 md:border-r md:px-5 md:py-5">
                <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint md:hidden">
                  Axis
                </p>
                <p className="mt-1 font-sans text-[0.95rem] font-semibold leading-snug text-ink md:mt-0">
                  {row.axis}
                </p>
              </div>
              <div className="border-b border-line p-5 md:border-b-0 md:border-r md:px-5 md:py-5">
                <p className="flex items-center gap-1.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint md:hidden">
                  <X aria-hidden className="size-3.5 text-ink-subtle" strokeWidth={2} />
                  Standard tools
                </p>
                <div className="mt-2 flex gap-3 md:mt-0">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-line text-ink-subtle"
                  >
                    <X className="size-3" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-sans text-[0.9rem] font-semibold leading-snug text-ink-secondary">
                      {row.standard.headline}
                    </p>
                    <p className="mt-1.5 font-sans text-[0.82rem] leading-relaxed text-ink-faint">
                      {row.standard.detail}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-l-[3px] border-l-brand p-5 md:px-5 md:py-5">
                <p className="flex items-center gap-1.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-brand-hover md:hidden">
                  <Check aria-hidden className="size-3.5" strokeWidth={2.25} />
                  SquadRidge
                </p>
                <div className="mt-2 flex gap-3 md:mt-0">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-brand bg-brand-soft text-brand-hover"
                  >
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="font-sans text-[0.9rem] font-semibold leading-snug text-ink">
                      {row.squadridge.headline}
                    </p>
                    <p className="mt-1.5 font-sans text-[0.82rem] leading-relaxed text-ink-secondary">
                      {row.squadridge.detail}
                    </p>
                  </div>
                </div>
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
          Facilitators, mediators, and operators with rooms that carry risk.
        </SectionHeading>
        <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
          {AUDIENCES.map((audience) => {
            const Icon = audience.Icon;
            return (
              <article
                key={audience.title}
                className={`sr-card flex h-full flex-col p-5 ${
                  audience.primary ? 'sr-card--primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-line text-ink-secondary"
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  {audience.primary ? <span className="sr-chip-primary">Primary</span> : null}
                </div>
                <h3 className="mt-4 font-sans text-[1rem] font-semibold leading-snug text-ink">
                  {audience.title}
                </h3>
                <p className="mt-2 font-sans text-[0.88rem] leading-[1.55] text-ink-secondary">
                  {audience.benefit}
                </p>
              </article>
            );
          })}
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
          Trust controls built into the session flow.
        </SectionHeading>

        <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-relaxed text-ink-secondary">
          SquadRidge separates eligibility, in-room participation, and public release. The boundary
          is set before the session starts, and only an approved record can become public.
        </p>

        <ul className="mt-9 grid gap-4 md:grid-cols-3 md:gap-5">
          {SECURITY_POINTS.map((point) => {
            const Icon = point.Icon;
            return (
              <li key={point.label} className="sr-security-card flex flex-col p-5 md:p-6">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface-sunken text-ink-secondary"
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-brand-hover">
                      {point.label}
                    </p>
                    <p className="mt-2 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">
                      {point.body}
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 border-t border-line pt-5">
                  <div className="rounded-md border border-line bg-surface-secondary px-3.5 py-3">
                    <dt className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-brand-hover">
                      Happens
                    </dt>
                    <dd className="mt-1.5 font-sans text-[0.84rem] leading-[1.55] text-ink">
                      {point.happens}
                    </dd>
                  </div>
                  <div className="rounded-md border border-line bg-surface px-3.5 py-3">
                    <dt className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                      Prevents
                    </dt>
                    <dd className="mt-1.5 font-sans text-[0.84rem] leading-[1.55] text-ink-secondary">
                      {point.prevents}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/trust"
            className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-[6px] border border-line bg-transparent px-5 py-2.5 font-sans text-sm font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
          >
            Read Trust &amp; Safety
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Link
            to="/security"
            className="focus-ring inline-flex min-h-[44px] items-center gap-2 px-1 py-2.5 font-sans text-sm font-medium text-ink-faint underline-offset-4 hover:text-ink-secondary hover:underline"
          >
            Technical Security Disclosure
          </Link>
        </div>
      </section>
    </FullBleed>
  );
}

/**
 * `RELEASED` stamp — slightly off-axis, faded, drawn as a thin
 * double-bordered badge so it reads like an approval mark on a printed
 * document rather than a UI sticker. Decorative; safe text alternative
 * lives on the parent link.
 */
function ReleasedStamp({ date }: { date: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none inline-flex flex-col items-center gap-0.5 rounded-[4px] border-2 border-double border-brand/55 bg-record-paper/40 px-3 py-1 font-mono text-brand-hover/85 backdrop-blur-[1px] [transform:rotate(-6deg)]"
    >
      <span className="text-[0.78rem] font-bold leading-none tracking-[0.18em]">RELEASED</span>
      <span className="text-[0.58rem] leading-none tracking-[0.14em] text-brand-hover/70">
        {date}
      </span>
    </span>
  );
}

function PublicRecordFacsimile() {
  /* Illustrative shape — no specific claims, just the structure of an
   * approved release. Live records are produced from active pilots only. */
  return (
    <Link
      to={`/ledger/${DEMO_PROPOSAL_ID}`}
      aria-label="Open the sample public outcome record"
      className="focus-ring group relative block min-w-0 overflow-hidden rounded-md border border-record-line bg-record-paper text-record-ink no-underline shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] transition-transform duration-150 hover:-translate-y-px"
    >
      {/* Faux paper rule lines — subtle ledger texture, not decorative noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(to_bottom,transparent_0,transparent_calc(1.5rem-1px),rgb(0_0_0)_calc(1.5rem-1px),rgb(0_0_0)_1.5rem)] [background-size:100%_1.5rem]"
      />

      {/* Document header strip */}
      <div className="relative flex flex-wrap items-baseline justify-between gap-2 border-b border-record-line bg-record-muted/60 px-5 py-3 md:px-7 md:py-3.5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-5 items-center justify-center rounded-full border border-brand/60 bg-brand-soft text-brand-hover"
          >
            <Check className="size-3" strokeWidth={2.5} />
          </span>
          <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-record-faint">
            SquadRidge · Sample public record
          </p>
        </div>
        <p
          className="font-mono text-[0.72rem] tracking-[0.08em] text-record-faint"
          title="Sample record reference"
        >
          SR-2025-04-01-7f3a9b
        </p>
      </div>

      <div className="relative grid gap-8 px-5 py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:gap-12 md:px-8 md:py-10">
        {/* RELEASED stamp — top-right, illustrative approval mark */}
        <div className="pointer-events-none absolute right-5 top-5 hidden md:block md:right-7 md:top-7">
          <ReleasedStamp date="2025-04-01" />
        </div>

        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-record-line bg-record-paper px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-record-ink">
            <Check aria-hidden className="size-3" strokeWidth={2.5} />
            Demo sample
          </span>
          <h3 className="mt-4 max-w-[28rem] font-display text-[clamp(1.4rem,2vw,1.85rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-record-ink">
            Multi-party consensus on a contested decision.
          </h3>
          <p className="mt-4 max-w-[36rem] font-sans text-[0.95rem] leading-[1.7] text-record-muted">
            The cohort reached a structured consensus on a contested decision after three rounds of
            facilitator-led exchange. The released record below preserves the position and the
            method; the room itself was sealed and is not a public artifact.
          </p>
          <ul className="mt-6 space-y-2.5 font-sans text-[0.88rem] leading-[1.55] text-record-muted">
            <li className="flex gap-2.5">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-record-faint" />
              <span>Position statement, jointly endorsed by the cohort.</span>
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-record-faint" />
              <span>Release scope: consensus and method only; no transcript retained.</span>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {['consensus', 'pilot', 'facilitator-led'].map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-[3px] border border-record-line bg-record-paper px-2.5 py-1 font-mono text-[0.66rem] tracking-[0.04em] text-record-faint"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <dl className="grid content-start gap-3.5 border-t border-record-line pt-5 font-mono text-[0.74rem] tabular-nums text-record-muted md:border-l md:border-t-0 md:pl-7 md:pt-10">
          {[
            ['Released', '2025-04-01'],
            ['Reference', 'ledger:root=7f3a…c91d'],
            ['Transcript', 'None retained'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-sm border border-record-line/80 bg-record-paper-muted/45 px-3 py-2"
            >
              <dt className="uppercase tracking-[0.08em] text-record-faint">{label}</dt>
              <dd className="mt-1 break-words text-record-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-record-line bg-record-muted/40 px-5 py-4 md:px-7">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-record-faint">
          Demo sample · illustrative format
        </p>
        <span className="inline-flex items-center gap-1.5 font-sans text-[0.84rem] font-medium text-record-ink">
          Open this record
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

function LedgerTeaser() {
  return (
    <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
      <section aria-labelledby="record-heading">
        <SectionHeading id="record-heading" eyebrow="Citable outcomes">
          What an approved release actually looks like.
        </SectionHeading>
        <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-[1.65] text-ink-secondary">
          When a cohort reaches a result safe to release, SquadRidge publishes it as an anonymous,
          timestamped public record — not a transcript. An outcome others can cite, review, and
          build from.
        </p>

        {/* Facsimile leads — the document is the point of this section. */}
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Sample public record
            </p>
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-ink-subtle">
              Illustrative shape — real records publish only when a cohort releases one
            </p>
          </div>
          <PublicRecordFacsimile />
        </div>

        {/* What got out / stayed in — annotation pair under the document. */}
        <div className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4">
          <div className="rounded-md border border-line border-l-[3px] border-l-brand bg-surface-elevated p-4 md:p-5">
            <div className="flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
              <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-brand-hover">
                Got out
              </p>
            </div>
            <p className="mt-2 font-sans text-[0.92rem] leading-[1.5] text-ink">
              A structured, citable consensus and the rounds it took to reach it.
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface-elevated p-4 md:p-5">
            <div className="flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-status-empty" />
              <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Stayed in
              </p>
            </div>
            <p className="mt-2 font-sans text-[0.92rem] leading-[1.5] text-ink-faint">
              The participants, the words they used, and the disagreement that produced it.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-copy font-sans text-[0.88rem] leading-[1.6] text-ink-faint">
            The goal is not just safer conversation — it is durable, credible output you can put in
            front of a partner, a funder, or a court.
          </p>
          <Link
            to="/ledger"
            className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 px-1 py-2 font-sans text-[0.85rem] font-medium text-brand-hover underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Browse the ledger
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </section>
    </FullBleed>
  );
}

function PilotSummaryCard({
  title,
  items,
  icon = 'dot',
}: {
  title: string;
  items: ReadonlyArray<ReactNode>;
  icon?: 'dot' | 'check';
}) {
  return (
    <div className="rounded-md border border-line bg-surface-secondary px-4 py-4">
      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5 font-sans text-[0.84rem] leading-[1.5] text-ink-secondary">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2.5">
            {icon === 'check' ? (
              <Check
                aria-hidden
                className="mt-0.5 size-3.5 shrink-0 text-brand-hover"
                strokeWidth={2.5}
              />
            ) : (
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PilotAccess() {
  return (
    <FullBleed alt className="py-14 md:pb-20" innerClassName="bg-transparent">
      <section id="pilot-access" aria-labelledby="pilot-access-heading">
        <div className="mx-auto max-w-5xl rounded-md border border-line bg-surface-elevated p-5 md:p-7">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-brand-hover">
                Apply for pilot access
              </p>
              <h2
                id="pilot-access-heading"
                className="mt-3 max-w-[38rem] font-sans text-xl font-semibold leading-snug tracking-tight text-ink md:text-2xl"
              >
                A focused pilot for facilitator-led rooms with a real release boundary.
              </h2>
              <p className="mt-4 max-w-[44rem] font-sans text-[0.94rem] leading-relaxed text-ink-secondary">
                Apply when recording would change participant behavior, but the work still needs a
                durable outcome a partner, funder, or institution can review.
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <PilotSummaryCard title="Fit" items={PILOT_FIT_SIGNALS} />

                <PilotSummaryCard
                  title="Scope"
                  icon="check"
                  items={[...PILOT_OPERATING_SCOPE, ...PILOT_INCLUDES]}
                />

                <PilotSummaryCard
                  title="Evaluation"
                  items={PILOT_MEASURES.map((measure) => (
                    <span key={measure.label}>
                      <span className="font-medium text-ink-muted">{measure.label}:</span>{' '}
                      {measure.body}
                    </span>
                  ))}
                />
              </div>

              <div className="mt-6 grid gap-3 border-l-2 border-amber/40 bg-amber/[0.04] px-4 py-3 font-sans text-[0.84rem] leading-relaxed text-ink-secondary sm:grid-cols-[9rem_minmax(0,1fr)]">
                <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-amber/90">
                  Intake review
                </p>
                <p>
                  Usually within five business days. Strongest-fit pilots have a defined
                  facilitator, participant boundary, risk model, and proposed release format.
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <WaitlistSection showIntro={false} />
            </div>
          </div>
        </div>
      </section>
    </FullBleed>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------*/

export function LandingPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-0 bg-band-navy text-left">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-12 gap-x-6">
        <ThesisBar />
        <SectionDivider />
        <CoreModel />
        <SectionDivider />
        <Audience />
        <SectionDivider />
        <FlowStrip />
        <SectionDivider />
        <Comparison />
        <SectionDivider />
        <LedgerTeaser />
        <SectionDivider />
        <SecurityTeaser />
        <SectionDivider />
        <PilotAccess />

        {!configured ? (
          <>
            <SectionDivider />
            <section className="col-span-12 px-gutter pb-12 pt-8" aria-labelledby="env-heading">
              <div className="mx-auto max-w-copy rounded-md border border-amber/25 bg-surface-elevated p-6">
                <h2 id="env-heading" className="font-sans text-lg font-semibold text-amber">
                  Configure Supabase to run the live product
                </h2>
                <p className="mt-4 font-sans text-sm leading-relaxed text-ink-secondary">
                  Add{' '}
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-ink-secondary">
                    VITE_SUPABASE_URL
                  </code>{' '}
                  and{' '}
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-ink-secondary">
                    VITE_SUPABASE_PUBLISHABLE_KEY
                  </code>{' '}
                  to your{' '}
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-ink-secondary">
                    .env
                  </code>
                  , enable anonymous sign-in, and apply the migrations.
                </p>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
