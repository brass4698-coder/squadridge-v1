import { Link } from 'react-router-dom';
import { SquadRidgeLockup } from '../SquadRidgeWordmark';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import type { ReactNode } from 'react';

const TRUST = ['Invite-linked', 'Role-scoped', 'No open signup', 'Access is deliberate'] as const;

/**
 * Quieter chrome for sign-in and credential entry — institutional theme assumed via PublicShell.
 */
export function GovernedEntryLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-[70vh] border-b border-line bg-surface py-12 md:py-16">
      <div className={publicShellInnerClass}>
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="text-ink no-underline" aria-label="SquadRidge home">
            <SquadRidgeLockup size="sm" />
          </Link>
          <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
            {title ?? 'Governed entry'}
          </p>
        </div>
        {children}
        <ul
          className="mt-12 m-0 flex list-none flex-wrap gap-2 border-t border-line pt-6 p-0"
          aria-label="Access trust signals"
        >
          {TRUST.map((t) => (
            <li
              key={t}
              className="rounded-sm border border-line px-2.5 py-1 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint"
            >
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-xl text-xs leading-relaxed text-ink-faint">
          Access is deliberate and invite-linked. Documented privacy limits live on{' '}
          <Link to="/security#reviewers" className="text-brand underline-offset-2 hover:underline">
            Security
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
