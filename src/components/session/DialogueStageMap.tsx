import {
  DIALOGUE_STAGE_CONFIGS,
  DIALOGUE_STAGES,
  type DialogueStage,
} from '../../lib/dialogueStages';

interface DialogueStageMapProps {
  current: DialogueStage;
  /** compact = horizontal labels only */
  compact?: boolean;
  className?: string;
}

/**
 * Visible process map for facilitator-led dialogue — not a social timeline.
 */
export function DialogueStageMap({
  current,
  compact = false,
  className = '',
}: DialogueStageMapProps) {
  const currentIndex = DIALOGUE_STAGES.indexOf(current);
  const config = DIALOGUE_STAGE_CONFIGS[current];

  return (
    <div className={className} role="navigation" aria-label="Dialogue process stages">
      <ol className="flex flex-wrap gap-1.5">
        {DIALOGUE_STAGES.map((stage, i) => {
          const done = i < currentIndex;
          const active = stage === current;
          return (
            <li key={stage}>
              <span
                className={`inline-flex min-h-[32px] items-center rounded px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
                  active
                    ? 'bg-brand-soft text-brand'
                    : done
                      ? 'bg-surface-sunken text-ink-secondary'
                      : 'bg-surface text-ink-faint'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {DIALOGUE_STAGE_CONFIGS[stage].label}
              </span>
            </li>
          );
        })}
      </ol>
      {!compact ? (
        <p className="mt-3 text-sm text-ink-secondary">
          <span className="font-medium text-ink">{config.label}: </span>
          {config.facilitatorPrompt}
        </p>
      ) : null}
    </div>
  );
}
