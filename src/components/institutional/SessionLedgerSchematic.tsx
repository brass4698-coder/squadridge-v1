import { InstitutionalVisualFrame } from './InstitutionalVisualFrame';
import { StatusChip } from './StatusChip';

const NODES = [
  {
    id: 'room',
    label: 'Protected room',
    sub: 'Written rounds · facilitator control',
    chip: <StatusChip label="Private" variant="private" />,
  },
  {
    id: 'gate',
    label: 'Approval gate',
    sub: 'Verification · explicit release',
    chip: <StatusChip label="Gated" variant="verified" />,
  },
  {
    id: 'ledger',
    label: 'Public record',
    sub: 'Approved outcome · anchor',
    chip: <StatusChip label="Published" variant="released" />,
  },
] as const;

/**
 * Session → facilitator gate → ledger progression. Thin schematic lines, document nodes.
 */
export function SessionLedgerSchematic({ className = '' }: { className?: string }) {
  return (
    <InstitutionalVisualFrame
      ariaLabel="Process schematic: private session room, facilitator approval gate, and published ledger record"
      className={className}
      aspect="wide"
    >
      <div className="flex w-full max-w-4xl flex-col gap-6 md:gap-0">
        <svg viewBox="0 0 720 80" className="hidden w-full text-line-strong md:block" aria-hidden>
          <line x1="120" y1="40" x2="280" y2="40" stroke="currentColor" strokeWidth="1" />
          <polygon points="276,36 284,40 276,44" fill="currentColor" />
          <line x1="440" y1="40" x2="600" y2="40" stroke="currentColor" strokeWidth="1" />
          <polygon points="596,36 604,40 596,44" fill="currentColor" />
          <rect
            x="280"
            y="28"
            width="160"
            height="24"
            stroke="currentColor"
            strokeWidth="0.75"
            fill="none"
            strokeDasharray="4 3"
            opacity="0.7"
          />
          <text
            x="360"
            y="44"
            textAnchor="middle"
            fill="currentColor"
            fontSize="9"
            fontFamily="var(--sr-font-mono)"
            opacity="0.55"
          >
            Facilitator release
          </text>
        </svg>

        <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
          {NODES.map((node, index) => (
            <li
              key={node.id}
              className="relative flex flex-col border border-line bg-surface-sunken p-5"
            >
              {index < NODES.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-line-strong md:block"
                />
              ) : null}
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {node.chip}
              </div>
              <h3 className="text-sm font-semibold text-ink">{node.label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-secondary">{node.sub}</p>
            </li>
          ))}
        </ol>
      </div>
    </InstitutionalVisualFrame>
  );
}
