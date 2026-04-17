import { useEffect, useState } from 'react';
import type { DemoOverlayStep } from './demoScript';

type Props = {
  steps: DemoOverlayStep[] | undefined;
  /** Increment to re-measure spotlight when layout changes */
  layoutKey?: number;
};

/**
 * Lightweight tour overlay — demo mode only. Spotlight is a soft ring; not a full coach-mark library.
 */
export function DemoOverlay({ steps, layoutKey = 0 }: Props) {
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!steps?.length) {
      setRect(null);
      return;
    }
    const firstWithSelector = steps.find((s) => s.selector);
    if (!firstWithSelector?.selector) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector(firstWithSelector.selector!);
      if (!el || !(el instanceof HTMLElement)) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const id = window.setTimeout(measure, 300);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.clearTimeout(id);
    };
  }, [steps, layoutKey]);

  if (!steps?.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[45]">
      {rect ? (
        <div
          className="absolute rounded-lg ring-2 ring-amber/50 ring-offset-2 ring-offset-[#070b12]/90"
          style={{
            top: `${rect.top - 4}px`,
            left: `${rect.left - 4}px`,
            width: `${rect.width + 8}px`,
            height: `${rect.height + 8}px`,
          }}
          aria-hidden
        />
      ) : null}
      <div className="pointer-events-none absolute bottom-[5.5rem] left-1/2 z-[46] w-[min(92vw,420px)] -translate-x-1/2 rounded-lg border border-navy-light/60 bg-[#070b12]/95 px-4 py-3 shadow-xl backdrop-blur-md">
        <ul className="list-inside list-disc space-y-1 font-sans text-[0.8rem] leading-snug text-slate-200">
          {steps.map((s) => (
            <li key={s.id}>{s.content}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
