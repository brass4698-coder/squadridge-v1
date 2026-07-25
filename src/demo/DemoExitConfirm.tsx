import { useEffect, useId, useRef } from 'react';

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Blocking exit confirmation for the guided tour only.
 * Explanatory tour content must not use this pattern.
 */
export function DemoExitConfirm({ open, onConfirm, onCancel }: Props) {
  const titleId = useId();
  const bodyId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = document.getElementById('sr-demo-exit-dialog');
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      id="sr-demo-exit-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface/60"
        aria-label="Dismiss exit confirmation"
        onClick={onCancel}
      />
      <div className="sr-demo-surface-enter relative w-full max-w-sm rounded-[var(--sr-radius-lg)] border border-line bg-surface-elevated p-6 shadow-lg">
        <h2 id={titleId} className="m-0 font-sans text-base font-semibold text-ink">
          Exit guided tour?
        </h2>
        <p id={bodyId} className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
          Progress is saved in this browser tab. You can restart from Sign in → Try the Demo, or
          open any page with <span className="font-mono text-xs">?demo=1</span>.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            className="min-h-[2.5rem] flex-1 rounded-lg border border-line bg-transparent px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--sr-focus)]"
            onClick={onCancel}
          >
            Stay
          </button>
          <button
            type="button"
            className="min-h-[2.5rem] flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-on transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--sr-focus)]"
            onClick={onConfirm}
          >
            Exit tour
          </button>
        </div>
      </div>
    </div>
  );
}
