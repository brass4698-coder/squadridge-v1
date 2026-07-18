export interface FaqAccordionItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FaqAccordionItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="flex flex-col gap-px border border-line bg-line">
      {items.map((item) => (
        <details key={item.question} className="group bg-surface-elevated px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden
              className="shrink-0 font-mono text-sm leading-none text-ink-faint transition-transform duration-200 group-open:rotate-45"
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
