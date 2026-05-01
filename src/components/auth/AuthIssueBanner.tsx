import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Shown when Supabase client failed to initialize or the session could not be loaded.
 */
export function AuthIssueBanner() {
  const { supabaseClientInitError, sessionError, session } = useAuth();

  if (!supabaseClientInitError && !sessionError) return null;

  const title = supabaseClientInitError
    ? 'Connection setup failed'
    : 'Session could not be restored';

  const body = supabaseClientInitError
    ? 'The app could not start the database client. Check your configuration or reload the page.'
    : session
      ? 'Your saved session may be out of date. Try reloading; if this keeps happening, sign in again.'
      : 'We could not load your sign-in state. Check your network, then reload or sign in again.';

  return (
    <div
      className="border-b border-amber/35 bg-[#1a1408] px-gutter py-3 font-sans text-[0.875rem] text-[#f5d7a3]"
      role="alert"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-[#f5d7a3]">{title}</p>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-[#c4a574]">{body}</p>
          {import.meta.env.DEV && (supabaseClientInitError ?? sessionError) ? (
            <p className="mt-2 font-mono text-[0.7rem] text-amber/90">
              {(supabaseClientInitError ?? sessionError)?.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[8px] border-0 bg-teal px-4 py-2 font-heading text-[0.85rem] font-semibold text-[#0b0f1a] hover:opacity-90"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
          <Link
            to="/sign-in"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[8px] border border-[#2d3f55] px-4 py-2 font-heading text-[0.85rem] font-medium text-[#a8b2c1] hover:border-[#3d4f63]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
