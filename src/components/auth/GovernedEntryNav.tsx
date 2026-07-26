import { Link } from 'react-router-dom';

export type GovernedEntryPath = 'sign-in' | 'credential' | 'request';

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

  return (
    <nav
      className="flex flex-col gap-2 border-t border-line pt-6 text-sm"
      aria-label="Other entry paths"
    >
      <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
        Entry paths
      </p>
      {current !== 'sign-in' ? (
        <Link to={signInHref} className="text-brand underline-offset-4 hover:underline">
          Sign in with magic link
        </Link>
      ) : null}
      {current !== 'credential' ? (
        <Link to="/enter/credential" className="text-brand underline-offset-4 hover:underline">
          Enter invitation credential
        </Link>
      ) : null}
      {current !== 'request' ? (
        <Link to="/request-access" className="text-brand underline-offset-4 hover:underline">
          Request pilot access
        </Link>
      ) : null}
    </nav>
  );
}
