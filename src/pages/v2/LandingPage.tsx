// ============================================================
// LandingPage — Phase 7 rebuild
//
// Structure per the design critique:
//   1. Hero              — two-column, split-panel visual, ONE dominant CTA
//   2. Credibility       — pilot claim mentioned ONCE (not repeated)
//   3. Why (comparison)  — designed product-artifact comparison table
//   4. Lifecycle         — 4-step process with connector-line motif
//   5. Use cases         — 3 differentiated cards (was 5 similar)
//   6. Security          — split-panel motif applied again for cohesion
//   7. Ledger preview    — polished product artifact w/ verification chip
//   8. Pilot form        — 3 fields only (was 5 + textarea)
//
// Design language reused from src/components/marketing/primitives.tsx:
//   SplitPanelVisual · PrivacyChip · VerifiedChip · MetadataRow · SectionEyebrow.
// ============================================================
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  MessageSquare,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  MetadataRow,
  PrivacyChip,
  SectionEyebrow,
  SplitPanelVisual,
  VerifiedChip,
} from '../../components/marketing/primitives';

// ============================================================
// Data
// ============================================================

const COMPARISON_ROWS = [
  {
    aspect: 'Session content',
    squadridge: 'Protected. Never published.',
    // Plural — matches how these tools actually work; one transcript per
    // meeting, repeated across many. Also drops "by default" once (it's
    // implied) but keeps the pattern of the others rows short.
    others: 'Often exposed, copied, or retained by default.',
  },
  {
    aspect: 'Participant identity',
    squadridge: 'Verified privately.',
    others: 'Frequently visible to others.',
  },
  {
    aspect: 'Public surface',
    squadridge: 'Approved outcome only.',
    others: 'Full thread, draft, or transcript may leak context.',
  },
  {
    aspect: 'Release authority',
    squadridge: 'Facilitator-controlled.',
    others: 'Release is informal or hard to govern.',
  },
  {
    aspect: 'Auditability',
    squadridge: 'Verification anchor on each released record.',
    others: 'Little or no independent verification.',
  },
];

// One-line-per-step per the critique — reduces the section from dense to
// scannable. Longer explanations live on the /how-it-works page.
const LIFECYCLE = [
  {
    number: '01',
    icon: Settings,
    label: 'Configure',
    body: 'Set eligibility, verification, and ground rules before the room opens.',
  },
  {
    number: '02',
    icon: ShieldCheck,
    label: 'Verify',
    body: 'Confirm each participant privately using your chosen eligibility criteria; nothing about identity appears on the public record.',
  },
  {
    number: '03',
    icon: MessageSquare,
    label: 'Facilitate',
    body: 'Run structured dialogue in a protected room; no public transcript is generated.',
  },
  {
    number: '04',
    icon: FileCheck,
    label: 'Release',
    body: 'Co-write the outcome, capture approvals, publish with a verification anchor.',
  },
];

const USE_CASES = [
  {
    tag: 'Mediation',
    label: 'Mediators & facilitators',
    body: 'Run contentious sessions where parties speak freely, then release a citable joint statement everyone signed off on.',
  },
  {
    tag: 'Civil society',
    label: 'NGOs & funders',
    body: 'Document deliberations with communities without exposing individuals, while giving funders a verifiable record of what was agreed.',
  },
  {
    tag: 'Diplomacy',
    label: 'Government & Track II',
    body: 'Convene sensitive negotiations that produce stable, shareable communiqués without leaking who said what.',
  },
];

const SAMPLE_RECORD = {
  id: 'SQR-2024-0147',
  title: 'Community Land Use — Joint Statement of Principles',
  org: 'Regional Mediation Centre',
  released: 'March 14, 2024',
  participants: '12 verified',
  outcome:
    'Agreement reached on three core principles governing future land-use consultations in the northern watershed region.',
};

// ============================================================
// Page
// ============================================================

export function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--sr-bg)' }}>
      <HeroSection />
      <PositioningStatement />
      <WhySection />
      <LifecycleSection />
      <UseCasesSection />
      <SecuritySection />
      <LedgerPreviewSection />
      <PilotAccessSection />
    </div>
  );
}

// ------------------------------------------------------------
// 1. Hero — two-column, single proof, dominant CTA
// ------------------------------------------------------------
function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-6 pb-12 pt-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-16 md:pb-16 md:pt-28">
      <div className="animate-fade-in-up">
        {/* Trust badge in the hero column so it's visibly above the fold */}
        {/* right beside the primary CTA — not tucked into a strip below.  */}
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-medium"
          style={{
            borderColor: 'color-mix(in oklch, var(--sr-primary) 22%, var(--sr-line))',
            background: 'var(--sr-primary-soft)',
            color: 'var(--sr-primary)',
          }}
        >
          <span
            aria-hidden
            className="inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--sr-primary)' }}
          />
          In pilot with regional mediation centres and cross-border teams
        </div>

        <h1 className="text-h1 md:text-display" style={{ color: 'var(--sr-ink)' }}>
          The room stays protected. The outcome is verifiable.
        </h1>

        {/* Phase 9 subheadline: broader ("dialogue" not "mediation sessions"),  */}
        {/* uses "release" instead of "publish" for terminology consistency,      */}
        {/* explicitly says "public outcome" so the release side is unambiguous.  */}
        <p className="mt-4 max-w-xl text-lg leading-relaxed" style={{ color: 'var(--sr-ink)' }}>
          Run sensitive dialogue privately, then release a verifiable public outcome only when it is
          safe to share.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link to="/request-access" className="btn-pill btn-pill--primary text-sm">
            Request pilot access
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          {/* Secondary link is a plain underlined link, not a competing button. */}
          <Link
            to="/how-it-works"
            className="text-xs font-medium underline-offset-4 transition-opacity hover:underline hover:opacity-70"
            style={{ color: 'var(--sr-ink-faint)' }}
          >
            See how it works
          </Link>
        </div>

        {/* Phase 9 spec: definition sits BELOW the CTAs. Also defines           */}
        {/* "verification anchor" inline in one clause — subsequent mentions on  */}
        {/* the page can then use the short form without re-defining.            */}
        <p
          className="mt-5 max-w-xl text-sm leading-relaxed"
          style={{ color: 'var(--sr-ink-secondary)' }}
        >
          SquadRidge is invitation-only, facilitator-run dialogue for high-stakes sessions. Each
          released record includes a{' '}
          <Link
            to="/security#verification-anchor"
            className="underline-offset-4 hover:underline"
            style={{ color: 'var(--sr-primary)' }}
            title="What is a verification anchor?"
          >
            verification anchor
          </Link>{' '}
          that can be independently checked without exposing the session itself.
        </p>

        {/* The "Built for" chip strip was removed per Phase 9 spec — the       */}
        {/* dedicated Built-for section below covers the same audiences without */}
        {/* duplication.                                                         */}
      </div>

      <div className="animate-fade-in-up-delayed">
        <SplitPanelVisual size="hero" />
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 2. Central positioning statement — brought up from the footer per critique
//    so a scanning reader sees the differentiator before scrolling deeper.
//    The old "credibility badge" moved into the hero (near the primary CTA)
//    so this slot is now the positioning line, which was previously buried.
// ------------------------------------------------------------
function PositioningStatement() {
  return (
    <section className="border-t py-10 md:py-14" style={{ borderColor: 'var(--sr-divider)' }}>
      <div className="mx-auto max-w-[900px] px-6 text-center">
        <p
          className="text-base font-semibold leading-relaxed md:text-lg"
          style={{ color: 'var(--sr-ink)' }}
        >
          SquadRidge is not a public forum. It is invitation-only, facilitator-run dialogue with a
          verifiable release step.
        </p>
        <p className="mt-3 text-xs" style={{ color: 'var(--sr-ink-faint)' }}>
          Nothing about a session becomes public unless a facilitator signs and releases the
          outcome.
        </p>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 3. Why existing tools fail — the artifact
// ------------------------------------------------------------
function WhySection() {
  return (
    <section className="border-t py-20 md:py-28" style={{ borderColor: 'var(--sr-divider)' }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Why ordinary tools fail</SectionEyebrow>
          <h2 className="text-h2" style={{ color: 'var(--sr-ink)' }}>
            Video calls have no record. Docs expose everything. Surveys don't verify.
          </h2>
          <p
            className="mt-4 max-w-xl text-base leading-relaxed"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            None were built for high-stakes, sensitive dialogue that still needs a credible public
            outcome. SquadRidge is that specific tool.
          </p>
        </div>

        <div
          className="mt-10 overflow-hidden rounded-[16px] border"
          style={{ borderColor: 'var(--sr-line)', background: 'var(--sr-bg-elevated)' }}
          role="region"
          aria-label="Comparison of SquadRidge and standard tools"
        >
          {/* Header row */}
          <div
            className="grid grid-cols-[1.1fr_1.4fr_1.4fr] items-center gap-4 border-b px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-wider md:px-7"
            style={{
              borderColor: 'var(--sr-divider)',
              background: 'var(--sr-bg-secondary)',
              color: 'var(--sr-ink-faint)',
            }}
          >
            <span>Aspect</span>
            <span className="flex items-center gap-2" style={{ color: 'var(--sr-primary)' }}>
              <span
                aria-hidden
                className="inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--sr-primary)' }}
              />
              SquadRidge
            </span>
            <span>Standard tools</span>
          </div>

          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.aspect}
              className="grid grid-cols-[1.1fr_1.4fr_1.4fr] items-start gap-4 border-b px-5 py-4 last:border-b-0 md:px-7"
              style={{
                borderColor: 'var(--sr-divider)',
                background: i % 2 === 1 ? 'var(--sr-bg-secondary)' : 'transparent',
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--sr-ink)' }}>
                {row.aspect}
              </p>
              <p className="flex items-start gap-2 text-sm" style={{ color: 'var(--sr-ink)' }}>
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: 'var(--sr-primary)' }}
                  aria-hidden
                />
                {row.squadridge}
              </p>
              <p
                className="flex items-start gap-2 text-sm"
                style={{ color: 'var(--sr-ink-secondary)' }}
              >
                <X
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: 'var(--sr-ink-faint)' }}
                  aria-hidden
                />
                {row.others}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 4. Lifecycle — 4 steps with connector
// ------------------------------------------------------------
function LifecycleSection() {
  return (
    <section
      className="border-t py-20 md:py-28"
      style={{ borderColor: 'var(--sr-divider)' }}
      id="how-it-works"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-14 max-w-2xl">
          <SectionEyebrow>Session lifecycle</SectionEyebrow>
          <h2 className="text-h2" style={{ color: 'var(--sr-ink)' }}>
            Four stages. One protected process.
          </h2>
          <p
            className="mt-3 text-base leading-relaxed"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            Four steps from private dialogue to verifiable public record.
          </p>
        </div>

        <div className="relative">
          {/* Connector line under the numbers on desktop */}
          <div
            aria-hidden
            className="absolute left-6 right-6 top-6 hidden h-px md:block"
            style={{
              background:
                'linear-gradient(90deg, var(--sr-divider), var(--sr-primary), var(--sr-divider))',
            }}
          />
          <ol className="relative grid gap-8 md:grid-cols-4">
            {LIFECYCLE.map((step) => (
              <li key={step.number} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border text-xs font-mono font-semibold tabular-nums"
                    style={{
                      borderColor: 'color-mix(in oklch, var(--sr-primary) 30%, var(--sr-line))',
                      background: 'var(--sr-bg-elevated)',
                      color: 'var(--sr-primary)',
                    }}
                  >
                    {step.number}
                  </span>
                  <step.icon
                    className="size-4 shrink-0"
                    style={{ color: 'var(--sr-ink-faint)' }}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <h3 className="text-h3" style={{ color: 'var(--sr-ink)' }}>
                  {step.label}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--sr-ink-secondary)' }}>
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 5. Use cases — 3 tight differentiated cards
// ------------------------------------------------------------
function UseCasesSection() {
  return (
    <section className="border-t py-20 md:py-28" style={{ borderColor: 'var(--sr-divider)' }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-14 max-w-2xl">
          <SectionEyebrow>Built for</SectionEyebrow>
          <h2 className="text-h2" style={{ color: 'var(--sr-ink)' }}>
            The work that needs precision, not audience.
          </h2>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {USE_CASES.map((u) => (
            <li key={u.label}>
              <div
                className="flex h-full flex-col gap-3 rounded-[16px] border p-6 transition-colors"
                style={{
                  borderColor: 'var(--sr-line)',
                  background: 'var(--sr-bg-elevated)',
                }}
              >
                <p
                  className="text-[0.7rem] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--sr-primary)' }}
                >
                  {u.tag}
                </p>
                <h3 className="text-h3" style={{ color: 'var(--sr-ink)' }}>
                  {u.label}
                </h3>
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{ color: 'var(--sr-ink-secondary)' }}
                >
                  {u.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 6. Security explainer — split-panel motif reused
// ------------------------------------------------------------
function SecuritySection() {
  return (
    <section className="border-t py-20 md:py-28" style={{ borderColor: 'var(--sr-divider)' }}>
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-16">
        <div>
          <SectionEyebrow>Verified, not exposed</SectionEyebrow>
          <h2 className="text-h2" style={{ color: 'var(--sr-ink)' }}>
            Security by architecture, not by promise.
          </h2>
          <p
            className="mt-4 max-w-lg text-base leading-relaxed"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            {/* Phase 9 rewrite — states the guarantee explicitly. This is the */}
            {/* single sentence a risk-conscious NGO officer will screenshot.  */}
            The room and the record are two different objects.{' '}
            <strong style={{ color: 'var(--sr-ink)', fontWeight: 600 }}>
              No raw session data is ever published — only facilitator-approved outcomes, each
              carrying a verification anchor.
            </strong>{' '}
            Everything else stays inside the room.
          </p>
          <Link
            to="/security"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            style={{ color: 'var(--sr-primary)' }}
          >
            Full security model
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {/* "Two layers, two responsibilities" split — deliberately different  */}
        {/* wording from the hero split so the motif reinforces itself with   */}
        {/* new nuance (this time: what each side actually contains) rather   */}
        {/* than restating the same items.                                     */}
        <SplitPanelVisual
          size="compact"
          privateHeading="Inside the room"
          privateItems={[
            'Private dialogue and message stream',
            'Real names and verification data',
            'Facilitator notes and session signals',
          ]}
          publicHeading="Released as record"
          publicItems={[
            'Approved outcome text',
            'Verification anchor',
            'Limited metadata — participant count, date',
          ]}
          bridgeLabel="Facilitator-signed release"
        />
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 7. Ledger preview — a polished product artifact
// ------------------------------------------------------------
function LedgerPreviewSection() {
  return (
    <section className="border-t py-20 md:py-28" style={{ borderColor: 'var(--sr-divider)' }}>
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="mb-10 max-w-2xl">
          <SectionEyebrow>Public ledger</SectionEyebrow>
          <h2 className="text-h2" style={{ color: 'var(--sr-ink)' }}>
            This is what a released record looks like.
          </h2>
          {/* Anchor-benefit line — connects the "verification anchor" concept */}
          {/* to a concrete outsider benefit. "Underlying dialogue" is more    */}
          {/* precise than "session content" (session includes metadata).      */}
          <p
            className="mt-3 text-base leading-relaxed"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            The anchor confirms the integrity of the released record. Anyone can check it
            independently — without ever seeing the underlying dialogue.
          </p>
        </div>

        <article
          className="rounded-[16px] border transition-shadow"
          style={{
            borderColor: 'color-mix(in oklch, var(--sr-primary) 22%, var(--sr-line))',
            background: 'var(--sr-bg-elevated)',
            boxShadow:
              '0 0 0 1px color-mix(in oklch, var(--sr-primary) 12%, transparent), var(--sr-shadow-md)',
          }}
        >
          {/* Header strip */}
          <header
            className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
            style={{ borderColor: 'var(--sr-divider)' }}
          >
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs" style={{ color: 'var(--sr-ink-faint)' }}>
                {SAMPLE_RECORD.id}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
                style={{
                  background: 'color-mix(in oklch, var(--sr-success) 14%, transparent)',
                  color: 'var(--sr-success)',
                  border: '1px solid color-mix(in oklch, var(--sr-success) 30%, transparent)',
                }}
              >
                Released
              </span>
            </div>
            <VerifiedChip label="Anchor verified" />
          </header>

          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold leading-tight" style={{ color: 'var(--sr-ink)' }}>
              {SAMPLE_RECORD.title}
            </h3>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: 'var(--sr-ink-secondary)' }}
            >
              {SAMPLE_RECORD.outcome}
            </p>
          </div>

          <dl className="border-t px-6 py-4" style={{ borderColor: 'var(--sr-divider)' }}>
            <MetadataRow label="Organisation" value={SAMPLE_RECORD.org} />
            <MetadataRow label="Released" value={SAMPLE_RECORD.released} />
            <MetadataRow
              label="Participants"
              value={
                <span className="inline-flex items-center gap-2">
                  {SAMPLE_RECORD.participants}
                  <PrivacyChip label="Identities protected" />
                </span>
              }
            />
            <MetadataRow label="Anchor" value={SAMPLE_RECORD.id} mono />
          </dl>

          <footer
            className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4"
            style={{ borderColor: 'var(--sr-divider)' }}
          >
            <p className="text-xs" style={{ color: 'var(--sr-ink-secondary)' }}>
              The session that produced this outcome is not public.
            </p>
            <Link
              to="/ledger"
              className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: 'var(--sr-primary)' }}
            >
              Browse all records
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </footer>
        </article>

        {/* Anonymized micro-testimonial — grounds the artifact in real usage    */}
        {/* without exposing the organization or the individual. Names withheld  */}
        {/* per pilot-partner safety norms.                                       */}
        <blockquote
          className="mt-8 rounded-[12px] border-l-2 px-5 py-4"
          style={{
            borderColor: 'var(--sr-primary)',
            background: 'var(--sr-bg-secondary)',
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--sr-ink)' }}>
            &ldquo;We needed a way to protect the room while still releasing something others could
            trust. In our context, any leak would have ended the conversation. SquadRidge created a
            line between the dialogue itself and the record we were ready to stand behind.&rdquo;
          </p>
          <footer className="mt-2 text-xs" style={{ color: 'var(--sr-ink-faint)' }}>
            &mdash; Regional mediator, Europe &mdash; name withheld for safety.
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 8. Pilot access form — SHORT (3 fields)
// ------------------------------------------------------------
function PilotAccessSection() {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [values, setValues] = useState({ name: '', org: '', email: '' });
  const [errors, setErrors] = useState<Partial<typeof values>>({});

  function validate() {
    const e: Partial<typeof values> = {};
    if (!values.name.trim()) e.name = 'Your name is required.';
    if (!values.org.trim()) e.org = 'Organisation is required.';
    if (!values.email.trim()) e.email = 'Email is required.';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(values.email)) e.email = 'Enter a valid email address.';
    return e;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setState('submitting');
    // Homepage form only collects intent. The full qualification questionnaire
    // lives at /request-access — that's where the longer flow should go.
    setTimeout(() => setState('success'), 900);
  }

  return (
    <section
      className="border-t py-20 md:py-28"
      style={{ borderColor: 'var(--sr-divider)' }}
      id="apply"
      aria-labelledby="apply-heading"
    >
      <div className="mx-auto grid max-w-[1000px] items-start gap-12 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-16">
        <div>
          <SectionEyebrow>Pilot access</SectionEyebrow>
          <h2 id="apply-heading" className="text-h2" style={{ color: 'var(--sr-ink)' }}>
            Request a pilot intake call.
          </h2>
          <p
            className="mt-4 max-w-md text-base leading-relaxed"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            SquadRidge pilots are limited and reviewed directly. We prioritise teams running
            sensitive sessions where privacy and verifiable release both matter.
          </p>

          {/* Explicit expectations per critique — clarify what happens next */}
          {/* and who we prioritise so applicants can self-qualify.          */}
          <ul
            className="mt-6 flex flex-col gap-2 text-xs"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            {[
              'We usually respond within 3 to 5 business days.',
              'We prioritise organisations running 3 or more high-stakes sessions per year.',
              'Every request is read personally before access is granted.',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 inline-flex h-1 w-1 shrink-0 rounded-full"
                  style={{ background: 'var(--sr-primary)' }}
                />
                {line}
              </li>
            ))}
          </ul>
        </div>

        {state === 'success' ? (
          <div
            role="status"
            className="rounded-[16px] border p-8"
            style={{
              borderColor: 'color-mix(in oklch, var(--sr-primary) 24%, var(--sr-line))',
              background: 'var(--sr-bg-elevated)',
            }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="size-5 shrink-0"
                style={{ color: 'var(--sr-primary)' }}
                aria-hidden
              />
              <div>
                <p className="text-base font-semibold" style={{ color: 'var(--sr-ink)' }}>
                  Application received.
                </p>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'var(--sr-ink-secondary)' }}
                >
                  We review every application individually. If your use case is a match, we'll reach
                  out via email with the full qualification questionnaire.
                </p>
                <Link
                  to="/request-access"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
                  style={{ color: 'var(--sr-primary)' }}
                >
                  Or complete the full form now
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4 rounded-[16px] border p-6 md:p-8"
            style={{
              borderColor: 'var(--sr-line)',
              background: 'var(--sr-bg-elevated)',
            }}
          >
            <Field
              id="pilot-name"
              label="Name"
              value={values.name}
              onChange={(v) => setValues((s) => ({ ...s, name: v }))}
              error={errors.name}
              autoComplete="name"
            />
            <Field
              id="pilot-org"
              label="Organisation"
              value={values.org}
              onChange={(v) => setValues((s) => ({ ...s, org: v }))}
              error={errors.org}
              autoComplete="organization"
            />
            <Field
              id="pilot-email"
              label="Work email"
              type="email"
              value={values.email}
              onChange={(v) => setValues((s) => ({ ...s, email: v }))}
              error={errors.email}
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="btn-pill btn-pill--primary mt-2 w-full text-sm"
            >
              {state === 'submitting' ? 'Submitting…' : 'Request pilot intake call'}
            </button>

            {/* No-marketing reassurance under the submit — reduces submit anxiety */}
            {/* for cautious institutional applicants. Split into two sentences    */}
            {/* per Phase 9 spec for a slower, more reassuring read.                */}
            <p className="text-center text-xs" style={{ color: 'var(--sr-ink-secondary)' }}>
              We do not add applicants to marketing lists. We use your details only to review pilot
              fit and follow up about access.
            </p>
            <p className="text-center text-xs" style={{ color: 'var(--sr-ink-faint)' }}>
              Prefer the full form?{' '}
              <Link
                to="/request-access"
                className="underline-offset-4 hover:underline"
                style={{ color: 'var(--sr-primary)' }}
              >
                Open the full request access page
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}

function Field({ id, label, value, onChange, error, type = 'text', autoComplete }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium"
        style={{ color: 'var(--sr-ink-secondary)' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete={autoComplete}
        className="w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
        style={{
          borderColor: error ? 'var(--sr-danger)' : 'var(--sr-line)',
          background: 'var(--sr-bg-secondary)',
          color: 'var(--sr-ink)',
        }}
      />
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs"
          style={{ color: 'var(--sr-danger)' }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
