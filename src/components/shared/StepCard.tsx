export interface StepCardProps {
  number: string;
  title: string;
  description: string;
  callout?: string;
}

export function StepCard({ number, title, description, callout }: StepCardProps) {
  return (
    <li className="rounded-lg border border-line bg-surface-elevated p-5">
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand/30 bg-surface font-mono text-xs font-semibold text-brand">
          {number}
        </span>
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
      </div>
      <p className="text-sm leading-relaxed text-ink-secondary">{description}</p>
      {callout ? (
        <p className="mt-3 border-l-2 border-brand py-1 pl-3 text-xs italic leading-relaxed text-ink-secondary">
          {callout}
        </p>
      ) : null}
    </li>
  );
}
