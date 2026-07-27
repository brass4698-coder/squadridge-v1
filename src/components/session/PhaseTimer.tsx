import {
  formatPhaseCountdown,
  type PhaseTimerState,
  type TimerUrgency,
} from '../../lib/phaseTimer';

export interface PhaseTimerProps {
  remainingSeconds: number | null;
  durationSeconds: number | null;
  timerState: PhaseTimerState;
  urgency: TimerUrgency;
  className?: string;
}

/**
 * Slim phase budget indicator. Urgency uses color + text; respects prefers-reduced-motion
 * (no opacity:0 first paint; pulse only when motion is allowed).
 */
export function PhaseTimer({
  remainingSeconds,
  durationSeconds,
  timerState,
  urgency,
  className = '',
}: PhaseTimerProps) {
  if (timerState === 'idle' || remainingSeconds == null || !durationSeconds) {
    return null;
  }

  const ratio =
    durationSeconds > 0 ? Math.min(1, Math.max(0, remainingSeconds / durationSeconds)) : 0;
  const label =
    timerState === 'paused' ? 'Paused' : timerState === 'elapsed' ? 'Elapsed' : 'Remaining';

  const trackTone =
    urgency === 'red'
      ? 'bg-sem-danger/25'
      : urgency === 'amber'
        ? 'bg-sem-warning/25'
        : 'bg-surface-sunken';
  const fillTone =
    urgency === 'red' ? 'bg-sem-danger' : urgency === 'amber' ? 'bg-sem-warning' : 'bg-brand';
  const pulseClass =
    urgency === 'red' && timerState === 'running' ? 'motion-safe:animate-pulse' : '';

  return (
    <div
      className={`min-w-[8rem] ${className}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Phase time ${label.toLowerCase()}: ${formatPhaseCountdown(remainingSeconds)}`}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </span>
        <span
          className={`font-mono text-xs tabular-nums text-ink ${pulseClass}`}
          data-urgency={urgency}
        >
          {formatPhaseCountdown(remainingSeconds)}
        </span>
      </div>
      <div className={`h-1.5 overflow-hidden rounded-sm ${trackTone}`}>
        <div
          className={`h-full rounded-sm transition-[width] duration-500 ease-out motion-reduce:transition-none ${fillTone}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
