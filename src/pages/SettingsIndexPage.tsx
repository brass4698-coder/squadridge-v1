import { Link } from 'react-router-dom';
import { appRoutes } from '../lib/appRoutes';

/**
 * Settings hub: entry cards for profile, safety, and notification prefs.
 */
export function SettingsIndexPage() {
  const base = appRoutes.settings;
  return (
    <ul className="m-0 grid list-none gap-4 p-0">
      <li>
        <Link
          to={`${base}/profile`}
          className="sr-vault-card sr-vault-card--interactive block p-5 no-underline"
        >
          <h2 className="font-display text-lg font-medium text-ink">Profile &amp; keys</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Display name, role context, and keys used in governed rooms.
          </p>
        </Link>
      </li>
      <li>
        <Link
          to={`${base}/safety`}
          className="sr-vault-card sr-vault-card--interactive block p-5 no-underline"
        >
          <h2 className="font-display text-lg font-medium text-ink">Safety center</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Reporting, block/mute, conduct, privacy summary, and verification status.
          </p>
        </Link>
      </li>
      <li>
        <Link
          to={`${base}/notifications`}
          className="sr-vault-card sr-vault-card--interactive block p-5 no-underline"
        >
          <h2 className="font-display text-lg font-medium text-ink">Notifications</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Choose which session and ledger updates surface in-app.
          </p>
        </Link>
      </li>
    </ul>
  );
}
