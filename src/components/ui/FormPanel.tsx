import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type FormPanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  titleId?: string;
  /** Use when this panel owns the page heading (e.g. invite accept). Default h2. */
  titleAs?: 'h1' | 'h2';
  description?: ReactNode;
  eyebrow?: string;
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Elevated institutional panel for entry and intake forms.
 * Atmosphere comes from parent `.sr-form-atmosphere` / GovernedEntryLayout.
 */
export function FormPanel({
  title,
  titleId,
  titleAs = 'h2',
  description,
  eyebrow,
  footer,
  children,
  className,
  ...props
}: FormPanelProps) {
  const TitleTag = titleAs;
  return (
    <div className={cn('sr-form-panel', className)} {...props}>
      {eyebrow || title || description ? (
        <header className="mb-8">
          {eyebrow ? (
            <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.14em] text-brand/80">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <TitleTag
              id={titleId}
              className={cn(
                'm-0 font-heading text-xl font-semibold tracking-tight text-ink',
                titleAs === 'h1' && 'text-page-title',
                eyebrow && 'mt-3',
              )}
            >
              {title}
            </TitleTag>
          ) : null}
          {description ? (
            <div className="mt-3 text-sm leading-relaxed text-ink-secondary">{description}</div>
          ) : null}
        </header>
      ) : null}
      <div className="min-w-0">{children}</div>
      {footer ? (
        <footer className="mt-7 border-t border-line pt-5 text-xs leading-relaxed text-ink-faint">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
