import { useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { GLOSSARY_TERMS, type GlossaryTermId } from '../../data/glossaryTerms';
import { cn } from '../../lib/cn';

export type GlossTermProps = {
  /** Lookup key in the shared glossary. */
  term: GlossaryTermId;
  /** Override visible term text (defaults to glossary term). */
  children?: ReactNode;
  className?: string;
  /** When false, skip the optional diligence link inside the tooltip. */
  linkDeepDive?: boolean;
};

/**
 * Inline glossary tip for facilitator personas — hover/focus, reduced-motion safe.
 * Does not invent stronger privacy claims than the gloss text allows.
 */
export function GlossTerm({ term, children, className, linkDeepDive = true }: GlossTermProps) {
  const tipId = useId();
  const entry = GLOSSARY_TERMS[term];
  const label = children ?? entry.term;

  return (
    <span className={cn('group relative inline', className)}>
      <button
        type="button"
        className="inline cursor-help border-0 border-b border-dotted border-ink-faint bg-transparent p-0 text-inherit underline-offset-4 hover:border-ink-secondary focus-visible:rounded-sm focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--sr-bg),0_0_0_4px_var(--sr-primary)]"
        aria-describedby={tipId}
        title={entry.gloss}
      >
        {label}
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[18rem] -translate-x-1/2',
          'rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated px-3 py-2 text-left text-xs font-normal leading-snug text-ink-secondary shadow-sr-sm',
          'opacity-0 transition-opacity duration-150 ease-out',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          'group-focus-within:pointer-events-auto',
          'motion-reduce:transition-none',
        )}
      >
        {entry.gloss}
        {linkDeepDive && entry.href ? (
          <>
            {' '}
            <Link
              to={entry.href}
              className="pointer-events-auto text-brand no-underline underline-offset-2 hover:underline"
              tabIndex={-1}
            >
              More on Security
            </Link>
          </>
        ) : null}
      </span>
    </span>
  );
}
