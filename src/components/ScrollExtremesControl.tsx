import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveScrollRoot } from '../demo/scrollRoot';

function readScrollTop(root: HTMLElement | Window): number {
  return root instanceof Window ? root.scrollY : root.scrollTop;
}

function readMaxScroll(root: HTMLElement | Window): number {
  if (root instanceof Window) {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }
  return Math.max(0, root.scrollHeight - root.clientHeight);
}

function rootMetrics(root: HTMLElement | Window): { top: number; height: number } {
  if (root instanceof Window) {
    return { top: 0, height: window.innerHeight };
  }
  const rect = root.getBoundingClientRect();
  return { top: rect.top, height: root.clientHeight };
}

function elementOffsetInRoot(el: HTMLElement, root: HTMLElement | Window): number {
  if (root instanceof Window) {
    return el.getBoundingClientRect().top + window.scrollY;
  }
  const rootRect = root.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return elRect.top - rootRect.top + root.scrollTop;
}

function scrollToPos(root: HTMLElement | Window, top: number) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';
  root.scrollTo({ top: Math.max(0, top), behavior });
}

/** Major page landmarks for section-to-section navigation. */
function collectScrollTargets(root: HTMLElement | Window): HTMLElement[] {
  const scope: ParentNode = root instanceof Window ? document : root;

  const marked = Array.from(scope.querySelectorAll<HTMLElement>('[data-scroll-section]'));
  let candidates = marked;

  if (candidates.length < 2) {
    const main = document.querySelector('main');
    const found: HTMLElement[] = [];
    if (main) {
      const walk = (node: Element) => {
        for (const child of Array.from(node.children)) {
          if (!(child instanceof HTMLElement)) continue;
          const tag = child.tagName;
          if (tag === 'SECTION' || tag === 'HEADER' || tag === 'FOOTER') {
            found.push(child);
          } else if (child.children.length > 0 && (tag === 'DIV' || tag === 'ARTICLE')) {
            walk(child);
          }
        }
      };
      walk(main);
    }
    const footer = document.querySelector('footer:not(.sr-tour-footer)');
    if (footer instanceof HTMLElement && !found.includes(footer)) {
      found.push(footer);
    }
    candidates = found;
  }

  return candidates.filter((el) => {
    const h = el.getBoundingClientRect().height;
    return h >= 72;
  });
}

function demoChromeOffset(): number {
  const dock = document.querySelector('.sr-tour-footer');
  if (!(dock instanceof HTMLElement)) return 0;
  const style = window.getComputedStyle(dock);
  if (style.display === 'none' || style.visibility === 'hidden') return 0;
  return Math.ceil(dock.getBoundingClientRect().height) + 12;
}

/**
 * Centered circular scroll control — section-aware up/down with hover/tap reveal.
 * Works with window scroll and `[data-scroll-root]` shells.
 */
export function ScrollExtremesControl() {
  const { pathname } = useLocation();
  const groupId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(24);
  const [finePointer, setFinePointer] = useState(true);

  const sync = useCallback(() => {
    const root = resolveScrollRoot();
    const y = readScrollTop(root);
    const max = readMaxScroll(root);
    setAtTop(y < 48);
    setAtBottom(max > 0 && y >= max - 48);
    setVisible(max > 320);
    setBottomOffset(24 + demoChromeOffset());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    setOpen(false);
    sync();
    const root = resolveScrollRoot();
    const target: Window | HTMLElement = root;
    target.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    const t = window.setTimeout(sync, 120);
    return () => {
      target.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.clearTimeout(t);
    };
  }, [pathname, sync]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current) return;
      if (e.target instanceof Node && rootRef.current.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const goPrev = useCallback(() => {
    const root = resolveScrollRoot();
    const y = readScrollTop(root);
    const { height } = rootMetrics(root);
    const targets = collectScrollTargets(root);
    const threshold = y + 24;
    let prev: HTMLElement | null = null;
    for (const el of targets) {
      const top = elementOffsetInRoot(el, root);
      if (top < threshold - height * 0.15) prev = el;
    }
    if (prev) {
      scrollToPos(root, Math.max(0, elementOffsetInRoot(prev, root) - 12));
    } else {
      scrollToPos(root, 0);
    }
    setOpen(false);
  }, []);

  const goNext = useCallback(() => {
    const root = resolveScrollRoot();
    const y = readScrollTop(root);
    const { height } = rootMetrics(root);
    const targets = collectScrollTargets(root);
    const threshold = y + height * 0.35;
    const next = targets.find((el) => elementOffsetInRoot(el, root) > threshold);
    if (next) {
      scrollToPos(root, Math.max(0, elementOffsetInRoot(next, root) - 12));
    } else {
      scrollToPos(root, readMaxScroll(root));
    }
    setOpen(false);
  }, []);

  if (!visible) return null;

  const expanded = finePointer ? undefined : open;

  return (
    <div
      ref={rootRef}
      className="sr-scroll-orb pointer-events-none fixed left-1/2 z-[60] -translate-x-1/2"
      style={{ bottom: `max(${bottomOffset}px, env(safe-area-inset-bottom, 0px))` }}
      role="navigation"
      aria-label="Page section scroll"
      data-expanded={expanded ? 'true' : undefined}
      onMouseEnter={() => {
        if (finePointer) setOpen(true);
      }}
      onMouseLeave={() => {
        if (finePointer) setOpen(false);
      }}
    >
      <div className={`sr-scroll-orb__cluster ${open ? 'is-open' : ''}`}>
        <button
          type="button"
          className="sr-scroll-orb__action sr-scroll-orb__action--up pointer-events-auto"
          aria-label="Previous section"
          disabled={atTop}
          tabIndex={open ? 0 : -1}
          onClick={goPrev}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M18 15l-6-6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          id={groupId}
          className="sr-scroll-orb__core pointer-events-auto"
          aria-label={open ? 'Close scroll controls' : 'Open scroll controls'}
          aria-expanded={open}
          aria-controls={`${groupId}-actions`}
          onFocus={() => setOpen(true)}
          onClick={() => {
            if (!finePointer) setOpen((v) => !v);
          }}
        >
          <span className="sr-scroll-orb__dot" aria-hidden />
        </button>

        <button
          type="button"
          className="sr-scroll-orb__action sr-scroll-orb__action--down pointer-events-auto"
          aria-label="Next section"
          disabled={atBottom}
          tabIndex={open ? 0 : -1}
          onClick={goNext}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div id={`${groupId}-actions`} className="sr-only">
        Use up and down controls to move between major page sections.
      </div>
    </div>
  );
}
