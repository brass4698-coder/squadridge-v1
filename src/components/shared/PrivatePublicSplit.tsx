import type { ReactNode } from 'react';
import { StatusChip } from '../institutional/StatusChip';

export interface PrivatePublicSplitProps {
  privateItems: string[];
  publicItems: string[];
  privateHeading?: string;
  publicHeading?: string;
  bridgeLabel?: string;
  size?: 'hero' | 'compact';
}

export function PrivatePublicSplit({
  privateItems,
  publicItems,
  privateHeading = 'Protected room',
  publicHeading = 'Released record',
  bridgeLabel = 'Facilitator release gate',
  size = 'hero',
}: PrivatePublicSplitProps) {
  const panelPad = size === 'hero' ? 'p-6 md:p-8' : 'p-5 md:p-6';
  const rowGap = size === 'hero' ? 'gap-2.5' : 'gap-2';
  const headingSize = size === 'hero' ? 'text-sm' : 'text-sm';

  return (
    <div
      className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch"
      role="figure"
      aria-label="Private session room separated from released public record by facilitator-controlled release"
    >
      <DocumentPanel
        title={privateHeading}
        chip={<StatusChip label="Private" variant="private" />}
        items={privateItems}
        panelPad={panelPad}
        rowGap={rowGap}
        headingSize={headingSize}
      />

      <div className="flex flex-col items-center justify-center gap-2 px-2 py-4 lg:py-0">
        <div className="hidden h-full w-px bg-line-strong lg:block" aria-hidden />
        <p className="max-w-[8rem] text-center font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
          {bridgeLabel}
        </p>
        <div className="hidden h-full w-px bg-line-strong lg:block" aria-hidden />
      </div>

      <DocumentPanel
        title={publicHeading}
        chip={<StatusChip label="Published" variant="released" />}
        items={publicItems}
        panelPad={panelPad}
        rowGap={rowGap}
        headingSize={headingSize}
      />
    </div>
  );
}

function DocumentPanel({
  title,
  chip,
  items,
  panelPad,
  rowGap,
  headingSize,
}: {
  title: string;
  chip: ReactNode;
  items: string[];
  panelPad: string;
  rowGap: string;
  headingSize: string;
}) {
  return (
    <article className={`border border-line bg-surface-elevated ${panelPad}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className={`${headingSize} font-semibold text-ink`}>{title}</h3>
        {chip}
      </div>
      <ul className={`flex flex-col ${rowGap}`}>
        {items.map((item) => (
          <li
            key={item}
            className="border border-line bg-surface-sunken px-3 py-2.5 font-mono text-xs text-ink-secondary"
          >
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
