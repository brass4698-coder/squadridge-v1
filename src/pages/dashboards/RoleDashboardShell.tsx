import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type QuickLink = { label: string; href: string; description?: string };

interface RoleDashboardShellProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  quickLinks?: QuickLink[];
  children?: ReactNode;
}

/** Shared layout for role workspaces — distinct content still lives in each page. */
export function RoleDashboardShell({
  title,
  subtitle,
  eyebrow = 'Workspace',
  quickLinks = [],
  children,
}: RoleDashboardShellProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--color-accent)' }}
      >
        {eyebrow}
      </p>
      <h1
        className="mt-2 text-2xl font-semibold tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {subtitle}
      </p>

      {children}

      {quickLinks.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {quickLinks.map((link) => (
            <li key={link.href + link.label}>
              <Link
                to={link.href}
                className="block rounded-lg border px-4 py-3 transition-opacity hover:opacity-90"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {link.label}
                </span>
                {link.description ? (
                  <span
                    className="mt-1 block text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.description}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
