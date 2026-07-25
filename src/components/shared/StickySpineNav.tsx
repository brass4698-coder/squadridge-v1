import { useEffect, useState } from 'react';
import { resolveObserverRoot, resolveScrollRoot } from '../../demo/scrollRoot';
import { cn } from '../../lib/cn';

export type SpineNavStage = {
  id: string;
  label: string;
};

export type StickySpineNavProps = {
  stages: readonly SpineNavStage[];
  /** Accessible name for the progress nav. */
  'aria-label'?: string;
  className?: string;
};

/**
 * Sticky mini-progress for long multi-stage process pages.
 * Observes stage sections; respects reduced motion for scroll behavior.
 */
export function StickySpineNav({
  stages,
  'aria-label': ariaLabel = 'Process stages',
  className,
}: StickySpineNavProps) {
  const [activeId, setActiveId] = useState(stages[0]?.id ?? '');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (stages.length === 0) return;

    const observerRoot = resolveObserverRoot();
    const ids = stages.map((s) => s.id);

    const visibility = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!ids.includes(id)) continue;
          visibility.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId = activeId;
        let bestRatio = -1;
        for (const id of ids) {
          const ratio = visibility.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestRatio > 0) setActiveId(bestId);
        setVisible(bestRatio > 0 || [...visibility.values()].some((r) => r > 0));
      },
      {
        root: observerRoot,
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.15, 0.35, 0.55],
      },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }

    return () => io.disconnect();
    // activeId intentionally omitted — observer owns updates
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per stages identity
  }, [stages]);

  function scrollToStage(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = resolveScrollRoot();
    if (root instanceof Window) {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } else {
      const top =
        el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
      root.scrollTo({ top: Math.max(0, top - 88), behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  if (stages.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      aria-hidden={!visible}
      className={cn(
        'sticky top-14 z-30 border-b border-line bg-surface/92 backdrop-blur-md supports-[backdrop-filter]:bg-surface/85',
        'transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-1 opacity-0 max-h-0 overflow-hidden border-transparent',
        className,
      )}
    >
      <ol className="mx-auto flex max-w-[var(--sr-shell-max,72rem)] list-none items-stretch gap-0 overflow-x-auto px-4 py-0 sm:px-6 md:px-8">
        {stages.map((stage, index) => {
          const isActive = stage.id === activeId;
          return (
            <li key={stage.id} className="shrink-0">
              <button
                type="button"
                tabIndex={visible ? 0 : -1}
                onClick={() => scrollToStage(stage.id)}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-3 py-3 text-left transition-colors duration-150 motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--sr-primary)]',
                  isActive
                    ? 'border-brand text-ink'
                    : 'border-transparent text-ink-faint hover:text-ink-secondary',
                )}
              >
                <span className="font-mono text-[length:var(--text-label)] tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-xs font-medium tracking-tight sm:text-sm">{stage.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
