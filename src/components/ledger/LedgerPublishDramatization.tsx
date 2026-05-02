import { useEffect, useRef, useState } from 'react';
import { Check, FileText, ListChecks, Loader2, Play, Send } from 'lucide-react';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';
import { cn } from '../../lib/cn';

/**
 * Demo-only dramatization of the ledger publish lifecycle. Mirrors the four
 * beats in the active scenario (`scenario.ledgerBeats`) with paced timers and
 * stage indicators so a presenter can talk through the consensus → publish
 * loop without invoking the real `publish-ledger-proposal` Edge Function.
 *
 * Rendered inside `LedgerDemoProposalDetail`. Has no side effects on a real
 * proposal record.
 */

type RunState = 'idle' | 'running' | 'finished';

const STAGE_DELAYS_MS = [800, 1800, 2800, 3600];

const STAGE_ICONS = [FileText, ListChecks, Send, Check] as const;

export function LedgerPublishDramatization() {
  const { scenario } = useDemoWalkthrough();
  const beats = scenario.ledgerBeats;

  const [state, setState] = useState<RunState>('idle');
  const [activeIndex, setActiveIndex] = useState(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  function play() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setActiveIndex(0);
    setState('running');

    STAGE_DELAYS_MS.slice(0, beats.length).forEach((delay, idx) => {
      const id = window.setTimeout(() => {
        setActiveIndex(idx);
        if (idx === beats.length - 1) setState('finished');
      }, delay);
      timersRef.current.push(id);
    });
  }

  function reset() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setState('idle');
    setActiveIndex(0);
  }

  return (
    <section
      className="mt-6 rounded-xl border border-amber/30 bg-[#0a0f16] px-5 py-5"
      aria-labelledby="ledger-publish-dramatization"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            id="ledger-publish-dramatization"
            className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-amber/95"
          >
            Demo flow · publish dramatization
          </p>
          <h3 className="mt-1 font-heading text-[1rem] font-semibold tracking-tight text-slate-100">
            Consensus → publish, paced for the room
          </h3>
          <p className="mt-1 max-w-[44rem] font-sans text-[0.8rem] leading-relaxed text-slate-400">
            Plays the four production beats of the publish loop without touching the live Edge
            Function. The same stages drive the real{' '}
            <code className="text-slate-300">publish-ledger-proposal</code> path.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={play}
            disabled={state === 'running'}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-amber px-3 py-2 font-heading text-[0.82rem] font-semibold text-[#0b0f1a] disabled:cursor-not-allowed disabled:opacity-50"
            data-demo="ledger-publish-play"
          >
            {state === 'running' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Playing…
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden /> Play publish
              </>
            )}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={state === 'idle'}
            className="inline-flex min-h-[40px] items-center rounded-md border border-slate-600 bg-transparent px-3 py-2 font-sans text-[0.82rem] text-slate-300 hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </header>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {beats.map((beat, idx) => {
          const Icon = STAGE_ICONS[idx] ?? Check;
          const reached = state === 'finished' || (state === 'running' && idx <= activeIndex);
          const current = state === 'running' && idx === activeIndex;
          return (
            <li
              key={beat.label}
              className={cn(
                'flex items-start gap-3 rounded-lg border px-3 py-3 transition-colors',
                reached
                  ? 'border-amber/40 bg-amber/[0.05]'
                  : 'border-slate-800/80 bg-white/[0.02] opacity-70',
              )}
              aria-current={current ? 'step' : undefined}
            >
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber/45 bg-amber/[0.08] text-amber-light">
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[0.85rem] font-semibold text-slate-100">
                  {beat.label}
                </p>
                <p className="mt-0.5 font-sans text-[0.78rem] leading-snug text-slate-400">
                  {beat.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
