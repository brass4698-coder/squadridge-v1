import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { appRoutes } from '../../lib/appRoutes';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';
import { isDemoLoginEnabled } from '../../lib/demoLogin';
import { cn } from '../../lib/cn';

const STORAGE_KEY = 'sr_facilitator_walkthrough_dismissed';
const STEP_KEY = 'sr_facilitator_walkthrough_step';

type WalkStep = {
  id: string;
  phase: string;
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
  tip?: string;
};

const STEPS: WalkStep[] = [
  {
    id: 'configure',
    phase: 'Configure',
    title: 'Create a governed room',
    body: 'Start with the NGO internal deliberation template. Leave public ledger publish unchecked for your first private anchored release.',
    href: appRoutes.sessionNew,
    hrefLabel: 'New session setup',
    tip: 'Eligibility notes stay internal — they are not shown to participants.',
  },
  {
    id: 'invite',
    phase: 'Invite',
    title: 'Issue participant credentials',
    body: 'Add each party with a codename. Copy the unique /p/invite link — it is a bearer secret (default 72h). Do not forward on insecure channels.',
    href: appRoutes.sessions,
    hrefLabel: 'Open sessions list',
    tip: 'Participant email OTP is not automated in pilot — the invite link is the handoff.',
  },
  {
    id: 'verify',
    phase: 'Verify',
    title: 'Review and approve participants',
    body: 'Open participant review for the session. Approve only when materials and fit match your MOU. You cannot open the live room until required participants are verified.',
    href: appRoutes.participants,
    hrefLabel: 'Participants index',
    tip: 'Facilitator review is authoritative — this is not automated KYC.',
  },
  {
    id: 'facilitate',
    phase: 'Facilitate',
    title: 'Run the private written room',
    body: 'Open the control surface when everyone is verified. Dialogue stays in the room. Agree an off-platform immediate-danger protocol before you start — there is no in-room crisis alert in v2.',
    href: appRoutes.sessions,
    hrefLabel: 'Sessions → Control',
    tip: 'Use Slow down / Pull back pacing tools when tension rises.',
  },
  {
    id: 'outcome',
    phase: 'Draft',
    title: 'Author the outcome — never import chat',
    body: 'Draft summary, agreed terms, and pending items yourself. There is no “import from room” path; the record must not contain verbatim dialogue.',
    tip: 'Approvals are process metadata, not cryptographic party signatures.',
  },
  {
    id: 'release',
    phase: 'Release',
    title: 'Pass the release gate deliberately',
    body: 'Record approvals, then release. Default NGO pilots keep the anchored memo private. Public ledger publish needs partner consent and produces a verifiable ledger_sha.',
    href: appRoutes.releaseGate,
    hrefLabel: 'Release gate queue',
    tip: 'Export the session audit trail (metadata only) after close for diligence.',
  },
  {
    id: 'participant',
    phase: 'Participant path',
    title: 'What invitees experience',
    body: 'Invite → verify materials → consent → briefing → waiting → room. Share that sequence with partners so they know verification is facilitator-gated.',
    tip: 'Abort if the participant token path fails or confidentiality assumptions diverge from the MOU.',
  },
];

function readStepIndex(): number {
  try {
    const raw = localStorage.getItem(STEP_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    if (Number.isFinite(n) && n >= 0 && n < STEPS.length) return n;
  } catch {
    /* ignore */
  }
  return 0;
}

/**
 * Interactive Configure → Verify → Facilitate → Release walkthrough for live pilots.
 * Distinct from the scripted DemoWalkthrough (seeded product tour).
 */
export function FacilitatorWalkthrough() {
  const { startWalkthrough } = useDemoWalkthrough();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [index, setIndex] = useState(readStepIndex);
  const [restarted, setRestarted] = useState(false);

  if (dismissed && !restarted) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--sr-radius-lg)] border border-line bg-surface-elevated/80 px-4 py-3">
        <p className="m-0 text-sm text-ink-secondary">
          Pilot walkthrough dismissed.{' '}
          <button
            type="button"
            className="text-brand underline-offset-2 hover:underline"
            onClick={() => {
              try {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.setItem(STEP_KEY, '0');
              } catch {
                /* ignore */
              }
              setIndex(0);
              setRestarted(true);
              setDismissed(false);
            }}
          >
            Restart guide
          </button>
        </p>
        {isDemoLoginEnabled() ? (
          <button
            type="button"
            className="btn-institutional btn-institutional--ghost text-xs"
            onClick={() => startWalkthrough()}
          >
            Start product tour
          </button>
        ) : null}
      </div>
    );
  }

  const step = STEPS[index] ?? STEPS[0];
  const progress = ((index + 1) / STEPS.length) * 100;

  function persistStep(next: number) {
    setIndex(next);
    try {
      localStorage.setItem(STEP_KEY, String(next));
    } catch {
      /* ignore */
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
    setRestarted(false);
  }

  return (
    <aside
      className="sr-form-panel mb-8"
      aria-labelledby="facilitator-walkthrough-heading"
      data-demo="facilitator-walkthrough"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p
            id="facilitator-walkthrough-heading"
            className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-brand"
          >
            Pilot walkthrough
          </p>
          <p className="mt-1 text-sm text-ink-secondary">
            Configure → Verify → Facilitate → Release — step {index + 1} of {STEPS.length}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded p-1 text-ink-faint transition-opacity hover:opacity-70"
          aria-label="Dismiss walkthrough"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div
        className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label="Walkthrough progress"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-[var(--sr-duration-governed)] ease-[var(--sr-ease-governed)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mb-5 m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Lifecycle phases">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => persistStep(i)}
              className={cn(
                'rounded-[var(--sr-radius-sm)] border px-2 py-1 font-mono text-[length:var(--text-label)] uppercase tracking-[0.08em] transition-colors',
                i === index
                  ? 'border-brand/50 bg-brand-soft text-brand'
                  : i < index
                    ? 'border-line bg-surface-sunken text-ink-secondary'
                    : 'border-line text-ink-faint',
              )}
            >
              {s.phase}
            </button>
          </li>
        ))}
      </ol>

      <div className="rounded-[var(--sr-radius-lg)] border border-line bg-surface-sunken/50 p-4 md:p-5">
        <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
          {step.phase}
        </p>
        <h2 className="mt-2 m-0 text-base font-semibold text-ink">{step.title}</h2>
        <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{step.body}</p>
        {step.tip ? (
          <p className="mt-3 mb-0 rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated px-3 py-2 text-xs leading-relaxed text-ink-faint">
            {step.tip}
          </p>
        ) : null}
        {step.href && step.hrefLabel ? (
          <Link
            to={step.href}
            className="btn-institutional btn-institutional--primary mt-4 inline-flex text-sm no-underline"
          >
            {step.hrefLabel}
          </Link>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-institutional btn-institutional--ghost inline-flex items-center gap-1"
            disabled={index === 0}
            onClick={() => persistStep(Math.max(0, index - 1))}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </button>
          <button
            type="button"
            className="btn-institutional btn-institutional--primary inline-flex items-center gap-1"
            onClick={() => {
              if (index >= STEPS.length - 1) {
                dismiss();
                return;
              }
              persistStep(index + 1);
            }}
          >
            {index >= STEPS.length - 1 ? 'Finish' : 'Next'}
            {index < STEPS.length - 1 ? <ChevronRight className="size-4" aria-hidden /> : null}
          </button>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/how-it-works" className="text-brand">
            Lifecycle guide
          </Link>
          <Link to="/security" className="text-brand">
            Security boundaries
          </Link>
          {isDemoLoginEnabled() ? (
            <button
              type="button"
              className="text-brand underline-offset-2 hover:underline"
              onClick={() => startWalkthrough()}
            >
              Scripted product tour
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
