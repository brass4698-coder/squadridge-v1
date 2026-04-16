import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_SESSION_ID, updateDemoSession } from '../lib/demoSession';

type Phase = 'searching' | 'matched';

const SEARCH_MS = 3000;
const SLOT_STAGGER_MS = [800, 1600, 2400] as const;
const SESSION_MINUTES = 45;

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function Match() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('searching');
  const [slots, setSlots] = useState([false, false, false]);
  /** Session end (match + 45min) — survives re-renders */
  const sessionEndsAtMs = useRef<number | null>(null);
  const [remainingSec, setRemainingSec] = useState(SESSION_MINUTES * 60);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const now = Date.now();
      sessionEndsAtMs.current = now + SESSION_MINUTES * 60 * 1000;
      setPhase('matched');
    }, SEARCH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timers = SLOT_STAGGER_MS.map((delay, i) =>
      window.setTimeout(() => {
        setSlots((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay),
    );
    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  useEffect(() => {
    if (phase !== 'matched' || sessionEndsAtMs.current === null) return;
    const tick = () => {
      const end = sessionEndsAtMs.current;
      if (end === null) return;
      const left = Math.ceil((end - Date.now()) / 1000);
      setRemainingSec(left);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase]);

  function goToSession() {
    updateDemoSession({ squadId: DEMO_SESSION_ID });
    navigate(`/session/${DEMO_SESSION_ID}`, { replace: true });
  }

  if (phase === 'searching') {
    return (
      <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full border-4 border-teal-500/30 animate-ping" aria-hidden />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 md:text-3xl">
            Finding your squad
          </h2>
          <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-slate-400 md:text-base">
            We&apos;re matching verified participants across borders for this session.
          </p>
          <div className="mt-12 flex w-full max-w-sm flex-col gap-4 text-left">
            {['A', 'B', 'C'].map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  slots[i] ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="h-8 w-8 shrink-0 rounded-full border-2 border-teal-500/40 animate-pulse" />
                <span className="font-sans text-sm text-slate-500">Participant {label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const squad = [
    { id: 'you', label: 'You', lang: 'EN', filled: true },
    { id: 'b', label: 'Participant B', lang: 'FR', filled: false },
    { id: 'c', label: 'Participant C', lang: 'KO', filled: false },
    { id: 'd', label: 'Participant D', lang: 'EN', filled: false },
  ] as const;

  return (
    <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 md:text-3xl">
          Your squad is ready.
        </h2>
        <p className="mt-3 font-sans text-sm text-slate-400 md:text-base">
          4 verified participants · 3 countries · 2 languages · One problem.
        </p>

        <div className="mt-10 border border-teal-900/60 rounded-xl bg-slate-900/40 p-6 text-left">
          <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-teal-light/90">
            Active mission
          </p>
          <h3 className="mt-2 font-heading text-lg font-bold text-slate-100 md:text-xl">
            Civilian protection protocols — cross-border displacement corridor
          </h3>
          <p className="mt-3 font-sans text-sm leading-relaxed text-slate-400">
            Draft three implementable de-escalation protocols. Consensus required. Time-boxed at 45 minutes.
          </p>
          <div
            className="mt-6 flex items-center justify-between gap-4 border-t border-slate-700/60 pt-5"
            aria-live="polite"
          >
            <span className="font-sans text-xs font-medium uppercase tracking-wider text-slate-500">Time remaining</span>
            <span className="font-mono text-xl font-semibold tabular-nums text-teal">
              {formatMmSs(remainingSec)}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {squad.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-heading text-xs font-semibold ${
                  m.filled ? 'border-teal bg-teal text-[#0b0f1a]' : 'border-teal-500/50 bg-transparent text-slate-400'
                }`}
                aria-label={m.label}
              >
                {m.id === 'you' ? 'You' : m.label.replace('Participant ', '')}
              </div>
              <span className="rounded border border-slate-600/80 px-2 py-0.5 font-mono text-[0.65rem] font-medium text-slate-400">
                {m.lang}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={goToSession}
          className="mt-12 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-90"
        >
          Enter squad room
        </button>
      </div>
    </div>
  );
}
