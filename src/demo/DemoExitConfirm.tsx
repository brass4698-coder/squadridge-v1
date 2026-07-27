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
      <div className="sr-demo-surface-enter sr-tour-exit-dialog relative w-full max-w-sm p-5">
        <h2 id={titleId} className="sr-tour-exit-dialog__title m-0">
          Exit tour?
        </h2>
        <p id={bodyId} className="sr-tour-exit-dialog__body mt-2 mb-0">
          Progress stays in this tab. Restart from Demo hub, or open a page with{' '}
          <span className="font-mono">?demo=1</span>.
        </p>
        <div className="mt-5 flex gap-2">
          <button ref={cancelRef} type="button" className="sr-tour-btn flex-1" onClick={onCancel}>
            Stay
          </button>
          <button
            type="button"
            className="sr-tour-btn sr-tour-btn--quiet flex-1"
            onClick={onConfirm}
          >
            Exit tour
          </button>
        </div>
      </div>
    </div>
  );
}
