import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib';
import { useProfile } from '../hooks';

/**
 * Central hub for trust & safety: links to security disclosure, verification, and conduct.
 * In-product reporting surfaces also live in the session room.
 */
export function SafetyCenterPage() {
  const { session } = useAuth();
  const { profile, loading, error: profileError } = useProfile();
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <p className="font-sans text-[0.9rem] leading-relaxed text-slate-400">
        Trust-sensitive products need clear controls and enforcement paths, even in MVP. Use the
        room header to report a participant or the whole session when something is wrong.
      </p>

      <section
        className="rounded-xl border border-white/[0.08] bg-[#0c121c] p-5"
        aria-labelledby="safety-status"
      >
        <h2 id="safety-status" className="font-heading text-section-title text-slate-100">
          Your status
        </h2>
        {profileError ? (
          <p className="mt-3 font-sans text-[0.9rem] text-amber" role="alert">
            Could not load profile details. You can still review policies below or try again later.
          </p>
        ) : null}
        <dl className="mt-3 space-y-2 font-sans text-[0.9rem] text-slate-400">
          <div className="flex flex-wrap justify-between gap-2">
            <dt>Account</dt>
            <dd className="text-slate-200">
              {session?.user?.email ?? (configured ? 'Signed in' : 'Local / offline')}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt>Callsign</dt>
            <dd className="text-slate-200">
              {profileError
                ? '—'
                : loading
                  ? 'Loading…'
                  : profile?.callsign
                    ? profile.callsign
                    : 'Not set'}
            </dd>
          </div>
        </dl>
        <p className="mt-3 font-sans text-[0.8rem] text-slate-500">
          Facilitator verification confirms eligibility for a session. Released records do not name
          participants. Room content is access-controlled, not operator-blind encryption.
        </p>
        <Link
          to="/security"
          className="mt-4 inline-flex min-h-[44px] items-center text-teal-light underline-offset-4 hover:underline"
        >
          Security &amp; privacy boundaries
        </Link>
      </section>

      <section className="rounded-xl border border-white/[0.08] bg-[#0c121c] p-5">
        <h2 className="font-heading text-section-title text-slate-100">Policies &amp; tools</h2>
        <ul className="mt-3 list-none space-y-3 font-sans text-[0.9rem]">
          <li>
            <Link to="/security" className="text-teal-light underline-offset-4 hover:underline">
              Security &amp; privacy disclosure
            </Link>
            <span className="ml-2 text-slate-500">
              — data handling, retention, and who can see what.
            </span>
          </li>
          <li>
            <span className="text-slate-200">Report participant or room</span>
            <span className="ml-2 text-slate-500">
              — in an active session, use Report in the room toolbar (MVP: routes to triage; keep
              the session id if you contact support).
            </span>
          </li>
          <li>
            <span className="text-slate-200">Block or mute</span>
            <span className="ml-2 text-slate-500">
              — org-wide controls may apply in future; for now, leave the room and use Report if
              needed.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
