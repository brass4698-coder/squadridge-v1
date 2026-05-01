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
          className="block sr-section-card transition-colors hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        >
          <h2 className="font-heading text-lg text-ink">Profile &amp; keys</h2>
          <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-ink-muted">
            Callsign, role, region hints, and keys used for the squad room.
          </p>
        </Link>
      </li>
      <li>
        <Link
          to="/settings/safety"
          className="block sr-section-card transition-colors hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        >
          <h2 className="font-heading text-lg text-ink">Safety center</h2>
          <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-ink-muted">
            Reporting, block/mute, conduct, privacy summary, and verification status.
          </p>
        </Link>
      </li>
      <li>
        <Link
          to="/settings/notifications"
          className="block sr-section-card transition-colors hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        >
          <h2 className="font-heading text-lg text-ink">Notifications</h2>
          <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-ink-muted">
            Choose which session and ledger updates surface in-app. Email is preferences-only today.
          </p>
        </Link>
      </li>
    </ul>
  );
}
