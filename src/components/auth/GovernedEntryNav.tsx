import { Link } from 'react-router-dom';
import { isDemoLoginEnabled } from '../../lib/demoLogin';

export type GovernedEntryPath = 'sign-in' | 'credential' | 'request';

const PATHS: {
  id: GovernedEntryPath;
  href: string;
  label: string;
  description: string;
}[] = [
  {
    id: 'sign-in',
    href: '/sign-in',
    label: 'Magic-link sign-in',
    description: 'Invite-linked work email',
  },
  {
    id: 'credential',
    href: '/enter/credential',
    label: 'Invitation credential',
    description: 'Paste a room token',
  },
  {
    id: 'request',
    href: '/request-access',
    label: 'Request pilot access',
    description: 'Manual intake review',
  },
];

/**
 * Shared cross-links between magic-link sign-in and invitation credential entry
 * so bouncing between the two keeps a clear path without losing context.
 */
export function GovernedEntryNav({
  current,
  nextPath,
}: {
  current: GovernedEntryPath;
  /** Optional post-auth destination for sign-in deep links. */
  nextPath?: string | null;
}) {
  const signInHref = nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : '/sign-in';
  const showDemo = isDemoLoginEnabled();

  return (
    <nav className="border-t border-line pt-6" aria-label="Other entry paths">
      <p className="m-0 mb-3 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
        Entry paths
      </p>
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {PATHS.filter((p) => p.id !== current).map((path) => (
          <li key={path.id}>
            <Link
              to={path.id === 'sign-in' ? signInHref : path.href}
              className="sr-form-tile min-h-[2.75rem] no-underline"
            >
              <span className="font-medium tracking-tight text-ink">{path.label}</span>
              <span className="mt-1 text-xs leading-snug text-ink-faint">{path.description}</span>
            </Link>
          </li>
        ))}
        {showDemo ? (
          <li className="sm:col-span-2">
            <Link to="/demo" className="sr-form-tile min-h-[2.75rem] no-underline">
              <span className="font-medium tracking-tight text-ink">Demo hub</span>
              <span className="mt-1 text-xs leading-snug text-ink-faint">
                Local / staging roles & credentials
              </span>
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
