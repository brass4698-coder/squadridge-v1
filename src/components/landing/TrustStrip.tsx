const DEFAULT_ITEMS = [
  'Private session room',
  'Facilitator-governed release',
  'Approved outcomes only',
  'Verifiable public record',
] as const;

/**
 * Designed micro-proof band — formal cells, not a loose statement list.
 */
export function TrustStrip({ items = DEFAULT_ITEMS }: { items?: readonly string[] }) {
  return (
    <ul
      className="m-0 grid list-none grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line p-0 sm:grid-cols-2"
      aria-label="Trust boundaries"
    >
      {items.map((item) => (
        <li
          key={item}
          className="bg-surface-elevated px-4 py-3.5 text-left font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
