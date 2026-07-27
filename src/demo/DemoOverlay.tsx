import { useEffect, useId, useState, type CSSProperties } from 'react';
import type { DemoStep, DemoTip, DemoTipPlacement } from './demoScript';
import { resolveObserverRoot, scrollAllRootsToTop } from './scrollRoot';

type Props = {
  step: DemoStep | null;
  tip: DemoTip | null;
  tipIndex: number;
  tipCount: number;
  tipOrdinal: number;
  tipTotal: number;
  sheetMinimized: boolean;
  onMinimizeSheet: () => void;
  onExpandSheet: () => void;
  /** Re-measure when layout / tip changes */
  layoutKey?: string;
};

type SpotlightRect = { top: number; left: number; width: number; height: number };
type Place = 'above' | 'below' | 'left' | 'right';

const PAD = 8;
const HEADER_SAFE = 72;
const FOOTER_SAFE = 96;
const CALLOUT_W = 240;
const CALLOUT_H = 88;
const GAP = 14;

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function resolvePlacement(rect: SpotlightRect, preferred: DemoTipPlacement | undefined): Place {
  if (preferred === 'above' || preferred === 'below') return preferred;
  const spaceBelow = window.innerHeight - (rect.top + rect.height) - FOOTER_SAFE;
  const spaceAbove = rect.top - HEADER_SAFE;
  const spaceRight = window.innerWidth - (rect.left + rect.width) - 16;
  const spaceLeft = rect.left - 16;

  if (spaceBelow >= CALLOUT_H + GAP) return 'below';
  if (spaceAbove >= CALLOUT_H + GAP) return 'above';
  if (spaceRight >= CALLOUT_W + GAP) return 'right';
  if (spaceLeft >= CALLOUT_W + GAP) return 'left';
  return spaceBelow >= spaceAbove ? 'below' : 'above';
}

function positionForRect(
  rect: SpotlightRect | null,
  placement: DemoTipPlacement | undefined,
): { style: CSSProperties; place: Place } {
  if (!rect) {
    return {
      place: 'below',
      style: {
        bottom: `${FOOTER_SAFE + 12}px`,
        left: '16px',
        right: 'auto',
        top: 'auto',
        transform: 'none',
      },
    };
  }

  const place = resolvePlacement(rect, placement);
  const maxLeft = window.innerWidth - CALLOUT_W - 16;
  const maxTop = window.innerHeight - FOOTER_SAFE - CALLOUT_H;

  if (place === 'below') {
    const centerX = rect.left + rect.width / 2;
    return {
      place,
      style: {
        top: `${clamp(rect.top + rect.height + PAD + GAP, HEADER_SAFE, maxTop)}px`,
        left: `${clamp(centerX - CALLOUT_W / 2, 16, maxLeft)}px`,
        transform: 'none',
      },
    };
  }

  if (place === 'above') {
    const centerX = rect.left + rect.width / 2;
    return {
      place,
      style: {
        top: `${clamp(rect.top - PAD - GAP - CALLOUT_H, HEADER_SAFE, maxTop)}px`,
        left: `${clamp(centerX - CALLOUT_W / 2, 16, maxLeft)}px`,
        transform: 'none',
      },
    };
  }

  if (place === 'right') {
    const centerY = rect.top + rect.height / 2;
    return {
      place,
      style: {
        top: `${clamp(centerY - CALLOUT_H / 2, HEADER_SAFE, maxTop)}px`,
        left: `${clamp(rect.left + rect.width + PAD + GAP, 16, maxLeft)}px`,
        transform: 'none',
      },
    };
  }

  const centerY = rect.top + rect.height / 2;
  return {
    place,
    style: {
      top: `${clamp(centerY - CALLOUT_H / 2, HEADER_SAFE, maxTop)}px`,
      left: `${clamp(rect.left - PAD - GAP - CALLOUT_W, 16, maxLeft)}px`,
      transform: 'none',
    },
  };
}

function connectorPoints(
  rect: SpotlightRect,
  place: Place,
  calloutLeft: number,
  calloutTop: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const targetCx = rect.left + rect.width / 2;
  const targetCy = rect.top + rect.height / 2;

  switch (place) {
    case 'below':
      return {
        x1: calloutLeft + CALLOUT_W / 2,
        y1: calloutTop,
        x2: targetCx,
        y2: rect.top + rect.height + PAD,
      };
    case 'above':
      return {
        x1: calloutLeft + CALLOUT_W / 2,
        y1: calloutTop + CALLOUT_H,
        x2: targetCx,
        y2: rect.top - PAD,
      };
    case 'right':
      return {
        x1: calloutLeft,
        y1: calloutTop + CALLOUT_H / 2,
        x2: rect.left + rect.width + PAD,
        y2: targetCy,
      };
    case 'left':
      return {
        x1: calloutLeft + CALLOUT_W,
        y1: calloutTop + CALLOUT_H / 2,
        x2: rect.left - PAD,
        y2: targetCy,
      };
  }
}

function measureSelector(selector: string): SpotlightRect | null {
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement)) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 && r.height < 2) return null;
  const maxH = Math.max(56, window.innerHeight * 0.45);
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: Math.min(r.height, maxH),
  };
}

function scrollTargetIntoView(selector: string): void {
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement)) return;
  const root = resolveObserverRoot();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({
    block: 'center',
    inline: 'nearest',
    behavior: reduce ? 'auto' : 'smooth',
  });
  if (root && root !== document.documentElement) {
    const r = el.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    if (r.top < rootRect.top + 40 || r.bottom > rootRect.bottom - 40) {
      el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    }
  }
}

/**
 * Tour spotlight + adjacent narration callout.
 * Dims the page; target keeps natural UI (teal glow halo, no wash fill).
 * Scoped under `body[data-demo-active]` styles.
 */
export function DemoOverlay({
  step,
  tip,
  tipIndex,
  tipCount,
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

  useEffect(() => {
    scrollAllRootsToTop();
  }, [step?.id]);

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
    }, 160);
    return () => window.clearTimeout(id);
  }, [tip, displayTip]);

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

  const showSpotlight = Boolean(displayTip.target) && Boolean(rect);
  const { style: calloutStyle, place } = positionForRect(rect, displayTip.placement);
  const enterClass = exiting ? 'sr-demo-surface-exit' : 'sr-demo-surface-enter';
  const narration = displayTip.body;
  const progressLabel =
    tipTotal > 0
      ? `${tipOrdinal}/${tipTotal}`
      : tipCount > 1
        ? `${tipIndex + 1}/${tipCount}`
        : null;

  const calloutLeft =
    typeof calloutStyle.left === 'string' ? Number.parseFloat(calloutStyle.left) : 16;
  const calloutTop =
    typeof calloutStyle.top === 'string' ? Number.parseFloat(calloutStyle.top) : HEADER_SAFE;
  const connector =
    rect && Number.isFinite(calloutLeft) && Number.isFinite(calloutTop)
      ? connectorPoints(rect, place, calloutLeft, calloutTop)
      : null;

  if (sheetMinimized) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[45]" aria-live="polite">
        <button
          type="button"
          className="sr-tour-show-tip pointer-events-auto absolute bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-4 z-[47]"
          onClick={onExpandSheet}
        >
          Show tip
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[45]" aria-live="polite">
      {displayTip.blockInteraction && !showSpotlight ? (
        <div className="sr-tour-dim-full pointer-events-auto absolute inset-0" aria-hidden />
      ) : null}

      {displayTip.blockInteraction && showSpotlight && rect ? (
        <>
          <div
            className="sr-tour-dim-block pointer-events-auto absolute left-0 right-0 top-0"
            style={{ height: Math.max(0, rect.top - PAD) }}
            aria-hidden
          />
          <div
            className="sr-tour-dim-block pointer-events-auto absolute bottom-0 left-0 right-0"
            style={{
              height: Math.max(0, window.innerHeight - (rect.top + rect.height + PAD)),
            }}
            aria-hidden
          />
          <div
            className="sr-tour-dim-block pointer-events-auto absolute left-0"
            style={{
              top: rect.top - PAD,
              width: Math.max(0, rect.left - PAD),
              height: rect.height + PAD * 2,
            }}
            aria-hidden
          />
          <div
            className="sr-tour-dim-block pointer-events-auto absolute right-0"
            style={{
              top: rect.top - PAD,
              width: Math.max(0, window.innerWidth - (rect.left + rect.width + PAD)),
              height: rect.height + PAD * 2,
            }}
            aria-hidden
          />
        </>
      ) : null}

      {showSpotlight && rect ? (
        <div
          className="sr-tour-spotlight"
          style={{
            top: `${rect.top - PAD}px`,
            left: `${rect.left - PAD}px`,
            width: `${rect.width + PAD * 2}px`,
            height: `${rect.height + PAD * 2}px`,
          }}
          aria-hidden
        />
      ) : null}

      {connector && showSpotlight ? (
        <svg
          className="sr-tour-connector pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <line
            x1={connector.x1}
            y1={connector.y1}
            x2={connector.x2}
            y2={connector.y2}
            className="sr-tour-connector__line"
          />
        </svg>
      ) : null}

      <div className="pointer-events-auto absolute z-[46] w-[min(88vw,240px)]" style={calloutStyle}>
        <aside className={`sr-tour-callout ${enterClass}`} aria-labelledby={titleId} role="note">
          <div className="flex items-start justify-between gap-2">
            {progressLabel ? (
              <p className="sr-tour-callout__meta m-0">{progressLabel}</p>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="sr-tour-callout__hide"
              onClick={onMinimizeSheet}
              aria-label="Hide tip"
            >
              Hide
            </button>
          </div>
          <p id={titleId} className="sr-tour-callout__text m-0">
            {narration}
          </p>
        </aside>
      </div>
    </div>
  );
}
