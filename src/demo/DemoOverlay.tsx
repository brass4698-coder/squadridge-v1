import { useEffect, useState, type CSSProperties } from 'react';
import type { DemoOverlayStep } from './demoScript';
import { resolveObserverRoot, scrollAllRootsToTop } from './scrollRoot';

type Props = {
  steps: DemoOverlayStep[] | undefined;
  /** Increment to re-measure spotlight when layout changes */
  layoutKey?: number;
};

type SpotlightRect = { top: number; left: number; width: number; height: number };

/** Quiet tour surface — readable, not loud. */
const TOUR_PANEL = 'sr-tour-bubble';

const HEADER_SAFE = 96;
const FOOTER_SAFE = 118;
const BUBBLE_ESTIMATE = 120;

function clampBubbleTop(top: number): number {
  const maxTop = window.innerHeight - FOOTER_SAFE - BUBBLE_ESTIMATE;
  return Math.min(Math.max(top, HEADER_SAFE), Math.max(HEADER_SAFE, maxTop));
}

function positionForRect(rect: SpotlightRect | null): CSSProperties {
  if (!rect) {
    return {
      top: `${HEADER_SAFE}px`,
      left: '50%',
      transform: 'translateX(-50%)',
    };
  }

  const centerX = Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180);
  const spaceBelow = window.innerHeight - (rect.top + rect.height) - FOOTER_SAFE;
  const preferBelow = spaceBelow >= BUBBLE_ESTIMATE + 8;

  if (preferBelow) {
    return {
      top: `${clampBubbleTop(rect.top + rect.height + 10)}px`,
      left: `${centerX}px`,
      transform: 'translateX(-50%)',
    };
  }

  return {
    top: `${clampBubbleTop(rect.top - BUBBLE_ESTIMATE - 10)}px`,
    left: `${centerX}px`,
    transform: 'translateX(-50%)',
  };
}

function measureSelector(selector: string): SpotlightRect | null {
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement)) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 && r.height < 2) return null;
  const height = Math.min(r.height, Math.max(48, window.innerHeight * 0.28));
  return { top: r.top, left: r.left, width: r.width, height };
}

/**
 * Guided tour bubbles + soft spotlight.
 * Bubbles reveal as their targets enter the scroll viewport — pages always start at the top.
 */
export function DemoOverlay({ steps, layoutKey = 0 }: Props) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [rects, setRects] = useState<Record<string, SpotlightRect | null>>({});

  // New demo step: stay at the top; clear prior reveals.
  useEffect(() => {
    setRevealed({});
    setRects({});
    scrollAllRootsToTop();
  }, [layoutKey]);

  // Reveal free-floating tips (no selector) shortly after the step loads.
  useEffect(() => {
    if (!steps?.length) return;
    const orphans = steps.filter((s) => !s.selector);
    if (!orphans.length) return;
    const id = window.setTimeout(() => {
      setRevealed((prev) => {
        const next = { ...prev };
        for (const s of orphans) next[s.id] = true;
        return next;
      });
    }, 280);
    return () => window.clearTimeout(id);
  }, [steps, layoutKey]);

  // IntersectionObserver: pop bubbles as targets scroll into view.
  useEffect(() => {
    if (!steps?.length) return;

    const withSelectors = steps.filter((s) => s.selector);
    if (!withSelectors.length) return;

    let cancelled = false;
    const observers: IntersectionObserver[] = [];

    const attach = () => {
      if (cancelled) return;
      const root = resolveObserverRoot();

      for (const step of withSelectors) {
        const el = document.querySelector(step.selector!);
        if (!el) continue;

        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              setRevealed((prev) => (prev[step.id] ? prev : { ...prev, [step.id]: true }));
            }
          },
          {
            root,
            threshold: 0.18,
            rootMargin: '0px 0px -12% 0px',
          },
        );
        io.observe(el);
        observers.push(io);
      }
    };

    // Targets may mount after route paint.
    const t1 = window.setTimeout(attach, 60);
    const t2 = window.setTimeout(attach, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observers.forEach((o) => o.disconnect());
    };
  }, [steps, layoutKey]);

  // Keep rects in sync while revealed bubbles are visible.
  useEffect(() => {
    if (!steps?.length) return;

    const update = () => {
      const next: Record<string, SpotlightRect | null> = {};
      for (const step of steps) {
        if (!revealed[step.id] || !step.selector) {
          next[step.id] = null;
          continue;
        }
        next[step.id] = measureSelector(step.selector);
      }
      setRects(next);
    };

    update();
    const id = window.setTimeout(update, 120);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [steps, revealed, layoutKey]);

  if (!steps?.length) return null;

  const visibleSteps = steps.filter((s) => revealed[s.id]);
  if (!visibleSteps.length) return null;

  // First revealed selector gets the soft spotlight ring.
  const spotlightStep = visibleSteps.find((s) => s.selector && rects[s.id]);
  const spotlightRect = spotlightStep ? rects[spotlightStep.id] : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[45]" aria-live="polite">
      {spotlightRect ? (
        <div
          className="absolute rounded-md ring-1 ring-[color:var(--sr-primary)]/40 ring-offset-2 ring-offset-[#0c1220]/50 transition-opacity duration-300"
          style={{
            top: `${spotlightRect.top - 3}px`,
            left: `${spotlightRect.left - 3}px`,
            width: `${spotlightRect.width + 6}px`,
            height: `${spotlightRect.height + 6}px`,
          }}
          aria-hidden
        />
      ) : null}

      {visibleSteps.map((step, index) => {
        const rect = step.selector ? (rects[step.id] ?? null) : null;
        const style = positionForRect(rect);
        // Stack free-floating / overlapping tips slightly so they don't fully collide.
        if (!rect && index > 0) {
          const baseTop = Number.parseFloat(String(style.top ?? HEADER_SAFE)) || HEADER_SAFE;
          style.top = `${baseTop + index * 72}px`;
        }

        const preferBelow =
          rect &&
          window.innerHeight - (rect.top + rect.height) - FOOTER_SAFE >= BUBBLE_ESTIMATE + 8;

        return (
          <div
            key={step.id}
            className={`pointer-events-none absolute z-[46] w-[min(88vw,340px)] sr-demo-bubble-enter rounded-lg px-3.5 py-2.5 ${TOUR_PANEL}`}
            style={style}
            role="note"
          >
            {rect ? (
              <div
                className={
                  preferBelow
                    ? 'absolute -top-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-b-[6px] border-x-transparent border-b-[#0c1220]/82'
                    : 'absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-[#0c1220]/82'
                }
                aria-hidden
              />
            ) : null}
            <p className="mb-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.12em] sr-tour-bubble__label">
              Hint
            </p>
            <p className="m-0 font-sans text-[0.8rem] leading-snug text-slate-200/95">
              {step.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
