import { useId, useState } from 'react';

export interface FaqAccordionItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FaqAccordionItem[];
}

/**
 * Institutional FAQ — calm open/close, archive-grade hover and focus.
 * Uses buttons + aria-expanded so the expand control is keyboard-visible.
 */
export function FAQAccordion({ items }: FAQAccordionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-[var(--sr-radius-md)] border border-line">
      {items.map((item, index) => {
        const expanded = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div key={item.question} className="bg-surface-elevated">
            <h3 className="m-0 text-sm font-medium text-ink">
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors duration-[var(--sr-duration-governed)] ease-[var(--sr-ease-governed)] hover:bg-surface-sunken/40 focus-visible:bg-surface-sunken/50 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--sr-primary)] md:px-5"
                onClick={() => setOpenIndex(expanded ? null : index)}
              >
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className={`shrink-0 font-mono text-sm leading-none text-ink-faint transition-transform duration-200 ease-[var(--sr-ease-governed)] motion-reduce:transition-none ${
                    expanded ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!expanded}
              className={expanded ? 'border-t border-line' : undefined}
            >
              {expanded ? (
                <p className="m-0 px-4 pb-4 pt-3 text-sm leading-relaxed text-ink-secondary md:px-5">
                  {item.answer}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
