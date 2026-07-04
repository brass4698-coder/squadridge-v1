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
    others: 'Full transcript exposed by default.',
  },
  {
    aspect: 'Participant identity',
    squadridge: 'Verified, not disclosed.',
    others: 'Searchable and indexed.',
  },
  {
    aspect: 'Public surface',
    squadridge: 'Approved outcome text only.',
    others: 'Everything, unless muted.',
  },
  {
    aspect: 'Release authority',
    squadridge: 'Facilitator-signed.',
    others: 'Platform defaults.',
  },
  {
    aspect: 'Auditability',
    squadridge: 'Verification anchor per record.',
    others: 'None.',
  },
];

const LIFECYCLE = [
  {
    number: '01',
    icon: Settings,
    label: 'Configure',
    body: 'Set eligibility, verification, and ground rules up front so a session cannot be hijacked midstream.',
  },
  {
    number: '02',
    icon: ShieldCheck,
    label: 'Verify',
    body: 'Confirm each participant privately. No identity ever surfaces on a public record.',
  },
  {
    number: '03',
    icon: MessageSquare,
    label: 'Facilitate',
    body: 'Run structured dialogue in a protected room. No transcript is generated for the public.',
  },
  {
    number: '04',
    icon: FileCheck,
    label: 'Release',
    body: 'Co-write the outcome, capture approvals, publish with a cryptographic anchor.',
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
      <CredibilityBadge />
      <WhySection />
      <LifecycleSection />
      <UseCasesSection />
      <SecuritySection />
      <LedgerPreviewSection />
      <PilotAccessSection />
      <ClosingNote />
    </div>
  );
}

// ------------------------------------------------------------
// 1. Hero — two-column, single proof, dominant CTA
// ------------------------------------------------------------
function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-6 pb-16 pt-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-16 md:pb-24 md:pt-28">
      <div className="animate-fade-in-up">
        <SectionEyebrow>Verified dialogue for high-stakes sessions</SectionEyebrow>
        <h1 className="text-h1 md:text-display" style={{ color: 'var(--sr-ink)' }}>
          The room stays protected. The outcome is verifiable.
        </h1>
        <p
          className="mt-5 max-w-xl text-base leading-relaxed"
          style={{ color: 'var(--sr-ink-secondary)' }}
        >
          SquadRidge runs facilitated sessions on protected rooms, then releases the approved
          outcome with a cryptographic anchor. Everything else stays private.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/request-access" className="btn-pill btn-pill--primary text-sm">
            Request pilot access
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            to="/how-it-works"
            className="text-sm font-medium underline-offset-4 transition-opacity hover:underline hover:opacity-70"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            See how it works
          </Link>
        </div>
      </div>

      <div className="animate-fade-in-up-delayed">
        <SplitPanelVisual size="hero" />
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 2. Single credibility badge — mentioned ONCE
// ------------------------------------------------------------
function CredibilityBadge() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] justify-center px-6 pb-12 md:pb-16">
      <div
        className="flex flex-wrap items-center gap-3 rounded-full border px-5 py-2.5 text-xs"
        style={{
          borderColor: 'var(--sr-line)',
          background: 'var(--sr-bg-elevated)',
          color: 'var(--sr-ink-secondary)',
        }}
      >
        <span
          aria-hidden
          className="inline-flex h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--sr-primary)' }}
        />
        <span>In pilot with regional mediation centres and cross-border teams</span>
      </div>
    </div>
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
            The room and the record are two different objects. Only the record surfaces publicly,
            and only after facilitator-signed release.
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

        <SplitPanelVisual
          size="compact"
          privateHeading="Inside the room"
          privateItems={[
            'Live message stream',
            'Real names + verification data',
            'Facilitator notes',
          ]}
          publicHeading="Released as record"
          publicItems={['Approved outcome text', 'Cryptographic anchor', 'Participant count only']}
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
            This is what a public record looks like.
          </h2>
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
            Start the process.
          </h2>
          <p
            className="mt-4 max-w-md text-base leading-relaxed"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            Three fields to open a conversation. If your use case is a match, we send a full
            qualification questionnaire next.
          </p>
          <p className="mt-6 text-xs" style={{ color: 'var(--sr-ink-faint)' }}>
            Ideal for facilitators and organisations running three or more high-stakes sessions per
            year. Every application is reviewed personally — no automated approvals.
          </p>
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
              {state === 'submitting' ? 'Submitting…' : 'Start the conversation'}
            </button>
            <p className="text-center text-xs" style={{ color: 'var(--sr-ink-faint)' }}>
              Longer, verified applications on the full{' '}
              <Link
                to="/request-access"
                className="underline-offset-4 hover:underline"
                style={{ color: 'var(--sr-primary)' }}
              >
                request-access page
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

// ------------------------------------------------------------
// Closing note — quiet, single-line
// ------------------------------------------------------------
function ClosingNote() {
  return (
    <footer className="border-t py-10" style={{ borderColor: 'var(--sr-divider)' }}>
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <p className="text-xs" style={{ color: 'var(--sr-ink-faint)' }}>
          SquadRidge is not a public forum. It is invitation-only, facilitator-run dialogue with a
          verifiable release step.
        </p>
      </div>
    </footer>
  );
}
