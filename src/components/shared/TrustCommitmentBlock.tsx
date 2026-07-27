import type { ReactNode } from 'react';
import { CapsLabel } from './CapsLabel';
import { cn } from '../../lib/cn';

export type TrustCommitment = {
  title: string;
  body: string;
};

/**
 * Proof-style trust commitments — not a feature bullet list.
 * Margin seal + numbered commitments; used for room guarantees and similar.
 */
export function TrustCommitmentBlock({
  title = 'Room guarantees',
  commitments,
  footnote,
  className,
  id,
}: {
  title?: string;
  commitments: readonly TrustCommitment[];
  footnote?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <aside
      id={id}
      className={cn('sr-trust-commitment', className)}
      aria-labelledby={id ? `${id}-h` : undefined}
    >
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <CapsLabel id={id ? `${id}-h` : undefined} className="text-ink-secondary">
          {title}
        </CapsLabel>
        <span
          className="mt-0.5 size-2 shrink-0 rounded-full border border-[color:var(--sr-mode-gate-border,var(--sr-line-strong))] bg-[color:var(--sr-mode-gate-bg,var(--sr-primary-soft))]"
          aria-hidden
          title="Facilitator-governed boundary"
        />
      </div>

      <ol className="m-0 mt-5 list-none space-y-5 p-0">
        {commitments.map((item, index) => (
          <li key={item.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
            <span className="font-mono text-[length:var(--text-label)] tabular-nums text-ink-faint">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="m-0 text-sm font-semibold tracking-tight text-ink">{item.title}</h3>
              <p className="mt-1.5 mb-0 text-xs leading-relaxed text-ink-secondary">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {footnote ? (
        <div className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
          {footnote}
        </div>
      ) : null}
    </aside>
  );
}
