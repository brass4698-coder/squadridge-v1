import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Lock, ShieldCheck, type LucideIcon } from 'lucide-react';
import { StatusChip } from './StatusChip';

/**
 * SystemModelSequence
 *
 * The homepage's single dominant explanation of the product model. One sticky
 * diagram tracks three governed states as the reader scrolls three stage
 * blocks; each stage answers the same three questions — what exists, who
 * controls it, and what never becomes public — so the whole "private room →
 * release gate → public record" story is grasped once, in one place, instead
 * of being re-explained across several stacked text sections.
 *
 * The sticky diagram is decorative reinforcement (aria-hidden); the ordered
 * stage list carries the accessible content. Token-driven, dark-institutional.
 */

type StageVariant = 'private' | 'verified' | 'released';

interface Stage {
  id: string;
  num: string;
  label: string;
  chipLabel: string;
  chipVariant: StageVariant;
  Icon: LucideIcon;
  exists: string;
  controls: string;
  withheld: string;
}

const STAGES: Stage[] = [
  {
    id: 'room',
    num: '01',
    label: 'Private room',
    chipLabel: 'Private',
    chipVariant: 'private',
    Icon: Lock,
    exists: 'Verified parties exchange structured written rounds.',
    controls: 'You set who enters, the pace, and when it ends.',
    withheld: 'Dialogue, drafts, and identities stay inside the room.',
  },
  {
    id: 'gate',
    num: '02',
    label: 'Release gate',
    chipLabel: 'Governed',
    chipVariant: 'verified',
    Icon: ShieldCheck,
    exists: 'Recorded approvals and a facilitator-drafted outcome.',
    controls: 'Nothing leaves the room without your explicit release.',
    withheld: 'Unapproved content — there is no auto-publish.',
  },
  {
    id: 'record',
    num: '03',
    label: 'Public record',
    chipLabel: 'Published',
    chipVariant: 'released',
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
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] lg:gap-16">
      {/* Sticky diagram — desktop reinforcement */}
      <div className="hidden lg:block">
        <div className="sticky top-24 self-start">
          <StickyDiagram active={active} />
        </div>
      </div>

      {/* Accessible ordered stages */}
      <ol className="flex flex-col">
        {STAGES.map((stage, index) => (
          <li
            key={stage.id}
            data-index={index}
            ref={(el) => {
              stageRefs.current[index] = el;
            }}
            className="flex flex-col justify-center border-t border-line py-12 first:border-t-0 first:pt-0 lg:min-h-[64vh] lg:py-20"
          >
            <StageHeader stage={stage} className="lg:hidden" />
            <span className="font-mono text-xs text-ink-faint">Stage {stage.num}</span>
            <h3 className="font-display mt-2 text-h3 font-medium tracking-tight text-ink">
              {stage.label}
            </h3>
            <dl className="mt-6 flex flex-col gap-5 border-l border-line pl-5">
              <Fact term="What exists" desc={stage.exists} />
              <Fact term="Who controls it" desc={stage.controls} />
              <Fact term="Never public" desc={stage.withheld} accent />
            </dl>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Fact({ term, desc, accent = false }: { term: string; desc: string; accent?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-2">
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${accent ? 'bg-brand' : 'bg-ink-subtle'}`}
        />
        <span className={`text-xs font-semibold ${accent ? 'text-brand' : 'text-ink'}`}>
          {term}
        </span>
      </dt>
      <dd className="mt-1.5 pl-3.5 text-sm leading-relaxed text-ink-secondary">{desc}</dd>
    </div>
  );
}

function StageHeader({ stage, className = '' }: { stage: Stage; className?: string }) {
  const { Icon } = stage;
  return (
    <div className={`mb-6 flex items-center gap-3 ${className}`}>
      <span className="flex size-9 shrink-0 items-center justify-center border border-brand bg-brand-soft text-brand">
        <Icon className="size-4" aria-hidden />
      </span>
      <StatusChip label={stage.chipLabel} variant={stage.chipVariant} />
    </div>
  );
}

function StickyDiagram({ active }: { active: number }) {
  return (
    <div aria-hidden>
      <ol className="flex flex-col gap-3">
        {STAGES.map((stage, index) => {
          const isActive = index === active;
          const { Icon } = stage;
          return (
            <li
              key={stage.id}
              className={`flex items-start gap-4 border p-5 transition-all duration-normal ${
                isActive
                  ? 'border-line-strong bg-surface-elevated shadow-sr-md'
                  : 'border-line bg-surface-sunken'
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center border transition-colors duration-normal ${
                  isActive ? 'border-brand bg-brand-soft text-brand' : 'border-line text-ink-faint'
                }`}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.65rem] text-ink-faint">{stage.num}</span>
                  <StatusChip label={stage.chipLabel} variant={stage.chipVariant} />
                </div>
                <h4
                  className={`mt-1.5 text-sm font-semibold transition-colors duration-normal ${
                    isActive ? 'text-ink' : 'text-ink-secondary'
                  }`}
                >
                  {stage.label}
                </h4>
                <p
                  className={`mt-1 text-xs leading-snug transition-opacity duration-normal ${
                    isActive ? 'text-ink-secondary opacity-100' : 'text-ink-faint opacity-70'
                  }`}
                >
                  {stage.exists}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
        <span className="font-semibold text-brand">Never becomes public: </span>
        {STAGES[active].withheld}
      </p>
    </div>
  );
}
