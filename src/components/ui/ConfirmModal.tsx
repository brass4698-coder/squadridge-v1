import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  dangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  dangerous = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open (safer default)
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-body"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* Backdrop — frosted scrim (falls back to solid tint when reduced) */}
      <div className="sr-glass-scrim absolute inset-0" onClick={onCancel} aria-hidden="true" />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm rounded-xl border p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h2
          id="confirm-modal-title"
          className="mb-3 text-base font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h2>
        <p
          id="confirm-modal-body"
          className="mb-8 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {body}
        </p>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 rounded border py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'transparent',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{
              backgroundColor: dangerous ? 'var(--color-danger)' : 'var(--color-accent)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
