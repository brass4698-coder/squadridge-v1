import { Link } from 'react-router-dom';
import { SquadRidgeLockup } from '../SquadRidgeWordmark';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import type { ReactNode } from 'react';

const TRUST = ['Invite-linked', 'Role-scoped', 'No open signup', 'Access is deliberate'] as const;

/**
 * Quieter chrome for sign-in and credential entry — institutional theme assumed via PublicShell.
 * Vault-instrument atmosphere for governed forms.
 */
export function GovernedEntryLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="sr-form-atmosphere min-h-[70vh] border-b border-line py-12 md:py-16">
      <div className={publicShellInnerClass}>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <Link to="/" className="text-ink no-underline" aria-label="SquadRidge home">
            <SquadRidgeLockup size="md" showTagline alt="SquadRidge" />
          </Link>
          <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.14em] text-ink-faint">
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
              className="rounded-[var(--sr-radius-sm)] border border-line bg-surface-elevated/80 px-2.5 py-1 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint backdrop-blur-sm"
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
