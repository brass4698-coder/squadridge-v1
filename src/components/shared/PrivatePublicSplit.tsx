import { Lock } from 'lucide-react';

export interface PrivatePublicSplitProps {
  privateItems: string[];
  publicItems: string[];
  privateHeading?: string;
  publicHeading?: string;
  bridgeLabel?: string;
  size?: 'hero' | 'compact';
}

function PrivacyChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-secondary px-2.5 py-1 text-[0.7rem] font-medium text-ink-secondary">
      <Lock className="size-3 shrink-0" aria-hidden />
      Private
    </span>
  );
}

function VerifiedChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-2.5 py-1 text-[0.7rem] font-medium text-brand">
      Verified
    </span>
  );
}

export function PrivatePublicSplit({
  privateItems,
  publicItems,
  privateHeading = 'Inside the room',
  publicHeading = 'Released as record',
  bridgeLabel = 'Facilitator-signed release',
  size = 'hero',
}: PrivatePublicSplitProps) {
  const isHero = size === 'hero';
  const panelPad = isHero ? 'p-6 md:p-8' : 'p-4 md:p-5';
  const rowGap = isHero ? 'gap-3' : 'gap-2';
  const headingSize = isHero ? 'text-base' : 'text-sm';

  return (
    <div
      className="flex w-full flex-col gap-3"
      role="figure"
      aria-label="A private session room produces a released, verifiable record, connected by a facilitator-signed release step."
    >
      <div
        className={`relative overflow-hidden rounded-lg border border-line bg-surface-sunken ${panelPad} shadow-sr-sm`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className={`${headingSize} font-semibold text-ink`}>{privateHeading}</h3>
          <PrivacyChip />
        </div>
        <ul className={`flex flex-col ${rowGap}`}>
          {privateItems.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-md bg-surface-secondary px-3 py-2 text-sm text-ink-secondary"
            >
              <span
                aria-hidden
                className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <div
          className="h-4 w-px"
          aria-hidden
          style={{
            background: 'linear-gradient(180deg, var(--sr-line), var(--sr-primary))',
          }}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-brand">
          {bridgeLabel}
          <span aria-hidden>↓</span>
        </span>
        <div
          className="h-4 w-px"
          aria-hidden
          style={{
            background: 'linear-gradient(180deg, var(--sr-primary), var(--sr-line))',
          }}
        />
      </div>

      <div
        className={`sr-glass rounded-lg border ${panelPad}`}
        style={{
          borderColor: 'color-mix(in oklch, var(--sr-primary) 30%, var(--sr-glass-border))',
          boxShadow:
            '0 0 0 1px color-mix(in oklch, var(--sr-primary) 14%, transparent), 0 12px 40px oklch(from var(--sr-primary) l c h / 0.14), var(--sr-shadow-sm)',
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className={`${headingSize} font-semibold text-ink`}>{publicHeading}</h3>
          <VerifiedChip />
        </div>
        <ul className={`flex flex-col ${rowGap}`}>
          {publicItems.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-md bg-brand-soft px-3 py-2 text-sm text-ink"
            >
              <span
                aria-hidden
                className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
