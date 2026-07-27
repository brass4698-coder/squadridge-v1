import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { StatusBadge, type StatusBadgeVariant } from '../StatusBadge';

/**
 * Governed sequence walkthrough — one active stage panel; tabs/rail persist.
 * Prefer this over parallel process UIs on the marketing homepage.
 */

export interface SystemModelSequenceProps {
  /**
   * Interactive stepped walkthrough (homepage).
   * When false, renders a quiet stacked list for secondary contexts.
   */
  interactive?: boolean;
}

interface Stage {
  id: string;
  anchorId: string;
  num: string;
  label: string;
  chipLabel: string;
  badgeVariant: StatusBadgeVariant;
  modeClass: string;
  meaning: string;
  exists: string;
  controls: string;
  withheld: string;
  /** Secondary diligence lines inside Details disclosure */
  details: string[];
  footer: string;
}

const STAGES: Stage[] = [
  {
    id: 'room',
    anchorId: 'stage-room',
    num: '01',
    label: 'Private room',
    chipLabel: 'Enclosed',
    badgeVariant: 'private',
    modeClass: 'sr-mode-room',
    meaning:
      'Verified parties exchange structured written rounds inside a facilitator-governed session.',
    exists: 'Structured written rounds, participant verification, session pacing.',
    controls: 'Facilitator controls entry, pace, and when the room closes.',
    withheld: 'Dialogue, drafts, and identities.',
    details: [
      'Invite-verified participants only — soft enclosure, not a public forum.',
      'Pace holds (pause / slow down) stay inside the room.',
      'Ending the room drafts toward the release gate — it does not publish.',
    ],
    footer: 'VERIFIED ×4 · LIVE',
  },
  {
    id: 'gate',
    anchorId: 'stage-gate',
    num: '02',
    label: 'Release gate',
    chipLabel: 'Threshold',
    badgeVariant: 'governed',
    modeClass: 'sr-mode-gate',
    meaning:
      'Nothing leaves the room until approvals are recorded and release is explicitly triggered.',
    exists: 'Facilitator-drafted outcome, approval chain, release decision.',
    controls: 'Facilitator and designated approval flow.',
    withheld: 'Unapproved content or automatic publication.',
    details: [
      'Highest structure in the path — threshold elevated above room and ledger.',
      'Approvals are recorded before any public instrument exists.',
      'Release requires an explicit facilitator action — never timed or automatic.',
    ],
    footer: 'APPROVALS 3/3 · RELEASE Explicit click',
  },
  {
    id: 'record',
    anchorId: 'stage-record',
    num: '03',
    label: 'Public ledger',
    chipLabel: 'Published',
    badgeVariant: 'published',
    modeClass: 'sr-mode-ledger',
    meaning:
      'Only approved outcome text, limited metadata, and a verification anchor become public.',
    exists: 'Released outcome, limited metadata, integrity anchor.',
    controls: 'Public can verify integrity, but cannot see private room content.',
    withheld: 'Transcript, attribution, identities.',
    details: [
      'Flatter, open composition — integrity cues only, no decorative chrome.',
      'Tamper-evident hash: recompute SHA-256 of published text to confirm.',
      'The ledger anchors release integrity, not what was said in the room.',
    ],
    footer: 'ANCHOR VERIFIED · sha256:7c3a…e91f',
  },
];

export function SystemModelSequence({ interactive = true }: SystemModelSequenceProps) {
  if (!interactive) {
    return <StaticSequence />;
  }
  return <WalkthroughSequence />;
}

function WalkthroughSequence() {
  const [active, setActive] = useState(0);
  const tabIds = useId();
  const panelId = `${tabIds}-panel`;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stage = STAGES[active];

  const select = (index: number) => {
    setActive(index);
  };

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const index = STAGES.findIndex((s) => s.anchorId === hash);
      if (index >= 0) setActive(index);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (index + 1) % STAGES.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (index - 1 + STAGES.length) % STAGES.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = STAGES.length - 1;
    }
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="sr-governed-walkthrough overflow-hidden rounded-[var(--sr-radius-lg)] border border-line bg-[color:var(--sr-bg-sunken)]">
      {/* Deep-link targets for #stage-room / #stage-gate / #stage-record */}
      {STAGES.map((s) => (
        <span key={`anchor-${s.id}`} id={s.anchorId} className="sr-only" aria-hidden />
      ))}

      {/* Desktop / tablet: persistent top tab rail with connecting progress line */}
      <div className="relative hidden border-b border-line sm:block">
        <div
          aria-hidden
          className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-[1.35rem] h-px bg-line"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[16.67%] top-[1.35rem] h-px bg-brand/50 transition-[width] duration-200 ease-[var(--sr-ease-governed)] motion-reduce:transition-none"
          style={{ width: `${(active / Math.max(STAGES.length - 1, 1)) * 66.66}%` }}
        />
        <div
          role="tablist"
          aria-label="Governed sequence stages"
          className="relative grid grid-cols-3"
        >
          {STAGES.map((s, index) => {
            const isActive = index === active;
            const isComplete = index < active;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`${tabIds}-tab-${s.id}`}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                onClick={() => select(index)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
                className={`flex flex-col gap-2 border-r border-line px-4 py-4 text-left last:border-r-0 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--sr-primary)] ${
                  isActive
                    ? 'bg-[color:var(--sr-bg-elevated)]'
                    : 'bg-transparent hover:bg-[color:var(--sr-bg-elevated)]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex size-5 items-center justify-center rounded-full border font-mono text-[0.65rem] tabular-nums ${
                      isActive || isComplete
                        ? 'border-brand/60 bg-brand/10 text-brand'
                        : 'border-line text-ink-faint'
                    }`}
                  >
                    {s.num.replace(/^0/, '')}
                  </span>
                  <StatusBadge variant={s.badgeVariant}>{s.chipLabel}</StatusBadge>
                </div>
                <span
                  className={`text-sm font-semibold tracking-tight ${
                    isActive ? 'text-ink' : 'text-ink-secondary'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: stacked accordion headers; only one open */}
      <div className="sm:hidden">
        {STAGES.map((s, index) => {
          const isActive = index === active;
          return (
            <div key={s.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                aria-expanded={isActive}
                aria-controls={`${panelId}-mobile-${s.id}`}
                id={`${tabIds}-acc-${s.id}`}
                onClick={() => select(index)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--sr-primary)] ${
                  isActive ? 'bg-[color:var(--sr-bg-elevated)]' : 'bg-transparent'
                }`}
              >
                <span className="flex min-w-0 items-baseline gap-3">
                  <span className="font-mono text-xs tabular-nums text-ink-faint">{s.num}</span>
                  <span
                    className={`truncate text-sm font-semibold tracking-tight ${
                      isActive ? 'text-ink' : 'text-ink-secondary'
                    }`}
                  >
                    {s.label}
                  </span>
                </span>
                <StatusBadge variant={s.badgeVariant}>{s.chipLabel}</StatusBadge>
              </button>
              {isActive ? (
                <div
                  id={`${panelId}-mobile-${s.id}`}
                  role="region"
                  aria-labelledby={`${tabIds}-acc-${s.id}`}
                  className="border-t border-line bg-[color:var(--sr-bg-elevated)] px-4 pb-5 pt-4 motion-safe:animate-[sr-walkthrough-in_160ms_ease-out] motion-reduce:animate-none"
                >
                  <StagePanelBody stage={s} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Desktop panel — fixed min-height to reduce layout jump */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${tabIds}-tab-${stage.id}`}
        className={`hidden min-h-[22rem] border-t-0 bg-[color:var(--sr-bg-elevated)] px-5 py-6 sm:block md:min-h-[20rem] md:px-7 md:py-7 ${stage.modeClass}`}
      >
        <div
          key={stage.id}
          className="motion-safe:animate-[sr-walkthrough-in_160ms_ease-out] motion-reduce:animate-none"
        >
          <StagePanelBody stage={stage} />
        </div>
      </div>
    </div>
  );
}

function StagePanelBody({ stage }: { stage: Stage }) {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. Step number + state chip */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-mono text-xs tabular-nums text-ink-faint">Stage {stage.num}</span>
        <StatusBadge variant={stage.badgeVariant}>{stage.chipLabel}</StatusBadge>
      </header>

      {/* 2. Stage title */}
      <h3 className="m-0 font-heading text-h3 font-semibold tracking-tight text-ink">
        {stage.label}
      </h3>

      {/* 3. Meaning */}
      <p className="m-0 max-w-prose text-sm leading-relaxed text-ink-secondary">{stage.meaning}</p>

      {/* 4. Rows */}
      <div className="grid gap-0 border-t border-line">
        <ControlCell term="What exists" desc={stage.exists} />
        <ControlCell term="Who controls it" desc={stage.controls} />
        <ControlCell term="Never public" desc={stage.withheld} accent />
      </div>

      {/* 5. Optional Details disclosure */}
      <details className="group border-t border-line pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink-secondary transition-colors hover:text-ink focus-visible:outline-none focus-visible:text-ink [&::-webkit-details-marker]:hidden">
          <span>Details</span>
          <span
            aria-hidden
            className="font-mono text-sm leading-none text-ink-faint transition-transform duration-150 ease-[var(--sr-ease-governed)] group-open:rotate-45 motion-reduce:transition-none"
          >
            +
          </span>
        </summary>
        <ul className="mt-3 mb-0 list-none space-y-2 p-0">
          {stage.details.map((line) => (
            <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink-secondary">
              <span
                aria-hidden
                className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ink-faint"
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </details>

      {/* 6. Footer state token */}
      <footer className="border-t border-line pt-4">
        <p
          className={
            stage.id === 'record'
              ? 'sr-verify m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)]'
              : 'm-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint'
          }
        >
          {stage.id === 'record' ? <span className="sr-verify-dot" aria-hidden /> : null}
          {stage.footer}
        </p>
      </footer>
    </div>
  );
}

function ControlCell({
  term,
  desc,
  accent = false,
}: {
  term: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 border-b border-line px-0 py-3.5 last:border-b-0 ${
        accent
          ? 'border-l-2 border-l-[color:var(--sr-mode-gate-border,var(--sr-line-strong))] pl-4'
          : ''
      }`}
    >
      <p className={`sr-meta-label ${accent ? 'text-ink' : ''}`}>{term}</p>
      <p className={`sr-meta-value ${accent ? '' : 'font-normal text-ink-secondary'}`}>{desc}</p>
    </div>
  );
}

/** Quiet stacked fallback when interactive rail is not desired. */
function StaticSequence() {
  return (
    <ol className="sr-process-spine m-0 flex max-w-[42rem] list-none flex-col gap-0 p-0">
      {STAGES.map((stage) => (
        <li
          key={stage.id}
          id={stage.anchorId}
          className="sr-process-spine__item scroll-mt-28 border-b border-line py-8 last:border-b-0 last:pb-0 first:pt-0"
        >
          <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <span className="font-mono text-xs tabular-nums text-ink-faint">Stage {stage.num}</span>
            <StatusBadge variant={stage.badgeVariant}>{stage.chipLabel}</StatusBadge>
          </header>
          <h3 className="mt-0 mb-0 font-heading text-h3 font-semibold tracking-tight text-ink">
            {stage.label}
          </h3>
          <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
            {stage.meaning}
          </p>
          <div className="mt-6 grid gap-0 border-t border-line">
            <ControlCell term="What exists" desc={stage.exists} />
            <ControlCell term="Who controls it" desc={stage.controls} />
            <ControlCell term="Never public" desc={stage.withheld} accent />
          </div>
        </li>
      ))}
    </ol>
  );
}
