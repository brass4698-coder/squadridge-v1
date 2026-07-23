import { Link } from 'react-router-dom';

const PATHS = [
  { label: 'For facilitators', href: '/how-it-works', detail: 'See the process' },
  { label: 'For institutions', href: '/use-cases', detail: 'Explore use cases' },
  { label: 'For security reviewers', href: '/security#reviewers', detail: 'Inspect the boundary' },
] as const;

/**
 * Diligence self-sort under hero CTAs.
 */
export function AudiencePathStrip() {
  return (
    <nav className="mt-10" aria-label="Audience paths">
      <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
        Start where your diligence begins.
      </p>
      <ul className="mt-4 m-0 flex list-none flex-col gap-3 p-0 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
        {PATHS.map((p) => (
          <li key={p.href}>
            <Link to={p.href} className="sr-interactive group inline-flex flex-col no-underline">
              <span className="text-sm font-semibold text-ink group-hover:text-brand">
                {p.label}
              </span>
              <span className="mt-0.5 text-xs text-ink-faint group-hover:text-ink-secondary">
                {p.detail} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
