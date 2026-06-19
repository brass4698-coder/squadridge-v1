import {
  Users,
  PenLine,
  Eye,
  MessageSquare,
  Brain,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  SESSION_PHASES,
  PHASE_CONFIGS,
  formatCountdown,
  phaseIndex,
  type SessionPhase,
} from '../../lib/sessionPhases';

// ── Phase icon map ──────────────────────────────────────────────────

const PHASE_ICONS: Record<SessionPhase, typeof Users> = {
  waiting: Users,
  input: PenLine,
  reveal: Eye,
  negotiation: MessageSquare,
  analysis: Brain,
  complete: CheckCircle2,
};

// ── Main Orchestrator ───────────────────────────────────────────────

interface PhaseOrchestratorProps {
  phase: SessionPhase;
  timeRemainingMs: number | null;
  isExpired: boolean;
  sessionQuestion: string | null;
  memberCount: number;
  minParticipants: number;
  finalInputCount: number;
  isModerator: boolean;
  onAdvancePhase: (next: SessionPhase) => void;
}

/**
 * SessionPhaseOrchestrator — the command bar for the structured dialogue pipeline.
 *
 * Shows current phase, countdown timer, progress dots, participant readiness,
 * and moderator controls. Replaces the old manual SegmentedControl.
 */
export function SessionPhaseOrchestrator({
  phase,
  timeRemainingMs,
  isExpired,
  sessionQuestion,
  memberCount,
  minParticipants,
  finalInputCount,
  isModerator,
  onAdvancePhase,
}: PhaseOrchestratorProps) {
  const config = PHASE_CONFIGS[phase];
  const Icon = PHASE_ICONS[phase];
  const currentIdx = phaseIndex(phase);

  return (
    <div className="space-y-3">
      {/* Session question banner */}
      {sessionQuestion ? (
        <div className="rounded-xl border border-brand/20 bg-brand/[0.04] px-5 py-4">
          <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-brand">
            Session question
          </p>
          <p className="mt-2 font-display text-[1.15rem] leading-snug text-ink italic">
            {sessionQuestion}
          </p>
        </div>
      ) : null}

      {/* Phase bar */}
      <div className="sr-vault-glass overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Phase icon + label */}
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-brand/[0.08] text-brand">
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-brand">
                Phase {currentIdx + 1} of {SESSION_PHASES.length}
              </p>
              <p className="font-sans text-[0.95rem] font-semibold text-ink">{config.label}</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Timer */}
          {timeRemainingMs !== null ? (
            <PhaseTimer timeRemainingMs={timeRemainingMs} isExpired={isExpired} phase={phase} />
          ) : null}

          {/* Moderator advance button */}
          {isModerator && config.next ? (
            <button
              type="button"
              onClick={() => onAdvancePhase(config.next!)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/[0.08] px-3 py-1.5 font-sans text-[0.78rem] font-semibold text-brand transition-all hover:border-brand/50 hover:bg-brand/[0.14]"
            >
              Advance
              <ChevronRight className="size-3.5" />
            </button>
          ) : null}
        </div>

        {/* Description + readiness strip */}
        <div className="border-t border-white/[0.04] bg-white/[0.01] px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-sans text-[0.82rem] text-ink-secondary">{config.description}</p>
            {phase === 'waiting' ? (
              <ReadinessPill
                current={memberCount}
                required={minParticipants}
                label="participants"
              />
            ) : phase === 'input' ? (
              <ReadinessPill current={finalInputCount} required={memberCount} label="submitted" />
            ) : null}
          </div>
        </div>

        {/* Progress dots */}
        <PhaseProgressBar currentPhase={phase} />
      </div>
    </div>
  );
}

// ── Phase Timer ─────────────────────────────────────────────────────

function PhaseTimer({
  timeRemainingMs,
  isExpired,
  phase,
}: {
  timeRemainingMs: number;
  isExpired: boolean;
  phase: SessionPhase;
}) {
  const isUrgent = timeRemainingMs < 60_000 && !isExpired; // < 1 minute
  const isWarning = timeRemainingMs < 300_000 && !isExpired; // < 5 minutes

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[1.1rem] font-bold tabular-nums transition-colors ${
        isExpired
          ? 'border-sem-danger/40 bg-sem-danger/[0.08] text-sem-danger'
          : isUrgent
            ? 'border-amber/40 bg-amber/[0.08] text-amber animate-pulse'
            : isWarning
              ? 'border-amber/25 bg-amber/[0.04] text-amber-light'
              : 'border-white/[0.06] bg-white/[0.02] text-ink'
      }`}
      role="timer"
      aria-live="polite"
      aria-label={`${formatCountdown(timeRemainingMs)} remaining in ${phase} phase`}
    >
      <Clock className="size-4 opacity-60" />
      {isExpired ? 'Time' : formatCountdown(timeRemainingMs)}
    </div>
  );
}

// ── Progress Bar ────────────────────────────────────────────────────

function PhaseProgressBar({ currentPhase }: { currentPhase: SessionPhase }) {
  const currentIdx = phaseIndex(currentPhase);

  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      role="progressbar"
      aria-valuenow={currentIdx + 1}
      aria-valuemin={1}
      aria-valuemax={SESSION_PHASES.length}
    >
      {SESSION_PHASES.map((p, idx) => {
        const Icon = PHASE_ICONS[p];
        const isActive = idx === currentIdx;
        const isCompleted = idx < currentIdx;

        return (
          <div
            key={p}
            className="flex items-center"
            style={{ flex: idx < SESSION_PHASES.length - 1 ? 1 : 0 }}
          >
            {/* Dot */}
            <div
              className={`relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                isActive
                  ? 'border-brand bg-brand/20 text-brand shadow-[0_0_12px_rgba(26,158,158,0.3)]'
                  : isCompleted
                    ? 'border-brand/60 bg-brand/10 text-brand/70'
                    : 'border-white/10 bg-white/[0.02] text-ink-subtle'
              }`}
              aria-label={`${PHASE_CONFIGS[p].label}${isActive ? ' (current)' : isCompleted ? ' (completed)' : ''}`}
            >
              <Icon className="size-3.5" strokeWidth={isActive ? 2 : 1.5} />
              {isActive ? (
                <span className="absolute inset-0 animate-ping rounded-full border border-brand/30" />
              ) : null}
            </div>

            {/* Connector line */}
            {idx < SESSION_PHASES.length - 1 ? (
              <div
                className={`mx-1 h-[2px] flex-1 rounded-full transition-all duration-700 ${
                  isCompleted ? 'bg-brand/50' : 'bg-white/[0.06]'
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ── Readiness Pill ──────────────────────────────────────────────────

function ReadinessPill({
  current,
  required,
  label,
}: {
  current: number;
  required: number;
  label: string;
}) {
  const ready = current >= required;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.72rem] font-semibold tabular-nums ${
        ready
          ? 'border-brand/30 bg-brand/[0.06] text-brand'
          : 'border-white/10 bg-white/[0.02] text-ink-faint'
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${ready ? 'bg-brand' : 'bg-ink-subtle'}`}
        aria-hidden
      />
      {current}/{required} {label}
    </span>
  );
}

export default SessionPhaseOrchestrator;
