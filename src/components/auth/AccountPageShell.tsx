import type { ReactNode } from 'react';
import { cn } from '../../lib';

/**
 * Shared layout for passwordless account surfaces (sign-in, magic-link callback).
 * Matches cyber-noir shell: radial wash + optional vault panel.
 */
export function AccountPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[440px] px-md py-14', className)}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(38vh,24rem)] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(0,194,178,0.06)_0%,transparent_58%)]"
        aria-hidden
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export function AccountPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('vault-frost-subtle rounded-xl p-5 sm:p-6', className)}>{children}</div>
  );
}
