import type { PaceSignalKind } from '../../lib/pacing/paceSignals';

const COPY: Partial<Record<PaceSignalKind, string>> = {
  rapid_send: 'Messages are coming quickly. Want a short pause?',
  composer_thrash: 'Take a breath before sending?',
  repeated_retract: 'Several retracts lately. A slow-down may help.',
};

interface PaceSuggestionChipProps {
  kind: PaceSignalKind;
  onAccept: () => void;
  onDismiss: () => void;
}

/** Soft, optional Slow down suggestion from local pace signals — never punitive. */
export function PaceSuggestionChip({ kind, onAccept, onDismiss }: PaceSuggestionChipProps) {
  const copy = COPY[kind] ?? 'A short pause can help the room stay measured.';

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-sr-md border border-brand/30 bg-brand/5 px-3 py-2.5"
    >
      <p className="min-w-0 flex-1 text-fluid-sm text-ink">{copy}</p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-sr-md bg-brand px-3 py-1.5 text-fluid-xs font-medium text-ink-invert transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Slow down
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-sr-md border border-line px-3 py-1.5 text-fluid-xs font-medium text-ink-muted transition hover:bg-surface-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
