type Item = { title: string; body: string };

export function EvidencePanel({
  eyebrow,
  heading,
  items,
  id,
}: {
  eyebrow: string;
  heading: string;
  items: readonly Item[];
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <p className="section-label mb-4">{eyebrow}</p>
      <h2 className="font-display max-w-2xl text-h2 font-medium leading-snug tracking-tight text-ink">
        {heading}
      </h2>
      <ul className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
        {items.map((item) => (
          <li key={item.title} className="bg-surface-elevated p-6 md:p-8">
            <h3 className="text-sm font-semibold tracking-tight text-ink">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
