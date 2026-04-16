import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

export interface PrimaryCTAProps {
  label: string;
  onClick?: () => void;
  /** In-app path (`/verify`), hash link (`#waitlist`), `https://…`, or `mailto:`. */
  href?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'hero';
  className?: string;
  disabled?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  id?: string;
}

const sizeClass: Record<NonNullable<PrimaryCTAProps['size']>, string> = {
  sm: 'min-h-[40px] px-5 py-2 text-[0.875rem]',
  md: 'min-h-[44px] px-8 py-[0.65rem] text-[0.95rem]',
  lg: 'min-h-[48px] px-10 py-3 text-[1rem]',
};

export function PrimaryCTA({
  label,
  onClick,
  href,
  icon,
  size = 'md',
  variant = 'primary',
  className,
  disabled,
  type = 'button',
  id,
}: PrimaryCTAProps) {
  const isHttp = href && /^https?:\/\//i.test(href);
  const isMail = href?.startsWith('mailto:');
  const base = cn(
    'inline-flex max-w-max shrink-0 items-center justify-center gap-2 font-heading font-semibold transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'hero' ? 'btn-hero-join landing-hero-cta-link w-fit overflow-hidden' : 'btn-primary',
    variant === 'primary' && sizeClass[size],
    className,
  );

  const content = (
    <>
      {label}
      {icon ? <span className="inline-flex shrink-0">{icon}</span> : null}
    </>
  );

  if (href) {
    if (isHttp || isMail) {
      return (
        <a
          id={id}
          href={href}
          className={base}
          onClick={onClick}
          target={isHttp ? '_blank' : undefined}
          rel={isHttp ? 'noopener noreferrer' : undefined}
        >
          {content}
        </a>
      );
    }
    if (href.startsWith('#')) {
      return (
        <a
          id={id}
          href={href}
          className={base}
          onClick={onClick}
          style={variant === 'hero' ? { borderRadius: 8 } : undefined}
        >
          {content}
        </a>
      );
    }
    return (
      <Link id={id} to={href} className={base} onClick={onClick} style={{ borderRadius: 8 }}>
        {content}
      </Link>
    );
  }

  return (
    <button id={id} type={type} className={base} style={{ borderRadius: 8 }} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
