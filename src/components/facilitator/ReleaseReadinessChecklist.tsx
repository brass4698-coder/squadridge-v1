import {
  buildReleaseReadinessChecklist,
  type ReleaseChecklistState,
  type ReleaseReadiness,
} from '../../lib/releaseIntegrity';

function stateLabel(state: ReleaseChecklistState): string {
  if (state === 'ready') return 'Ready';
  if (state === 'waiting') return 'Waiting';
  return 'Blocked';
}

function stateClasses(state: ReleaseChecklistState): string {
  if (state === 'ready') return 'text-brand';
  if (state === 'waiting') return 'text-sem-warning';
  return 'text-sem-danger';
}

interface ReleaseReadinessChecklistProps {
  readiness: ReleaseReadiness | null;
}

/**
 * Preflight from `facilitator_get_release_readiness` — workflow states, not a mystery error.
 */
export function ReleaseReadinessChecklist({ readiness }: ReleaseReadinessChecklistProps) {
  const items = buildReleaseReadinessChecklist(readiness);
  const canRelease = readiness?.canRelease === true;

  return (
    <section className="sr-evidence-frame mb-8 p-5" aria-labelledby="release-preflight-h">
      <h2
        id="release-preflight-h"
        className="mb-1 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint"
      >
        Release preflight
      </h2>
      <p className="mb-4 text-xs leading-relaxed text-ink-secondary">
        {canRelease
          ? 'All gates clear for this instrument. Release remains irreversible.'
          : 'Resolve each blocked or waiting item before release. Pending participant reviews cannot be proxy-approved from this console.'}
      </p>
      <ul
        className="m-0 flex list-none flex-col gap-3 p-0"
        aria-label="Release readiness checklist"
      >
        {items.map((item) => (
          <li key={item.id} className="rounded-lg bg-surface-elevated px-4 py-3 shadow-sr-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="m-0 text-sm font-medium text-ink">{item.label}</p>
              <span
                className={`font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${stateClasses(item.state)}`}
              >
                {stateLabel(item.state)}
              </span>
            </div>
            <p className="mt-1 mb-0 text-xs leading-relaxed text-ink-secondary">{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
