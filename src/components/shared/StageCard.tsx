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
        className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/30 bg-surface font-mono text-xs font-semibold tabular-nums text-brand md:h-12 md:w-12"
        aria-hidden
      >
        {number}
      </span>
      <h3 className={variant === 'teaser' ? 'text-lg font-semibold text-ink' : 'text-h3 text-ink'}>
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
