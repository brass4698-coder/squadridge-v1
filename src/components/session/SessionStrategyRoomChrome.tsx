import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SegmentedControl } from '../ui/SegmentedControl';
import { AlertFacilitatorButton } from './AlertFacilitatorButton';
import { CrisisResources } from './CrisisResources';

const PHASES = ['Intro', 'Round 1', 'Synthesis', 'Close'] as const;

const REACTIONS = ['+1', 'Holding', 'Thanks', 'Caution'] as const;

type PhaseId = (typeof PHASES)[number];

export function SessionStrategyRoomChrome({
  topic,
  roomStartedAt,
  currentPhase: controlledPhase,
  onPhaseChange,
  turnCta,
  interventionBanner,
  onReportRoom,
  onReportParticipant,
  squadId,
}: {
  topic: string;
  roomStartedAt: Date;
  currentPhase?: PhaseId;
  onPhaseChange?: (p: PhaseId) => void;
  turnCta: string;
  interventionBanner: string | null;
  onReportRoom: () => void;
  onReportParticipant: () => void;
  /**
   * When set, an "Alert facilitator" button calls the `crisis-alert` Edge
   * Function for this squad. Omit for the offline demo room (no Supabase).
   */
  squadId?: string;
}) {
  const [uncontrolledPhase, setUncontrolledPhase] = useState<PhaseId>('Intro');
  const phase = controlledPhase ?? uncontrolledPhase;
  const setPhase = (p: PhaseId) => {
    onPhaseChange?.(p);
    if (controlledPhase === undefined) setUncontrolledPhase(p);
  };

  const elapsed = useElapseLabel(roomStartedAt);

  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber/90">
            Strategy room
          </p>
          <h2 className="mt-0.5 break-words font-heading text-lg font-semibold text-slate-100">
            {topic}
          </h2>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-sans text-[0.7rem] uppercase tracking-wide text-ink-subtle">
            Time in room
          </p>
          <p className="font-mono text-[0.9rem] tabular-nums text-brand" aria-live="polite">
            {elapsed}
          </p>
        </div>
      </div>

      <SegmentedControl<PhaseId>
        ariaLabel="Session phase"
        size="sm"
        value={phase}
        onChange={setPhase}
        options={PHASES.map((p) => ({ value: p, label: p }))}
      />

      <div className="rounded-lg border border-dashed border-line-strong bg-surface-sunken px-4 py-3">
        <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
          Turn
        </p>
        <p className="mt-1 font-sans text-[0.9rem] leading-relaxed text-slate-200">{turnCta}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sans text-[0.7rem] uppercase tracking-wide text-ink-subtle">
          Reactions
        </span>
        {REACTIONS.map((r) => (
          <button
            key={r}
            type="button"
            className="focus-ring rounded-md border border-line bg-surface px-2.5 py-1 font-sans text-[0.75rem] text-ink-secondary hover:border-brand/35"
            onClick={() => {
              /* local-only signal in MVP; wire Realtime in follow-up */
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {interventionBanner ? (
        <div
          className="rounded-lg border border-sem-warning bg-sem-warning-soft px-4 py-3 font-sans text-[0.85rem] text-sem-warning"
          role="status"
        >
          <span className="font-semibold text-amber/95">Intervention: </span>
          {interventionBanner}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/session"
            className="focus-ring inline-flex min-h-[40px] items-center rounded-md border border-line-strong px-3 font-sans text-[0.8rem] text-ink-secondary hover:border-brand/35"
          >
            Exit to hub
          </Link>
          <button
            type="button"
            onClick={onReportRoom}
            className="inline-flex min-h-[40px] items-center rounded-md border border-amber/25 px-3 font-sans text-[0.8rem] text-amber-200/90 hover:border-amber/45"
          >
            Report room
          </button>
          <button
            type="button"
            onClick={onReportParticipant}
            className="inline-flex min-h-[40px] items-center rounded-md border border-amber/25 px-3 font-sans text-[0.8rem] text-amber-200/90 hover:border-amber/45"
          >
            Report participant
          </button>
          {squadId ? <AlertFacilitatorButton squadId={squadId} /> : null}
        </div>
        <span className="max-w-[14rem] text-right font-sans text-[0.7rem] leading-snug text-slate-500">
          If in immediate danger, use your local emergency number — not the app.
        </span>
      </div>

      <CrisisResources className="mt-1" />
    </div>
  );
}

function useElapseLabel(started: Date) {
  const [label, setLabel] = useState(() => formatElapsed(started));
  useEffect(() => {
    setLabel(formatElapsed(started));
    const id = window.setInterval(() => setLabel(formatElapsed(started)), 1000);
    return () => clearInterval(id);
  }, [started]);
  return label;
}

function formatElapsed(started: Date) {
  const sec = Math.max(0, Math.floor((Date.now() - started.getTime()) / 1000));
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}
