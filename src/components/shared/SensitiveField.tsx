import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/cn';

export type SensitiveFieldProps = {
  /** Full sensitive value (never shown until reveal). */
  value: string;
  /** Characters kept visible at the end when masked. */
  visibleTail?: number;
  className?: string;
  /** Called when the user reveals the value (wire to audit logging). */
  onReveal?: () => void;
};

function maskValue(value: string, visibleTail: number): string {
  const trimmed = value.trim();
  if (!trimmed) return '••••';
  const tail = trimmed.slice(-Math.max(0, visibleTail));
  return `••••${tail}`;
}

/**
 * Masks sensitive identifiers in lists. Reveal is intentional and optional to audit.
 */
export function SensitiveField({
  value,
  visibleTail = 4,
  className,
  onReveal,
}: SensitiveFieldProps) {
  const [revealed, setRevealed] = useState(false);

  function toggle() {
    setRevealed((prev) => {
      const next = !prev;
      if (next) onReveal?.();
      return next;
    });
  }

  const display = revealed ? value : maskValue(value, visibleTail);

  return (
    <span
      className={cn(
        'inline-flex min-h-11 items-center gap-2 font-mono text-sm tracking-[0.01em]',
        className,
      )}
    >
      <span className="text-ink">{display}</span>
      <button
        type="button"
        onClick={toggle}
        className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-secondary motion-safe:transition-all motion-safe:duration-150"
        aria-pressed={revealed}
        aria-label={revealed ? 'Hide sensitive value' : 'Reveal sensitive value'}
      >
        {revealed ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </span>
  );
}

export { maskValue };
