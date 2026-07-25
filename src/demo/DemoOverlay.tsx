import { useEffect, useId, useState, type CSSProperties } from 'react';
import type { DemoStep, DemoTip, DemoTipPlacement } from './demoScript';
import { resolveObserverRoot, scrollAllRootsToTop } from './scrollRoot';

type Props = {
  step: DemoStep | null;
  tip: DemoTip | null;
  tipIndex: number;
  tipCount: number;
  stepIndex: number;
  stepCount: number;
  tipOrdinal: number;
  tipTotal: number;
  sheetMinimized: boolean;
  onMinimizeSheet: () => void;
  onExpandSheet: () => void;
  /** Re-measure when layout / tip changes */
  layoutKey?: string;
};

type SpotlightRect = { top: number; left: number; width: number; height: number };

const HEADER_SAFE = 88;
const FOOTER_SAFE = 118;
const BUBBLE_ESTIMATE = 110;

function clampBubbleTop(top: number): number {
  const maxTop = window.innerHeight - FOOTER_SAFE - BUBBLE_ESTIMATE;
  return Math.min(Math.max(top, HEADER_SAFE), Math.max(HEADER_SAFE, maxTop));
}

function resolvePlacement(
  rect: SpotlightRect,
  preferred: DemoTipPlacement | undefined,
): 'above' | 'below' {
  if (preferred === 'above' || preferred === 'below') return preferred;
  const spaceBelow = window.innerHeight - (rect.top + rect.height) - FOOTER_SAFE;
  return spaceBelow >= BUBBLE_ESTIMATE + 8 ? 'below' : 'above';
}

function positionForRect(
  rect: SpotlightRect | null,
  placement: DemoTipPlacement | undefined,
): { style: CSSProperties; place: 'above' | 'below' } {
  if (!rect) {
    return {
      place: 'below',
      style: {
        top: `${HEADER_SAFE}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      },
    };
  }

  const place = resolvePlacement(rect, placement);
  const centerX = Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180);

  if (place === 'below') {
    return {
      place,
      style: {
        top: `${clampBubbleTop(rect.top + rect.height + 10)}px`,
        left: `${centerX}px`,
        transform: 'translateX(-50%)',
      },
    };
  }

  return {
    place,
    style: {
      top: `${clampBubbleTop(rect.top - BUBBLE_ESTIMATE - 10)}px`,
      left: `${centerX}px`,
      transform: 'translateX(-50%)',
    },
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

function scrollTargetIntoView(selector: string): void {
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement)) return;
  const root = resolveObserverRoot();
  el.scrollIntoView({
    block: 'center',
    inline: 'nearest',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
  // Ensure nested scroll roots also settle.
  if (root && root !== document.documentElement) {
    const r = el.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    if (r.top < rootRect.top + 40 || r.bottom > rootRect.bottom - 40) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
}

/**
 * Guided tour surfaces: persistent side sheet + optional single anchored callout/spotlight.
 * One tip at a time — advanced by tour Next/Back, not scroll stacking.
 */
export function DemoOverlay({
  step,
  tip,
  tipIndex,
  tipCount,
  stepIndex,
  stepCount,
  tipOrdinal,
  tipTotal,
  sheetMinimized,
  onMinimizeSheet,
  onExpandSheet,
  layoutKey = '0',
}: Props) {
  const titleId = useId();
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [exiting, setExiting] = useState(false);
  const [displayTip, setDisplayTip] = useState<DemoTip | null>(tip);

  // Reset scroll when the route step changes.
  useEffect(() => {
    scrollAllRootsToTop();
  }, [step?.id]);

  // Calm tip swap: brief exit, then enter next tip.
  useEffect(() => {
    if (!tip) {
      setDisplayTip(null);
      return;
    }
    if (!displayTip || displayTip.id === tip.id) {
      setDisplayTip(tip);
      setExiting(false);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplayTip(tip);
      setExiting(false);
      return;
    }
    setExiting(true);
    const id = window.setTimeout(() => {
      setDisplayTip(tip);
      setExiting(false);
    }, 200);
    return () => window.clearTimeout(id);
  }, [tip, displayTip]);

  // Scroll target into view and keep rect measured.
  useEffect(() => {
    if (!displayTip?.target || exiting) {
      setRect(null);
      return;
    }

    const selector = displayTip.target;
    const update = () => setRect(measureSelector(selector));

    const tScroll = window.setTimeout(() => scrollTargetIntoView(selector), 40);
    const t1 = window.setTimeout(update, 80);
    const t2 = window.setTimeout(update, 360);

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.clearTimeout(tScroll);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [displayTip?.id, displayTip?.target, exiting, layoutKey]);

  if (!step || !displayTip) return null;

  const showSpotlight = Boolean(displayTip.target);
  const showCalloutBubble = displayTip.type === 'callout' && Boolean(displayTip.target);
  const { style: calloutStyle, place } = positionForRect(rect, displayTip.placement);
  const enterClass = exiting ? 'sr-demo-surface-exit' : 'sr-demo-surface-enter';
  const tipLabel = tipCount > 1 ? `Tip ${tipIndex + 1} of ${tipCount}` : 'Guide';

  return (
    <div className="pointer-events-none fixed inset-0 z-[45]" aria-live="polite">
      {displayTip.blockInteraction ? (
        <div className="pointer-events-auto absolute inset-0 bg-surface/40" aria-hidden />
      ) : null}

      {showSpotlight && rect ? (
        <div
          className={`absolute rounded-md ring-1 ring-brand/40 ring-offset-2 ring-offset-surface transition-opacity ${enterClass}`}
          style={{
            top: `${rect.top - 3}px`,
            left: `${rect.left - 3}px`,
            width: `${rect.width + 6}px`,
            height: `${rect.height + 6}px`,
          }}
          aria-hidden
        />
      ) : null}

      {showCalloutBubble ? (
        <div
          className="pointer-events-none absolute z-[46] w-[min(88vw,280px)]"
          style={calloutStyle}
        >
          <div className={`sr-tour-bubble rounded-lg px-3.5 py-2.5 ${enterClass}`}>
            {rect ? (
              <div
                className={
                  place === 'below'
                    ? 'absolute -top-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-b-[6px] border-x-transparent border-b-[color:var(--sr-tour-surface)]'
                    : 'absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-[color:var(--sr-tour-surface)]'
                }
                aria-hidden
              />
            ) : null}
            <p className="mb-0.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.12em] sr-tour-bubble__label">
              {tipLabel}
            </p>
            <p className="m-0 font-sans text-[0.8rem] font-medium leading-snug text-ink">
              {displayTip.title}
            </p>
          </div>
        </div>
      ) : null}

      {sheetMinimized ? (
        <button
          type="button"
          className="pointer-events-auto absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-[47] rounded-lg border border-line bg-surface-elevated px-3 py-2 font-sans text-xs font-semibold text-ink shadow-md transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--sr-focus)] sm:bottom-auto sm:top-[5.5rem]"
          onClick={onExpandSheet}
        >
          Show guide
        </button>
      ) : (
        <aside
          className={`pointer-events-auto sr-tour-sheet fixed z-[47] flex flex-col ${enterClass}`}
          aria-labelledby={titleId}
          role="complementary"
        >
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <p className="m-0 font-mono text-[0.6rem] font-medium uppercase tracking-[0.12em] text-brand">
                Step {stepIndex + 1} of {stepCount}
                {tipTotal > 0 ? (
                  <span className="text-ink-faint">
                    {' '}
                    · {tipOrdinal}/{tipTotal}
                  </span>
                ) : null}
              </p>
              <h2
                id={titleId}
                className="mt-1 m-0 truncate font-sans text-sm font-semibold text-ink"
              >
                {step.title}
              </h2>
              {step.description ? (
                <p className="mt-0.5 mb-0 text-xs leading-snug text-ink-secondary">
                  {step.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md border border-line bg-transparent px-2 py-1 font-sans text-xs font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--sr-focus)]"
              onClick={onMinimizeSheet}
              aria-label="Hide guide panel"
            >
              Hide
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <p className="m-0 font-mono text-[0.6rem] font-medium uppercase tracking-[0.12em] text-ink-faint">
              {displayTip.title}
            </p>
            <p className="mt-2 mb-0 font-sans text-sm leading-relaxed text-ink-secondary">
              {displayTip.body}
            </p>
            {tipCount > 1 ? (
              <p className="mt-3 mb-0 font-mono text-[0.65rem] text-ink-faint">
                Tip {tipIndex + 1} of {tipCount} on this screen · Next continues
              </p>
            ) : (
              <p className="mt-3 mb-0 font-mono text-[0.65rem] text-ink-faint">
                Next continues the tour
              </p>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
