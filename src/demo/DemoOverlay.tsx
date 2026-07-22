import { useEffect, useState } from 'react';
import type { DemoOverlayStep } from './demoScript';

type Props = {
  steps: DemoOverlayStep[] | undefined;
  /** Increment to re-measure spotlight when layout changes */
  layoutKey?: number;
};

type SpotlightRect = { top: number; left: number; width: number; height: number };

/** Fixed dark tour surface — never inherits institutional light tokens. */
const TOUR_PANEL = 'border border-amber-400/40 bg-[#0c1220] text-[#f8fafc] shadow-2xl';

const HEADER_SAFE = 88;
const FOOTER_SAFE = 110;
const BUBBLE_ESTIMATE = 168;

/**
 * Guided tour bubbles + optional spotlight ring on the first selector.
 * Demo mode only — not a full coach-mark library.
 */
export function DemoOverlay({ steps, layoutKey = 0 }: Props) {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

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
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      const r = el.getBoundingClientRect();
      // Cap spotlight height so huge sections don't dominate the viewport.
      const height = Math.min(r.height, Math.max(64, window.innerHeight * 0.35));
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height,
      });
    };
    const id = window.setTimeout(measure, 50);
    const id2 = window.setTimeout(measure, 350);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.clearTimeout(id);
      window.clearTimeout(id2);
    };
  }, [steps, layoutKey]);

  if (!steps?.length) return null;

  const bubbleStyle = (() => {
    const maxTop = window.innerHeight - FOOTER_SAFE - BUBBLE_ESTIMATE;
    const clampTop = (top: number) =>
      Math.min(Math.max(top, HEADER_SAFE), Math.max(HEADER_SAFE, maxTop));

    if (!rect) {
      return {
        top: `${HEADER_SAFE}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'auto' as const,
      };
    }

    const centerX = Math.min(Math.max(rect.left + rect.width / 2, 210), window.innerWidth - 210);
    const spaceBelow = window.innerHeight - (rect.top + rect.height) - FOOTER_SAFE;
    const preferBelow = spaceBelow >= BUBBLE_ESTIMATE + 12;

    if (preferBelow) {
      return {
        top: `${clampTop(rect.top + rect.height + 14)}px`,
        left: `${centerX}px`,
        transform: 'translateX(-50%)',
        bottom: 'auto' as const,
      };
    }

    // Place above the target, still inside the safe band (no negative/clipped tops).
    return {
      top: `${clampTop(rect.top - BUBBLE_ESTIMATE - 14)}px`,
      left: `${centerX}px`,
      transform: 'translateX(-50%)',
      bottom: 'auto' as const,
    };
  })();

  const arrowPointsDown = Boolean(
    rect && window.innerHeight - (rect.top + rect.height) - FOOTER_SAFE >= BUBBLE_ESTIMATE + 12,
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[45]" aria-live="polite">
      {rect ? (
        <div
          className="absolute rounded-lg ring-2 ring-amber-400/80 ring-offset-2 ring-offset-[#0c1220]/80"
          style={{
            top: `${rect.top - 4}px`,
            left: `${rect.left - 4}px`,
            width: `${rect.width + 8}px`,
            height: `${rect.height + 8}px`,
          }}
          aria-hidden
        />
      ) : null}

      <div
        className={`pointer-events-none absolute z-[46] w-[min(92vw,420px)] rounded-xl px-4 py-3 ${TOUR_PANEL}`}
        style={bubbleStyle}
        role="note"
      >
        {rect ? (
          <div
            className={
              arrowPointsDown
                ? 'absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-b-8 border-x-transparent border-b-[#0c1220]'
                : 'absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-[#0c1220]'
            }
            aria-hidden
          />
        ) : null}
        <p className="mb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-amber-300">
          Direction
        </p>
        <ul className="list-none space-y-2 font-sans text-[0.85rem] leading-snug text-[#f1f5f9]">
          {steps.map((s) => (
            <li key={s.id} className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-amber-300" aria-hidden>
                →
              </span>
              <span>{s.content}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
