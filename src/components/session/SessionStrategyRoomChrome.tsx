import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SegmentedControl } from '../ui/SegmentedControl';
import { AlertFacilitatorButton } from './AlertFacilitatorButton';
import { CrisisResources } from './CrisisResources';

const PHASES = ['Intro', 'Round 1', 'Synthesis', 'Close'] as const;

const REACTIONS = ['+1', 'Holding', 'Thanks', 'Caution'] as const;

type PhaseId = (typeof PHASES)[number];

/** Facilitator-facing prompts to surface at each phase of a session. */
const PHASE_PROMPTS: Record<PhaseId, string[]> = {
  Intro: [
    'Set the ground rules: one person speaks at a time, no interruptions.',
    'Invite each participant to share one sentence about why they joined.',
    'Clarify the session goal \u2014 agree on what "done" looks like.',
  ],
  'Round 1': [
    'Ask each side: "What matters most to your community right now?"',
    'Reflect back what you heard before moving to the next speaker.',
    'If tension rises, name it: "I notice we\'re getting heated \u2014 let\'s pause 30 seconds."',
  ],
  Synthesis: [
    'Identify at least one point of genuine agreement, however small.',
    'Ask: "What would need to be true for both sides to accept this outcome?"',
    'Invite a volunteer to draft the first consensus bullet.',
  ],
  Close: [
    'Read back the agreed consensus bullets aloud for confirmation.',
    'Ask each participant: "Can you live with this outcome? Yes / abstain?"',
    'Remind the group: the outcome is private until the squad votes to publish.',
  ],
};

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
      <div className="flex flex-col gap-3 rounded-lg border border-[#1a2236] bg-[#0c121c] p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber/90">
            Strategy room
          </p>
          <h2 className="mt-0.5 break-words font-heading text-lg font-semibold text-slate-100">
            {topic}
          </h2>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-sans text-[0.7rem] uppercase tracking-wide text-slate-500">
            Time in room
          </p>
          <p className="font-mono text-[0.9rem] tabular-nums text-teal/90" aria-live="polite">
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

      <div className="rounded-lg border border-dashed border-[#2a3548] bg-[#0a0e14] px-4 py-3">
        <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
          Turn
        </p>
        <p className="mt-1 font-sans text-[0.9rem] leading-relaxed text-slate-200">{turnCta}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sans text-[0.7rem] uppercase tracking-wide text-slate-500">
          Reactions
        </span>
        {REACTIONS.map((r) => (
          <button
            key={r}
            type="button"
            className="rounded-md border border-[#1a2236] bg-[#0f1623] px-2.5 py-1 font-sans text-[0.75rem] text-slate-300 hover:border-teal/35"
            onClick={() => {
              /* local-only signal in MVP; wire Realtime in follow-up */
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Facilitator prompts — phase-aware guidance, visible only to the facilitator */}
      <FacilitatorPrompts phase={phase} />

      {interventionBanner ? (
        <div
          className="rounded-lg border border-amber/35 bg-[#1a1408] px-4 py-3 font-sans text-[0.85rem] text-[#f5d7a3]"
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
            className="inline-flex min-h-[40px] items-center rounded-md border border-[#2d3f55] px-3 font-sans text-[0.8rem] text-slate-300 hover:border-teal/35"
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

/** Phase-aware facilitator prompts collapsed by default (not visible to participants). */
function FacilitatorPrompts({ phase }: { phase: PhaseId }) {
  const [open, setOpen] = useState(false);
  const prompts = PHASE_PROMPTS[phase];
  return (
    <div className="rounded-lg border border-dashed border-teal/20 bg-[#070c12] px-3 py-2.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-teal/70">
          Facilitator prompts · {phase}
        </span>
        <span className="font-mono text-[0.65rem] text-slate-600" aria-hidden>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open ? (
        <ul className="mt-2.5 space-y-1.5 pl-0">
          {prompts.map((p) => (
            <li key={p} className="flex gap-2 font-sans text-[0.8rem] leading-snug text-slate-400">
              <span className="mt-0.5 shrink-0 select-none text-teal/40" aria-hidden>
                →
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}
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
