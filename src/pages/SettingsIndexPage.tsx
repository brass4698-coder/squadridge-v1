import { Link } from 'react-router-dom';

/**
 * Settings hub: entry cards for profile, safety, and future notification prefs.
 */
export function SettingsIndexPage() {
  return (
    <ul className="grid gap-4 sm:grid-cols-1">
      <li>
        <Link
          to="/settings/profile"
          className="block rounded-xl border border-white/[0.08] bg-[#0c121c] p-5 transition-colors hover:border-teal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1a]"
        >
          <h2 className="font-heading text-lg text-slate-100">Profile &amp; keys</h2>
          <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-slate-500">
            Callsign, role, region hints, and keys used for the squad room.
          </p>
        </Link>
      </li>
      <li>
        <Link
          to="/settings/safety"
          className="block rounded-xl border border-white/[0.08] bg-[#0c121c] p-5 transition-colors hover:border-teal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1a]"
        >
          <h2 className="font-heading text-lg text-slate-100">Safety center</h2>
          <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-slate-500">
            Reporting, block/mute, conduct, privacy summary, and verification status.
          </p>
        </Link>
      </li>
      <li>
        <Link
          to="/settings/notifications"
          className="block rounded-xl border border-white/[0.08] bg-[#0c121c] p-5 transition-colors hover:border-teal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1a]"
        >
          <h2 className="font-heading text-lg text-slate-100">Notifications</h2>
          <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-slate-500">
            Choose which session and ledger updates surface in-app. Email is preferences-only today.
          </p>
        </Link>
      </li>
    </ul>
  );
}
