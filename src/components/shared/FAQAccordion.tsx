export interface FaqAccordionItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FaqAccordionItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-lg border border-line bg-surface-elevated px-5 py-4 shadow-sr-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden
              className="shrink-0 text-lg leading-none text-brand transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
