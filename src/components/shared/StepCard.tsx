export interface StepCardProps {
  number: string;
  title: string;
  description: string;
  callout?: string;
}

export function StepCard({ number, title, description, callout }: StepCardProps) {
  return (
    <li className="border border-line bg-surface-elevated p-5">
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-line bg-surface-sunken font-mono text-xs font-medium text-ink-secondary">
          {number}
        </span>
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
      </div>
      <p className="text-sm leading-relaxed text-ink-secondary">{description}</p>
      {callout ? (
        <p className="mt-3 border-l border-line-strong py-1 pl-3 text-xs leading-relaxed text-ink-faint">
          {callout}
        </p>
      ) : null}
    </li>
  );
}
