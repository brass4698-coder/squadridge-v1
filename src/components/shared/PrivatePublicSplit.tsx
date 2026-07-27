import type { ReactNode } from 'react';
import { StatusChip } from '../institutional/StatusChip';
import { CapsLabel } from './CapsLabel';
import { cn } from '../../lib/cn';

export interface PrivatePublicSplitProps {
  privateItems: string[];
  publicItems: string[];
  privateHeading?: string;
  publicHeading?: string;
  privateFooter?: string;
  publicFooter?: string;
  bridgeLabel?: string;
  size?: 'hero' | 'compact';
  className?: string;
  /** Optional aria override for the figure. */
  'aria-label'?: string;
}

/**
 * Signature room → gate → record comparison.
 * Encodes the trust boundary: private session | facilitator gate | approved record.
 */
export function PrivatePublicSplit({
  privateItems,
  publicItems,
  privateHeading = 'Protected room',
  publicHeading = 'Released record',
  privateFooter,
  publicFooter,
  bridgeLabel = 'Facilitator release gate',
  size = 'hero',
  className,
  'aria-label':
    ariaLabel = 'Private session room separated from released public record by facilitator-controlled release',
}: PrivatePublicSplitProps) {
  const panelPad = size === 'hero' ? 'p-6 md:p-8' : 'p-5 md:p-6';
  const rowGap = size === 'hero' ? 'gap-2.5' : 'gap-2';

  return (
    <div
      className={cn(
        'sr-room-record-split grid gap-0 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch',
        className,
      )}
      role="figure"
      aria-label={ariaLabel}
    >
      <DocumentPanel
        mode="room"
        title={privateHeading}
        chip={<StatusChip label="Private" variant="private" />}
        items={privateItems}
        footer={privateFooter}
        panelPad={panelPad}
        rowGap={rowGap}
      />

      <GateColumn label={bridgeLabel} />

      <DocumentPanel
        mode="ledger"
        title={publicHeading}
        chip={<StatusChip label="Published" variant="released" />}
        items={publicItems}
        footer={publicFooter}
        panelPad={panelPad}
        rowGap={rowGap}
      />
    </div>
  );
}

function GateColumn({ label }: { label: string }) {
  return (
    <div className="sr-room-record-split__gate flex flex-col items-stretch justify-center border-y border-line bg-[color:var(--sr-mode-gate-bg,var(--sr-bg-accent))] px-4 py-5 lg:border-x lg:border-y-0 lg:px-5 lg:py-8">
      <div className="hidden flex-1 lg:block" aria-hidden>
        <div className="mx-auto h-full w-px bg-[color:var(--sr-mode-gate-border,var(--sr-line-strong))]" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <span
          className="size-2 rounded-full border border-[color:var(--sr-mode-gate-border,var(--sr-line-strong))] bg-brand/30"
          aria-hidden
        />
        <CapsLabel className="max-w-[9rem] text-brand">{label}</CapsLabel>
      </div>
      <div className="hidden flex-1 lg:block" aria-hidden>
        <div className="mx-auto h-full w-px bg-[color:var(--sr-mode-gate-border,var(--sr-line-strong))]" />
      </div>
    </div>
  );
}

function DocumentPanel({
  mode,
  title,
  chip,
  items,
  footer,
  panelPad,
  rowGap,
}: {
  mode: 'room' | 'ledger';
  title: string;
  chip: ReactNode;
  items: string[];
  footer?: string;
  panelPad: string;
  rowGap: string;
}) {
  return (
    <article
      className={cn(
        'flex flex-col border border-line',
        mode === 'room' ? 'sr-mode-room' : 'sr-mode-ledger',
        panelPad,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="m-0 text-sm font-semibold tracking-tight text-ink">{title}</h3>
        {chip}
      </div>
      <ul className={cn('m-0 flex flex-1 list-none flex-col p-0', rowGap)}>
        {items.map((item) => (
          <li
            key={item}
            className="border border-line bg-surface-sunken/60 px-3 py-2.5 font-mono text-xs leading-snug text-ink-secondary"
          >
            {item}
          </li>
        ))}
      </ul>
      {footer ? (
        <footer className="mt-4 border-t border-line pt-3 text-xs leading-snug text-ink-faint">
          {footer}
        </footer>
      ) : null}
    </article>
  );
}
