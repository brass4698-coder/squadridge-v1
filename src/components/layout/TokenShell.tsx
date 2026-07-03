import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** Minimal chrome for participant token flows (no facilitator nav). */
export function TokenShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-line px-6 py-4">
        <Link to="/" className="text-sm font-semibold text-ink">
          SquadRidge
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
