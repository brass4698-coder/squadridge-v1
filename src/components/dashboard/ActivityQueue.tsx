import { Link } from 'react-router-dom';

export type QueueItem = {
  id: string;
  title: string;
  meta: string;
  href?: string;
  urgency?: 'normal' | 'attention';
};

export function ActivityQueue({
  title,
  items,
  emptyLabel = 'Nothing requires action right now.',
}: {
  title: string;
  items: QueueItem[];
  emptyLabel?: string;
}) {
  return (
    <section
      className="rounded-lg border border-line bg-surface-elevated"
      aria-labelledby={`queue-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <h3
        id={`queue-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="m-0 border-b border-line px-4 py-3 font-display text-base font-medium text-ink"
      >
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="m-0 px-4 py-6 text-sm text-ink-faint">{emptyLabel}</p>
      ) : (
        <ul className="m-0 list-none divide-y divide-line p-0">
          {items.map((item) => {
            const inner = (
              <>
                <span className="block text-sm font-medium text-ink">{item.title}</span>
                <span className="mt-0.5 block text-xs text-ink-faint">{item.meta}</span>
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    to={item.href}
                    className="block px-4 py-3 no-underline transition-colors hover:bg-surface-sunken motion-safe:hover:-translate-y-px"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="px-4 py-3">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
