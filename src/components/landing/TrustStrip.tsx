const DEFAULT_ITEMS = [
  'Facilitator-governed release',
  'Approved outcomes only',
  'No transcript · no auto-publish',
  'Manual pilot review',
] as const;

/**
 * Designed micro-proof band — formal cells, not a loose statement list.
 */
export function TrustStrip({ items = DEFAULT_ITEMS }: { items?: readonly string[] }) {
  return (
    <ul
      className="m-0 grid list-none grid-cols-1 gap-px overflow-hidden rounded-md border border-[color:var(--color-border-subtle)] bg-[color:var(--color-border-subtle)] p-0 sm:grid-cols-2"
      aria-label="Trust boundaries"
    >
      {items.map((item) => (
        <li
          key={item}
          className="bg-surface-elevated px-4 py-3 text-left font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
