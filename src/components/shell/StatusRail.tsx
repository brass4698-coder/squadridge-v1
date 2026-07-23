import { cn } from '../../lib/cn';

const DEFAULT_ITEMS = [
  'Invite-only',
  'Verified participants',
  'Role-scoped visibility',
  'Public release optional',
  'Operator-readable today',
] as const;

/**
 * Persistent trust / process signals under the page intro.
 */
export function StatusRail({
  items = DEFAULT_ITEMS,
  className,
}: {
  items?: readonly string[];
  className?: string;
}) {
  return (
    <ul
      className={cn('m-0 mb-8 flex list-none flex-wrap gap-2 p-0', className)}
      aria-label="Status rail"
    >
      {items.map((item) => (
        <li
          key={item}
          className="rounded-sm border border-line bg-surface-sunken px-2.5 py-1 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
