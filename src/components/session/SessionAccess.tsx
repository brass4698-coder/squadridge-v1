import { Link, useParams } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { SessionHubPage } from '../../pages/SessionHubPage';
import { SessionPage } from '../../pages/SessionPage';
import { isZkHashStubExplicit } from '../../lib/env';

/**
 * `/session` hub stays public; active squad rooms (`/session/:id`) require sign-in and a complete profile.
 * `/session/demo-session-001` is served by `DemoSessionPage` in `App.tsx` (declared before this route).
 */
export function SessionAccess() {
  const { squadId: squadIdParam } = useParams<{ squadId?: string }>();
  const squadId =
    squadIdParam !== undefined && squadIdParam !== null && String(squadIdParam).trim().length > 0
      ? String(squadIdParam).trim()
      : undefined;

  if (!squadId) {
    return <SessionHubPage />;
  }

  /** Hash stub (`VITE_ZK_STUB=true`) is not zero-knowledge — block joining live encrypted squad sessions for pilots. */
  if (isZkHashStubExplicit()) {
    return (
      <section className="mx-auto max-w-lg px-gutter py-16 font-sans">
        <h1 className="font-heading text-xl font-semibold text-gray-light">
          Pilot squad sessions unavailable
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-400">
          This build uses demo verification crypto (
          <code className="text-slate-300">VITE_ZK_STUB</code>). Joining live squads is disabled so
          verification cannot be mistaken for production Semaphore proofs.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-[0.9rem] text-slate-500">
          <li>
            Use the offline demo at{' '}
            <Link className="text-teal-light underline" to="/session/demo-session-001">
              /session/demo-session-001
            </Link>
            .
          </li>
          <li>
            For real pilots, deploy with <code className="text-slate-400">VITE_ZK_STUB=false</code>{' '}
            and Edge verification — see{' '}
            <Link className="text-teal-light underline" to="/security">
              Security disclosure
            </Link>
            .
          </li>
        </ul>
      </section>
    );
  }

  return (
    <RequireAuth requireCompleteProfile>
      <SessionPage squadId={squadId} />
    </RequireAuth>
  );
}
