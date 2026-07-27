import type { ReactNode } from 'react';
import { DIALOGUE_STAGE_CONFIGS, type DialogueStage } from '../../lib/dialogueStages';
import { stageOrdinal, type PhaseTimerState, type TimerUrgency } from '../../lib/phaseTimer';
import { PhaseTimer } from './PhaseTimer';

export interface RoomRosterEntry {
  id: string;
  label: string;
  status?: string;
  hasFloor?: boolean;
  heat?: number | null;
  heatSlot?: ReactNode;
}

export interface RoomShellProps {
  sessionTitle: string;
  sessionIdShort: string;
  dialogueStage: DialogueStage;
  facilitatorPresent?: boolean;
  quietMode: boolean;
  onQuietModeChange: (next: boolean) => void;
  remainingSeconds: number | null;
  durationSeconds: number | null;
  timerState: PhaseTimerState;
  urgency: TimerUrgency;
  roster: RoomRosterEntry[];
  /** Ambient border tint 0–1 when heat data exists; omit for static shell. */
  ambientHeat?: number | null;
  docketExtra?: ReactNode;
  feed: ReactNode;
  composer?: ReactNode;
  topExtra?: ReactNode;
  className?: string;
}

function ambientBorderClass(heat: number | null | undefined): string {
  if (heat == null || Number.isNaN(heat)) {
    return 'border-[color:var(--sr-mode-room-border)]';
  }
  if (heat >= 0.7) return 'border-sem-warning/50';
  if (heat >= 0.4) return 'border-brand/35';
  return 'border-[color:var(--sr-mode-room-border)]';
}

/**
 * Three-zone facilitated room: phase docket | deliberation feed | roster.
 */
export function RoomShell({
  sessionTitle,
  sessionIdShort,
  dialogueStage,
  facilitatorPresent = true,
  quietMode,
  onQuietModeChange,
  remainingSeconds,
  durationSeconds,
  timerState,
  urgency,
  roster,
  ambientHeat,
  docketExtra,
  feed,
  composer,
  topExtra,
  className = '',
}: RoomShellProps) {
  const stageConfig = DIALOGUE_STAGE_CONFIGS[dialogueStage];
  const { index, total } = stageOrdinal(dialogueStage);

  return (
    <div
      className={`sr-mode-room flex h-[min(100vh,56rem)] min-h-[32rem] flex-col overflow-hidden rounded-lg border bg-surface ${ambientBorderClass(ambientHeat)} ${className}`}
      data-quiet={quietMode ? 'true' : 'false'}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-elevated px-4 py-3 md:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
            Case {sessionIdShort}
            {facilitatorPresent ? ' · Facilitator present' : ''}
          </p>
          <h1 className="truncate text-base font-semibold text-ink">{sessionTitle}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PhaseTimer
            remainingSeconds={remainingSeconds}
            durationSeconds={durationSeconds}
            timerState={timerState}
            urgency={urgency}
          />
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-xs text-ink-secondary">
            <input
              type="checkbox"
              checked={quietMode}
              onChange={(e) => onQuietModeChange(e.target.checked)}
              className="h-4 w-4 rounded border-line"
            />
            Quiet mode
          </label>
        </div>
      </header>

      {topExtra}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)_13rem]">
        <aside className="border-b border-line bg-surface-secondary/60 p-4 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Phase docket
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">
            Phase {index} of {total}: {stageConfig.label}
          </p>
          {!quietMode ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              {stageConfig.facilitatorPrompt}
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink-faint">Quiet mode — prompts minimized.</p>
          )}
          {docketExtra}
        </aside>

        <section className="flex min-h-0 flex-col border-b border-line lg:border-b-0 lg:border-r">
          {feed}
          {composer}
        </section>

        <aside className="overflow-y-auto bg-surface-secondary/40 p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Roster
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {roster.length === 0 ? (
              <li className="text-xs text-ink-secondary">No participants yet.</li>
            ) : (
              roster.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {p.label}
                      {p.hasFloor ? (
                        <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-brand">
                          floor
                        </span>
                      ) : null}
                    </p>
                    {p.status ? (
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                        {p.status}
                      </p>
                    ) : null}
                  </div>
                  {p.heatSlot}
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}
