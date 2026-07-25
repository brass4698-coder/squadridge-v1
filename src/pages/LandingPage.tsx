import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HowItWorksStep, StatusBadge, Stepper, WaitlistSection } from '../components';
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
  { label: 'Verify eligibility', helper: 'Invite-only, pilot-scoped access' },
  { label: 'Form the cohort', helper: 'Matched 4–8 person room' },
  { label: 'Run the session', helper: 'Facilitator-led, structured rounds' },
  { label: 'Publish the public record', helper: 'Anonymous, timestamped, citable' },
] as const;

type ProofCard =
  | { title: string; body: string }
  | { title: string; body: string; href: '/security'; linkLabel: string };

const PROOF_CARDS: readonly ProofCard[] = [
  {
    title: 'Facilitator-led',
    body: 'Every active room is structured, bounded, and moderated against a defined pilot model. Facilitators set scope, cohort, and release conditions before the room opens.',
  },
  {
    title: 'Security disclosure',
    body: 'Trust assumptions, privacy boundaries, and system guarantees are documented openly — not summarized in marketing.',
    href: '/security',
    linkLabel: 'Read disclosure',
  },
  {
    title: 'Public artifact',
    body: 'When approved for release, a session produces a citable public outcome — not a transcript, and not a private note that disappears with the room.',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    heading: 'Scope the room',
    body: 'Set cohort criteria, topic boundaries, and release conditions before the room opens. The facilitator decides what enters and what is allowed to leave.',
  },
  {
    number: '02',
    heading: 'Convene a verified cohort',
    body: 'Eligible participants join a small facilitator-led room — matched on context, not on social profile. Identity stays inside structural access controls.',
  },
  {
    number: '03',
    heading: 'Release a usable outcome',
    body: 'When a result is approved for release, SquadRidge publishes a public, anonymous, timestamped record others can cite. The discussion itself never leaves.',
  },
] as const;

const TRUST_PROOFS = [
  { label: 'Verified access', proof: 'Pilot-scoped invites only.' },
  { label: 'Facilitator-led rooms', proof: 'Structured 4–8 person cohorts.' },
  { label: 'Bounded confidentiality', proof: 'Identity stays inside the room.' },
  { label: 'Citable outcomes', proof: 'Public record, not a transcript.' },
] as const;

const HERO_FLOW = [
  {
    number: '01',
    label: 'Verified participants',
    detail: 'Invited and pilot-scoped. Eligibility checked before access.',
  },
  {
    number: '02',
    label: 'Facilitator-led room',
    detail: 'Small cohort, structured rounds, explicit boundaries.',
  },
  {
    number: '03',
    label: 'Public outcome',
    detail: 'Anonymous, timestamped, citable — not a transcript.',
  },
] as const;

const CONTRAST_ROWS = [
  {
    axis: 'Identity exposure',
    standard: 'Open channels make identity public. People self-censor or stay out entirely.',
    squadridge: 'Verified access without making identity the product.',
  },
  {
    axis: 'Outcome retention',
    standard: 'Closed channels keep things private — and bury the outcome with the room.',
    squadridge: 'Public, anonymous, timestamped record. The room itself stays private.',
  },
  {
    axis: 'Intervention quality',
    standard: 'Generic collaboration tools optimize for activity, reach, and message volume.',
    squadridge: 'Small facilitator-led cohorts built for intervention, not throughput.',
  },
] as const;

const AUDIENCES = [
  {
    title: 'Facilitators and mediators',
    primary: true,
    body: 'You run sensitive sessions: team conflict, post-incident debriefs, intergroup dialogue, mediation. SquadRidge gives you cleaner cohort composition, defined release conditions, and outcomes other people can actually use.',
  },
  {
    title: 'Veterans, organizers, and cross-border participants',
    primary: false,
    body: 'Subjects where attribution can hurt — veteran reintegration dialogue, civic organizing across hostile contexts, cross-border conversations. Participate without trading personal safety for presence.',
  },
  {
    title: 'Partners and funders',
    primary: false,
    body: 'Programs you fund have to be auditable and credible outside the room. Citable public outcomes give you something to evaluate that did not have to be a transcript.',
  },
] as const;

const PILOT_BENEFITS = [
  'A private walkthrough of the facilitator flow.',
  'A working session on pilot fit, risk model, and release conditions.',
  'Early access to facilitator-led pilots when there is real alignment.',
] as const;

/**
 * Hero-side "verified exchange" timeline. Intentionally distinct from
 * LandingPublicRecordPreview below: that one is a single-record detail used in
 * the lower public-record section; this one is a system-at-a-glance preview
 * for the hero, mirroring the upgrade-plan suggestion of a "timeline of
 * verified exchanges" graphic. Motion-free per .cursor/rules/squadridge.mdc.
 */
function LandingHeroLedgerPreview() {
  const rows = [
    {
      stamp: '00:04',
      actor: 'cohort A · perspective A',
      tone: 'info' as const,
      label: 'verified',
    },
    {
      stamp: '00:11',
      actor: 'cohort A · perspective B',
      tone: 'success' as const,
      label: 'acknowledged',
    },
    {
      stamp: '00:23',
      actor: 'facilitator',
      tone: 'brand' as const,
      label: 'round 2',
    },
  ];
  return (
    <div
      aria-hidden
      className="rounded-lg border border-line bg-surface-elevated p-4 font-sans md:p-5"
    >
      <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-ink-faint">
        Verified exchange · pilot-scoped
      </p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <li key={row.stamp} className="flex items-center gap-3">
            <span className="font-mono text-[0.7rem] tabular-nums text-ink-faint">{row.stamp}</span>
            <span className="min-w-0 flex-1 truncate font-mono text-[0.72rem] text-ink-secondary">
              {row.actor}
            </span>
            <StatusBadge tone={row.tone}>{row.label}</StatusBadge>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-divider pt-3">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-faint">
          Outcome released
        </span>
        <Link
          to={`/ledger/${DEMO_PROPOSAL_ID}`}
          className="font-mono text-[0.7rem] text-brand underline-offset-4 hover:underline"
        >
          2025-04-01 →
        </Link>
      </div>
    </div>
  );
}

/**
 * HeroFlowDiagram — full-width 3-step strip placed directly under the hero
 * text. Communicates the system in one glance:
 *
 *   Verified participants → Facilitator-led room → Public outcome
 *
 * Intentionally minimal and motion-free. Designed to reduce explanatory copy
 * needed above the fold. On narrow screens the steps stack vertically; the
 * connector becomes a thin vertical rule between cards.
 */
function HeroFlowDiagram() {
  return (
    <div
      aria-label="How SquadRidge works at a glance"
      className="rounded-lg border border-line bg-surface-secondary p-5 sm:p-6"
    >
      <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        How it flows
      </p>
      <ol className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch md:gap-3">
        {HERO_FLOW.map((step, i) => {
          const isLast = i === HERO_FLOW.length - 1;
          return (
            <Fragment key={step.number}>
              <li className="flex min-w-0 flex-col gap-2 rounded-md border border-line bg-surface-secondary p-4">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-teal/40 bg-teal/10 font-mono text-[0.65rem] font-semibold tabular-nums text-teal-light"
                  >
                    {step.number}
                  </span>
                  <p className="font-heading text-[0.92rem] font-semibold leading-snug text-landing-ink">
                    {step.label}
                  </p>
                </div>
                <p className="font-sans text-[0.82rem] leading-relaxed text-landing-body">
                  {step.detail}
                </p>
              </li>
              {!isLast ? (
                <li aria-hidden className="flex items-center justify-center md:px-1">
                  <span className="font-mono text-base text-slate-600 md:text-lg">→</span>
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}

function LandingPublicRecordPreview() {
  return (
    <div className="rounded-lg border border-line bg-surface-elevated p-5 font-sans sm:p-6">
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
        A public, timestamped outcome — not a transcript.
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {['consensus', 'pilot', 'facilitator-led'].map((t) => (
          <span
            key={t}
            className="rounded border border-line-strong bg-surface px-2 py-0.5 font-mono text-[0.62rem] text-slate-500"
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
        {/* 1. Hero — facilitator-first, 3-layer copy, flow diagram, proof strip */}
        <section
          className="col-span-12 border-b border-line px-gutter pb-16 pt-[7.5rem] md:pb-20 md:pt-28"
          aria-labelledby="hero-heading"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-14">
            <div className="min-w-0">
              <p className="mb-4 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Pilot-stage · Facilitator-led · Verified-anonymous dialogue
              </p>
              <h1
                id="hero-heading"
                className="max-w-[42rem] font-heading text-[clamp(1.85rem,4vw,2.65rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-landing-ink"
              >
                A pilot-stage trust platform for structured, facilitator-led cross-border cohorts.
              </h1>
              <p className="mt-6 max-w-[38rem] font-sans text-[1rem] leading-[1.65] text-landing-body">
                SquadRidge combines verified access, small-group matching, and safety-conscious
                workflows for institutions running sensitive dialogue programs — with a path to
                release citable outcomes without exposing the room.
              </p>
              <p className="mt-4 max-w-[38rem] font-sans text-[0.92rem] leading-relaxed text-slate-400">
                Built for team conflict, veteran dialogue, community mediation, and cross-border
                conversations where attribution is unsafe.
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
                  className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded border border-line-strong bg-transparent px-5 py-2.5 font-heading text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                >
                  View sample public record
                </Link>
              </div>
            </div>
            <div className="min-w-0 lg:pt-2">
              <LandingHeroLedgerPreview />
            </div>
          </div>

          {/* Hero flow diagram — full-width, sits directly below CTAs */}
          <div className="mt-12">
            <HeroFlowDiagram />
          </div>

          {/* Proof strip — labeled, not just chips */}
          <ul
            aria-label="Trust posture"
            className="mt-10 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TRUST_PROOFS.map((item) => (
              <li key={item.label} className="border-l-2 border-teal/40 pl-4">
                <p className="font-heading text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-landing-ink">
                  {item.label}
                </p>
                <p className="mt-1.5 font-sans text-[0.82rem] leading-relaxed text-slate-400">
                  {item.proof}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <hr className="sr-section-rule col-span-12" />

        {/* 2. Operational path — one controlled flow, eligibility to public outcome */}
        <FullBleed alt className="py-14 md:py-20" innerClassName="bg-transparent">
          <section id="operational-path" aria-labelledby="operational-heading">
            <SectionHeading id="operational-heading">
              One controlled path: from eligibility to a public outcome.
            </SectionHeading>

            <div className="mt-8">
              <Stepper
                ariaLabel="Operational path from eligibility to public outcome"
                steps={OPERATIONAL_STEPS}
              />
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
              {PROOF_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="border border-line bg-surface-secondary p-5 md:p-6"
                >
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

        {/* 3. How it works — facilitator framing: scope → convene → release */}
        <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
          <section id="how-it-works" aria-labelledby="how-heading">
            <SectionHeading id="how-heading">How it works</SectionHeading>
            <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-relaxed text-slate-400">
              Three beats the facilitator controls — what the room is for, who is in it, and what is
              allowed to leave.
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

        <hr className="sr-section-rule col-span-12" />

        {/* 4. Why standard tools break down — 3-row aligned contrast matrix */}
        <FullBleed alt className="py-14 md:py-20" innerClassName="bg-transparent">
          <section aria-labelledby="compare-heading">
            <SectionHeading id="compare-heading">Why standard tools break down</SectionHeading>
            <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-relaxed text-slate-400">
              SquadRidge is not a Slack, Discord, or Zoom alternative. The structure of the problem
              is different, so the structure of the tool is different.
            </p>

            <div className="mt-10 overflow-hidden border border-line">
              {/* Header row */}
              <div className="hidden grid-cols-[minmax(11rem,0.9fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-line md:grid">
                <div className="border-r border-line p-4">
                  <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Axis
                  </p>
                </div>
                <div className="border-r border-line p-4">
                  <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Standard tools
                  </p>
                </div>
                <div className="bg-surface-secondary p-4">
                  <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-teal/80">
                    SquadRidge
                  </p>
                </div>
              </div>

              {/* Rows */}
              {CONTRAST_ROWS.map((row, i) => (
                <div
                  key={row.axis}
                  className={`grid gap-0 md:grid-cols-[minmax(11rem,0.9fr)_minmax(0,1fr)_minmax(0,1fr)] ${i > 0 ? 'border-t border-line' : ''}`}
                >
                  <div className="border-b border-line p-5 md:border-b-0 md:border-r md:p-6">
                    <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500 md:hidden">
                      Axis
                    </p>
                    <p className="mt-1 font-heading text-[0.95rem] font-semibold text-landing-ink md:mt-0">
                      {row.axis}
                    </p>
                  </div>
                  <div className="border-b border-line p-5 md:border-b-0 md:border-r md:p-6">
                    <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500 md:hidden">
                      Standard tools
                    </p>
                    <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-slate-400 md:mt-0">
                      {row.standard}
                    </p>
                  </div>
                  <div className="bg-surface-secondary p-5 md:p-6">
                    <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-teal/80 md:hidden">
                      SquadRidge
                    </p>
                    <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-landing-body md:mt-0">
                      {row.squadridge}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 max-w-copy font-sans text-[0.88rem] leading-relaxed text-slate-500">
              When participants cannot safely attach their names to the discussion, the
              infrastructure has to protect both access and outcome quality.
            </p>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* 5. Audiences — facilitators first, with a concrete example per row */}
        <FullBleed alt={false} className="py-14 md:py-20" innerClassName="bg-transparent">
          <section aria-labelledby="audiences-heading">
            <SectionHeading id="audiences-heading">Who this is built for</SectionHeading>
            <p className="mt-4 max-w-copy font-sans text-[0.95rem] leading-relaxed text-slate-400">
              SquadRidge is built first for the operators running sensitive sessions, not for
              general users.
            </p>
            <div className="mt-10 grid gap-6 md:gap-8">
              {AUDIENCES.map((audience) => (
                <article
                  key={audience.title}
                  className={`border bg-surface-secondary p-6 md:p-7 ${
                    audience.primary ? 'border-teal/40 bg-surface-secondary' : 'border-line'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-heading text-lg font-semibold text-landing-ink">
                      {audience.title}
                    </h3>
                    {audience.primary ? (
                      <span className="rounded border border-teal/40 bg-teal/10 px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-teal-light">
                        Primary audience
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-landing-body">
                    {audience.body}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-copy border-l-2 border-line-strong pl-4 font-sans text-[0.88rem] leading-relaxed text-slate-500">
              <span className="font-medium text-slate-400">Squad definition:</span> A squad is a
              small matched cohort, usually 4 to 8 participants, working through a shared problem
              with facilitator guidance.
            </p>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* 6. Security and privacy — pull-quote elevated */}
        <FullBleed alt className="py-14 md:py-20" innerClassName="bg-transparent">
          <section aria-labelledby="security-heading">
            <SectionHeading id="security-heading">Security and privacy</SectionHeading>

            <blockquote className="mt-8 max-w-copy border-l-2 border-teal pl-5 font-heading text-[1.15rem] font-semibold leading-snug tracking-tight text-landing-ink md:text-[1.3rem]">
              This is not privacy as branding. It is privacy as a structural constraint on what the
              system is allowed to reveal.
            </blockquote>

            <ul className="mt-10 max-w-copy space-y-5 font-sans text-[0.95rem] leading-relaxed text-landing-body">
              <li className="border-l border-slate-600 pl-4">
                Eligibility and access controls can be enforced without exposing identity inside the
                room.
              </li>
              <li className="border-l border-slate-600 pl-4">
                Session participation and public release are separated by explicit disclosure
                boundaries.
              </li>
              <li className="border-l border-slate-600 pl-4">
                Public records expose outcomes — not room-level discussion, attribution, or
                participant identity.
              </li>
            </ul>

            <Link
              to="/security"
              className="focus-ring mt-8 inline-flex min-h-[44px] items-center border border-line-strong bg-transparent px-5 py-2.5 font-heading text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
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
              A strong session can leave a public record worth citing
            </SectionHeading>
            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start lg:gap-12">
              <div className="min-w-0 space-y-4">
                <p className="max-w-copy font-sans text-[0.98rem] leading-[1.7] text-landing-body">
                  Sensitive dialogue should not vanish when the meeting ends. When a cohort reaches
                  a result approved for release, SquadRidge publishes it as a public, anonymous,
                  timestamped record — not a transcript, but an outcome others can cite, review, and
                  build from.
                </p>
                <p className="max-w-copy font-sans text-[0.9rem] leading-relaxed text-slate-500">
                  The goal is not only safer conversation. It is durable, credible output.
                </p>
              </div>
              <div className="flex min-w-0 flex-col gap-4">
                <LandingPublicRecordPreview />
                <Link
                  to={`/ledger/${DEMO_PROPOSAL_ID}`}
                  className="focus-ring inline-flex min-h-[44px] w-full items-center justify-center border border-line-strong bg-surface-elevated px-5 py-2.5 font-heading text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-surface-hover lg:w-auto"
                >
                  Open sample public record
                </Link>
              </div>
            </div>
          </section>
        </FullBleed>

        <hr className="sr-section-rule col-span-12" />

        {/* 8. Pilot access — preface card with "if accepted" benefits + form */}
        <FullBleed alt className="py-14 md:pb-20" innerClassName="bg-transparent">
          <div className="mx-auto max-w-copy">
            <section aria-labelledby="pilot-benefits-heading" className="mb-8">
              <div className="border border-teal/30 bg-surface-secondary p-6 md:p-7">
                <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-teal-light">
                  If we are a fit
                </p>
                <h2
                  id="pilot-benefits-heading"
                  className="mt-3 font-heading text-xl font-semibold leading-snug tracking-tight text-landing-ink md:text-2xl"
                >
                  What you get when accepted
                </h2>
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
                <p className="mt-6 border-t border-line pt-5 font-sans text-[0.9rem] leading-relaxed text-slate-300">
                  <span className="font-semibold text-landing-ink">No public profile.</span>{' '}
                  <span className="font-semibold text-landing-ink">No open directory.</span> Just
                  direct outreach when the right pilot is ready.
                </p>
              </div>
            </section>

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
