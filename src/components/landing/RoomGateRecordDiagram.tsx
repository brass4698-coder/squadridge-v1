import { StatusBadge } from '../StatusBadge';
import { cn } from '../../lib/cn';

const NODES = [
  {
    id: 'room',
    num: '01',
    label: 'Private session room',
    sub: 'Written rounds under facilitator control',
    badge: 'Private' as const,
    variant: 'private' as const,
    modeClass: 'sr-mode-room',
  },
  {
    id: 'gate',
    num: '02',
    label: 'Facilitator release gate',
    sub: 'Recorded approvals · explicit release',
    badge: 'Governed' as const,
    variant: 'governed' as const,
    modeClass: 'sr-mode-gate',
  },
  {
    id: 'record',
    num: '03',
    label: 'Public ledger',
    sub: 'Approved outcome · verification anchor',
    badge: 'Published' as const,
    variant: 'published' as const,
    modeClass: 'sr-mode-ledger',
  },
] as const;

/**
 * Hero system model — room → gate → ledger with governed surface modes.
 */
export function RoomGateRecordDiagram({ className }: { className?: string }) {
  return (
    <div
      className={cn('sr-evidence-frame', className)}
      role="img"
      aria-label="System model: private session room, facilitator release gate, then public ledger"
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5">
        <p className="font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-ink-faint">
          System model
        </p>
        <p className="hidden font-mono text-[length:var(--text-label)] text-ink-faint sm:block">
          Room → Gate → Record
        </p>
      </div>

      <ol className="sr-evidence-rail m-0 list-none p-0">
        {NODES.map((node) => (
          <li key={node.id} className={cn('sr-evidence-pane', node.modeClass)}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs tabular-nums text-ink-faint">{node.num}</span>
              <StatusBadge variant={node.variant}>{node.badge}</StatusBadge>
            </div>
            <div>
              <p className="m-0 text-[0.9375rem] font-semibold leading-snug tracking-tight text-ink">
                {node.label}
              </p>
              <p className="mt-2 mb-0 text-xs leading-relaxed text-ink-secondary">{node.sub}</p>
            </div>
            {node.id === 'record' ? (
              <p className="sr-integrity-mark mt-auto mb-0">Integrity cue</p>
            ) : null}
          </li>
        ))}
      </ol>

      <p className="border-t border-line bg-surface-sunken/50 px-5 py-3 text-left text-xs leading-relaxed text-ink-faint">
        No transcript. No open feed. No auto-publish.
      </p>
    </div>
  );
}
