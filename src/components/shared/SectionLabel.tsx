import type { ReactNode } from 'react';

export function SectionLabel({ text }: { text: string }) {
  return (
    <p className="section-label mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand">
      {text}
    </p>
  );
}

export function MarketingSection({
  children,
  id,
  className = '',
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 px-6 py-[var(--space-section)] md:px-8 lg:px-12 ${className}`}
    >
      {children}
    </section>
  );
}
