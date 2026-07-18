export interface StageCardProps {
  number: string;
  title: string;
  description: string;
  variant: 'teaser' | 'full';
}

export function StageCard({ number, title, description, variant }: StageCardProps) {
  return (
    <li className="flex flex-col gap-3">
      <span
        className="relative z-10 inline-flex h-10 w-10 items-center justify-center border border-line bg-surface-sunken font-mono text-xs font-medium tabular-nums text-ink-secondary md:h-11 md:w-11"
        aria-hidden
      >
        {number}
      </span>
      <h3
        className={
          variant === 'teaser'
            ? 'font-display text-lg font-medium text-ink'
            : 'font-display text-h3 font-medium text-ink'
        }
      >
        {title}
      </h3>
      <p
        className={`leading-relaxed text-ink-secondary ${variant === 'teaser' ? 'text-sm' : 'text-base'}`}
      >
        {description}
      </p>
    </li>
  );
}
