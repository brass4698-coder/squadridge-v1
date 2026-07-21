import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Lock, ShieldCheck, type LucideIcon } from 'lucide-react';
import { StatusBadge, type StatusBadgeVariant } from '../StatusBadge';

/**
 * Technical control model — three clearly separated sub-sections per stage.
 */

interface Stage {
  id: string;
  anchorId: string;
  num: string;
  label: string;
  chipLabel: string;
  badgeVariant: StatusBadgeVariant;
  Icon: LucideIcon;
  exists: string;
  controls: string;
  withheld: string;
}

const STAGES: Stage[] = [
  {
    id: 'room',
    anchorId: 'stage-room',
    num: '01',
    label: 'Private room',
    chipLabel: 'Private',
    badgeVariant: 'private',
    Icon: Lock,
    exists: 'Verified parties exchange structured written rounds.',
    controls: 'You set who enters, the pace, and when it ends.',
    withheld: 'Dialogue, drafts, and identities stay inside the room.',
  },
  {
    id: 'gate',
    anchorId: 'stage-gate',
    num: '02',
    label: 'Release gate',
    chipLabel: 'Governed',
    badgeVariant: 'governed',
    Icon: ShieldCheck,
    exists: 'Recorded approvals and a facilitator-drafted outcome.',
    controls: 'Nothing leaves the room without your explicit release.',
    withheld: 'Unapproved content — there is no auto-publish.',
  },
  {
    id: 'record',
    anchorId: 'stage-record',
    num: '03',
    label: 'Public record',
    chipLabel: 'Published',
    badgeVariant: 'published',
    Icon: BadgeCheck,
    exists: 'Approved outcome, limited metadata, and a verification anchor.',
    controls: 'Anyone can recompute the anchor to confirm integrity.',
    withheld: 'No transcript. No attribution.',
  },
];

export function SystemModelSequence() {
  const [active, setActive] = useState(0);
  const stageRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const els = stageRefs.current.filter((el): el is HTMLLIElement => el !== null);
    if (els.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(index)) setActive(index);
          }
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-20">
      <div className="hidden lg:block">
        <div className="sticky top-28 self-start">
          <StickyNav active={active} />
        </div>
      </div>

      <ol className="m-0 flex max-w-[42rem] list-none flex-col gap-14 p-0 md:gap-20">
        {STAGES.map((stage, index) => {
          const Icon = stage.Icon;
          return (
            <li
              key={stage.id}
              id={stage.anchorId}
              data-index={index}
              ref={(el) => {
                stageRefs.current[index] = el;
              }}
              className="scroll-mt-28"
            >
              <header className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center border border-[color:var(--color-border-subtle)] text-ink-faint">
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="font-mono text-xs tabular-nums text-[color:var(--color-text-muted)]">
                    Stage {stage.num}
                  </span>
                  <StatusBadge variant={stage.badgeVariant}>{stage.chipLabel}</StatusBadge>
                </div>
              </header>

              <h3 className="font-display mt-0 mb-0 text-[1.5rem] font-medium tracking-tight text-ink md:text-[1.625rem]">
                {stage.label}
              </h3>

              <div className="mt-8 flex flex-col gap-4">
                <ControlCell term="What exists" desc={stage.exists} />
                <ControlCell term="Who controls it" desc={stage.controls} />
                <ControlCell term="Never public" desc={stage.withheld} accent />
              </div>
            </li>
          );
        })}
      </ol>
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
      className={`flex flex-col gap-3 rounded-md border px-5 py-5 ${
        accent
          ? 'border-[hsla(168,30%,40%,0.35)] bg-[hsla(168,25%,35%,0.08)]'
          : 'border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-raised)]'
      }`}
    >
      <p
        className={`m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] ${
          accent ? 'text-brand' : 'text-[color:var(--color-text-muted)]'
        }`}
      >
        {term}
      </p>
      <p className={`m-0 text-sm leading-[1.65] ${accent ? 'text-ink' : 'text-ink-secondary'}`}>
        {desc}
      </p>
    </div>
  );
}

function StickyNav({ active }: { active: number }) {
  return (
    <nav aria-hidden>
      <p className="mb-5 m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
        Stages
      </p>
      <ol className="m-0 flex list-none flex-col gap-0 border-l border-[color:var(--color-border-subtle)] p-0">
        {STAGES.map((stage, index) => {
          const isActive = index === active;
          return (
            <li key={stage.id}>
              <div
                className={`border-l-2 py-3 pl-4 transition-colors ${
                  isActive ? '-ml-px border-brand' : 'border-transparent'
                }`}
              >
                <span className="block font-mono text-[0.65rem] tabular-nums text-[color:var(--color-text-muted)]">
                  {stage.num}
                </span>
                <span
                  className={`mt-1 block text-sm font-medium ${
                    isActive ? 'text-ink' : 'text-ink-secondary'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 border-t border-[color:var(--color-border-subtle)] pt-5">
        <div className="flex flex-col gap-2">
          <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-brand">
            Never public
          </p>
          <p className="m-0 text-xs leading-relaxed text-ink-faint">{STAGES[active].withheld}</p>
        </div>
      </div>
    </nav>
  );
}
