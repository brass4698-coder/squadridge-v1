export interface FaqAccordionItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FaqAccordionItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="divide-y divide-line border border-line">
      {items.map((item) => (
        <details key={item.question} className="group bg-surface-elevated">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-medium text-ink md:px-5 [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden
              className="shrink-0 font-mono text-sm leading-none text-ink-faint transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="border-t border-line px-4 pb-4 pt-3 text-sm leading-relaxed text-ink-secondary md:px-5">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
