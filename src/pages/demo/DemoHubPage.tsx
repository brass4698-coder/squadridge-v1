import { Link } from 'react-router-dom';
import { FormPanel } from '../../components/ui/FormPanel';
import { GovernedEntryLayout } from '../../components/shell/GovernedEntryLayout';
import { isDemoLoginEnabled } from '../../lib/demoLogin';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  DEMO_GOVERNED_CREDENTIALS,
  DEMO_PARTICIPANT_INVITE,
  DEMO_QUICK_LINKS,
  DEMO_SEEDED_SESSION_ID,
  DEMO_SUPABASE_LOGIN,
  DEMO_WALKTHROUGH_ROLES,
} from '../../data/demoCredentials';
import { DEMO_PRESETS } from '../../data/governanceDashboard';

/**
 * Demo credential reference + entry hub (dev / demo-login enabled only).
 */
export function DemoHubPage() {
  usePageTitle('Demo hub');

  if (!isDemoLoginEnabled()) {
    return (
      <GovernedEntryLayout title="Demo unavailable">
        <div className="mx-auto max-w-lg">
          <h1 className="font-heading text-display font-semibold tracking-tight text-ink">
            Demo hub unavailable
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            Demo login is disabled in this environment. Enable{' '}
            <code className="font-mono text-sm">VITE_ENABLE_DEMO_LOGIN=true</code> on staging, or
            run locally in development mode.
          </p>
          <Link
            to="/sign-in"
            className="btn-institutional btn-institutional--primary mt-8 inline-flex"
          >
            Sign in
          </Link>
        </div>
      </GovernedEntryLayout>
    );
  }

  return (
    <GovernedEntryLayout title="Demo & walkthrough">
      <div className="mx-auto max-w-3xl space-y-10">
        <header>
          <h1 className="font-heading text-display font-semibold tracking-tight text-ink">
            Demo hub
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
            Synthetic credentials and fixture data for diligence walkthroughs — not live pilots.
            Pick a role, choose a scenario, then explore dashboards, rooms, and the guided tour.
          </p>
        </header>

        <FormPanel eyebrow="Start here" title="Guided walkthrough">
          <p className="m-0 text-sm leading-relaxed text-ink-secondary">
            Role-first tour with tailored paths for facilitator, participant, moderator, program
            lead, ombuds, and executive views. Scenario presets change dashboard charts and matter
            fixtures.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/demo/start?demo=1" className="btn-institutional btn-institutional--primary">
              Choose role & start tour
            </Link>
            <Link to="/sign-in?demo=1" className="btn-institutional btn-institutional--ghost">
              Sign in as demo user
            </Link>
          </div>
        </FormPanel>

        <section aria-labelledby="login-heading">
          <h2 id="login-heading" className="font-heading text-h3 font-semibold text-ink">
            Supabase demo login
          </h2>
          <div className="sr-form-panel mt-4 overflow-x-auto">
            <table className="w-full min-w-[20rem] border-collapse text-sm">
              <tbody>
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 text-left font-medium text-ink-secondary">Email</th>
                  <td className="py-2 font-mono text-ink">{DEMO_SUPABASE_LOGIN.email}</td>
                </tr>
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 text-left font-medium text-ink-secondary">Password</th>
                  <td className="py-2 font-mono text-ink">{DEMO_SUPABASE_LOGIN.password}</td>
                </tr>
                <tr>
                  <th className="py-2 pr-4 align-top text-left font-medium text-ink-secondary">
                    Note
                  </th>
                  <td className="py-2 text-ink-secondary">{DEMO_SUPABASE_LOGIN.note}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            Seeded session UUID for facilitator spine:{' '}
            <code className="font-mono">{DEMO_SEEDED_SESSION_ID}</code> — run{' '}
            <code className="font-mono">node --env-file=.env.local scripts/seedDemo.mjs</code>
          </p>
        </section>

        <section aria-labelledby="roles-heading">
          <h2 id="roles-heading" className="font-heading text-h3 font-semibold text-ink">
            Role dashboards
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {DEMO_WALKTHROUGH_ROLES.map((role) => (
              <li key={role.id} className="sr-form-step-card">
                <p className="m-0 text-sm font-semibold text-ink">{role.label}</p>
                <p className="mt-1.5 m-0 text-sm text-ink-secondary">{role.description}</p>
                <Link
                  to={role.dashboardPath}
                  className="mt-3 inline-block text-sm font-medium text-brand underline-offset-2 hover:underline"
                >
                  Open dashboard →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="scenarios-heading">
          <h2 id="scenarios-heading" className="font-heading text-h3 font-semibold text-ink">
            Scenario presets
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {DEMO_PRESETS.map((p) => (
              <li
                key={p.id}
                className="rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated/80 px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">{p.label}</span>
                <span className="mt-0.5 block text-ink-secondary">{p.scope}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="credentials-heading">
          <h2 id="credentials-heading" className="font-heading text-h3 font-semibold text-ink">
            Governed demo credentials
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Paste at{' '}
            <Link to="/enter/credential" className="text-brand underline-offset-2 hover:underline">
              /enter/credential
            </Link>
            .
          </p>
          <ul className="mt-4 space-y-3">
            {DEMO_GOVERNED_CREDENTIALS.map((c) => (
              <li key={c.token} className="sr-form-panel !p-4">
                <p className="m-0 font-medium text-ink">{c.label}</p>
                <p className="mt-1 mb-0 font-mono text-xs text-brand">{c.token}</p>
                <p className="mt-2 mb-0 text-xs text-ink-secondary">{c.summary.matterLabel}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="participant-heading">
          <h2 id="participant-heading" className="font-heading text-h3 font-semibold text-ink">
            Participant room (no DB)
          </h2>
          <div className="sr-form-notice mt-4">
            <p className="m-0 text-sm">
              Bearer token <code className="font-mono">{DEMO_PARTICIPANT_INVITE.token}</code> —{' '}
              {DEMO_PARTICIPANT_INVITE.matter}. Works without seeding.
            </p>
            <ul className="mt-3 mb-0 space-y-1 text-sm">
              <li>
                <Link
                  to={DEMO_PARTICIPANT_INVITE.invitePath}
                  className="text-brand hover:underline"
                >
                  Invite acceptance
                </Link>
              </li>
              <li>
                <Link to={DEMO_PARTICIPANT_INVITE.roomPath} className="text-brand hover:underline">
                  Written room (chat demo)
                </Link>
              </li>
              <li>
                <Link
                  to={DEMO_PARTICIPANT_INVITE.reviewPath}
                  className="text-brand hover:underline"
                >
                  Outcome self-review
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section aria-labelledby="links-heading">
          <h2 id="links-heading" className="font-heading text-h3 font-semibold text-ink">
            Quick links
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {DEMO_QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="inline-block rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated px-3 py-1.5 text-sm text-ink-secondary hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </GovernedEntryLayout>
  );
}
