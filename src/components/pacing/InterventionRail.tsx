import type { PaceSignalKind } from '../../lib/pacing/paceSignals';

export interface InterventionParticipantState {
  id: string;
  label: string;
  /** Local / reported cooldown remaining in ms (0 = none). */
  cooldownRemainingMs: number;
  /** Optional last local pace signal kind (metadata only). */
  lastSignal?: PaceSignalKind | null;
  optedIntoBreak?: boolean;
}

interface InterventionRailProps {
  participants: InterventionParticipantState[];
  onSlowDownOne: (participantId: string) => void;
  onSlowDownAll: () => void;
  className?: string;
}

/**
 * Facilitator intervention rail — who is in cooldown / opted into a break.
 * Never shows message bodies.
 */
export function InterventionRail({
  participants,
  onSlowDownOne,
  onSlowDownAll,
  className = '',
}: InterventionRailProps) {
  const active = participants.filter(
    (p) => p.cooldownRemainingMs > 0 || p.optedIntoBreak || p.lastSignal,
  );

  return (
    <section
      aria-labelledby="intervention-rail-title"
      className={`rounded-sr-lg border border-line bg-surface-1 p-4 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="intervention-rail-title"
            className="font-display text-fluid-base font-semibold text-ink"
          >
            Pacing interventions
          </h2>
          <p className="mt-1 text-fluid-xs text-ink-muted">
            Metadata only — no message content. Distinct from session pause.
          </p>
        </div>
        <button
          type="button"
          onClick={onSlowDownAll}
          className="rounded-sr-md border border-line bg-surface px-3 py-2 text-fluid-xs font-medium text-ink transition hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Slow down all
        </button>
      </div>

      {active.length === 0 ? (
        <p className="mt-4 text-fluid-sm text-ink-faint">
          No active cooldowns or local pace suggestions.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {active.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sr-md border border-line/80 bg-surface px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-fluid-sm font-medium text-ink">{p.label}</p>
                <p className="text-fluid-xs text-ink-muted">
                  {p.cooldownRemainingMs > 0
                    ? `Cooldown ${Math.ceil(p.cooldownRemainingMs / 1000)}s`
                    : p.optedIntoBreak
                      ? 'Opted into a break'
                      : p.lastSignal
                        ? `Local signal: ${p.lastSignal.replaceAll('_', ' ')}`
                        : '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSlowDownOne(p.id)}
                className="shrink-0 rounded-sr-md bg-brand/15 px-2.5 py-1.5 text-fluid-xs font-medium text-brand transition hover:bg-brand/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Slow down
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-fluid-xs font-medium uppercase tracking-[0.08em] text-ink-faint">
          Suggested pacing
        </p>
        <ul className="mt-2 space-y-1 text-fluid-sm text-ink-muted">
          <li>Extend silence before the next round</li>
          <li>Switch to written-only for one turn</li>
          <li>Use room pause only when the whole session must stop</li>
        </ul>
      </div>
    </section>
  );
}
