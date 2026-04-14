import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/env';
import { getLastSquadIdFromStorage } from '../lib/squad';

export function LandingPage() {
  const lastSquad = getLastSquadIdFromStorage();
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-xl">
      <div className="space-y-md">
        <h1 className="font-heading text-fluid-h1 text-gray-light">SquadRidge</h1>
        <p className="text-fluid-body text-gray-light max-w-prose">
          Verified-anonymous cross-border dialogue for conflict prevention. Structured squads, zero-knowledge
          verification, and calm, de-escalation-first messaging.
        </p>
      </div>

      {!configured && (
        <section className="panel space-y-sm" aria-labelledby="env-heading">
          <h2 id="env-heading" className="font-heading text-fluid-h3 text-amber">
            Configure Supabase
          </h2>
          <p className="text-fluid-small text-gray-light">
            Add <code className="rounded bg-navy-dark px-sm py-xs">VITE_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-navy-dark px-sm py-xs">VITE_SUPABASE_ANON_KEY</code> to your{' '}
            <code className="rounded bg-navy-dark px-sm py-xs">.env</code> file, then restart the dev server. Enable
            anonymous sign-in in the Supabase dashboard and run the SQL migration in{' '}
            <code className="rounded bg-navy-dark px-sm py-xs">supabase/migrations/</code>.
          </p>
        </section>
      )}

      <div className="flex flex-wrap gap-md">
        <Link to="/onboarding" className="btn-primary">
          Start onboarding
        </Link>
        {lastSquad && configured ? (
          <Link to={`/session/${lastSquad}`} className="btn-primary border border-teal bg-transparent text-teal shadow-none hover:bg-teal hover:text-white">
            Resume last session
          </Link>
        ) : null}
        <Link
          to="/session"
          className="inline-flex items-center justify-center rounded-md border border-gray-light border-opacity-30 px-lg py-sm font-heading text-gray-light hover:border-teal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          Squad room
        </Link>
      </div>
    </div>
  );
}
