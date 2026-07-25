export interface FaqAccordionItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FaqAccordionItem[];
}

/**
 * Institutional FAQ — calm open/close, archive-grade hover and focus.
 */
export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[var(--sr-radius-md)] border border-line">
      {items.map((item) => (
        <details key={item.question} className="group bg-surface-elevated">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-medium text-ink transition-colors duration-[var(--sr-duration-governed)] ease-[var(--sr-ease-governed)] hover:bg-surface-sunken/40 focus-visible:bg-surface-sunken/50 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--sr-primary)] md:px-5 [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden
              className="shrink-0 font-mono text-sm leading-none text-ink-faint transition-transform duration-200 ease-[var(--sr-ease-governed)] group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-[var(--sr-ease-governed)] group-open:grid-rows-[1fr] motion-reduce:transition-none">
            <div className="overflow-hidden">
              <p className="m-0 border-t border-line px-4 pb-4 pt-3 text-sm leading-relaxed text-ink-secondary md:px-5">
                {item.answer}
              </p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
