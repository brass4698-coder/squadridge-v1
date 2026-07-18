import { InstitutionalVisualFrame } from './InstitutionalVisualFrame';
import { StatusChip } from './StatusChip';

const LAYERS = [
  { label: 'Invite boundary', detail: 'Token-gated entry', variant: 'private' as const },
  { label: 'Verification gate', detail: 'Facilitator approval', variant: 'verified' as const },
  { label: 'Protected room', detail: 'Written dialogue only', variant: 'private' as const },
  { label: 'Release gate', detail: 'Explicit facilitator sign-off', variant: 'verified' as const },
  { label: 'Public record', detail: 'Anchored outcome', variant: 'released' as const },
];

/**
 * Access and release boundaries — architectural clarity, not cyber branding.
 */
export function TrustBoundarySchematic({ className = '' }: { className?: string }) {
  return (
    <InstitutionalVisualFrame
      ariaLabel="Trust model schematic showing invite boundary, verification gate, protected room, release gate, and public record layers"
      className={className}
      aspect="auto"
    >
      <div className="w-full max-w-4xl">
        <ol className="flex flex-col gap-0">
          {LAYERS.map((layer, index) => (
            <li key={layer.label} className="relative flex flex-col">
              {index > 0 ? (
                <div
                  className="ml-6 flex h-6 items-center border-l border-line-strong pl-4"
                  aria-hidden
                >
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-faint">
                    Controlled passage
                  </span>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface-sunken px-5 py-4">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
                    Layer {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-ink">{layer.label}</h3>
                  <p className="mt-1 text-xs text-ink-secondary">{layer.detail}</p>
                </div>
                <StatusChip
                  label={
                    layer.variant === 'private'
                      ? 'Private'
                      : layer.variant === 'released'
                        ? 'Published'
                        : 'Gated'
                  }
                  variant={layer.variant}
                />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          Not surveillance — bounded access and explicit release. No monitoring layer.
        </p>
      </div>
    </InstitutionalVisualFrame>
  );
}
