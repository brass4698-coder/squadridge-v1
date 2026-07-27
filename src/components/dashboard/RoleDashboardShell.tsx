// ============================================================
// RoleDashboardShell — shared visual primitive for per-role landing pages
//
// Used by:
//   /app/admin        → SuperAdminDashboardPage
//   /app/institution  → InstitutionAdminDashboardPage
//   /app/facilitator  → alias of /app (FacilitatorDashboardPage)
//   /app/mediator     → MediatorDashboardPage
//   /app/analyst      → AnalystDashboardPage
//   /app/participant  → ParticipantDashboardPage
//   /app/observer     → ObserverDashboardPage
//
// Keeps every role's landing surface visually consistent (same header
// treatment, same card grid, same "about your role" footer) so that any
// design polish only needs to land in one place. Composed of three subparts
// exported alongside for pages that want finer control.
// ============================================================
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { RoleKey } from '../../types/roles';
import { ROLE_LABELS } from '../../types/roles';
import { useAuth } from '../../contexts/AuthContext';

export interface DashboardQuickLink {
  label: string;
  href: string;
  description: string;
  /** Optional icon (12–16px inline SVG). */
  icon?: ReactNode;
  /** Renders the card in a muted / disabled style with a note. */
  status?: 'available' | 'coming-soon' | 'restricted';
}

export interface RoleDashboardShellProps {
  role: RoleKey;
  headline: string;
  intro: string;
  quickLinks: DashboardQuickLink[];
  aboutYourRole: string;
  /** Optional slot below the quick-link grid, above the About footer. */
  children?: ReactNode;
}

export function RoleDashboardShell({
  role,
  headline,
  intro,
  quickLinks,
  aboutYourRole,
  children,
}: RoleDashboardShellProps) {
  const { profile } = useAuth();
  const greetingName = profile?.display_name ?? profile?.email ?? null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <DashboardHeader role={role} headline={headline} intro={intro} greetingName={greetingName} />

      <DashboardQuickLinks links={quickLinks} />

      {children}

      <DashboardAboutRole role={role} body={aboutYourRole} />
    </div>
  );
}

// ------------------------------------------------------------
// Sub-parts (exported so pages can compose custom layouts)
// ------------------------------------------------------------

export function DashboardHeader({
  role,
  headline,
  intro,
  greetingName,
}: {
  role: RoleKey;
  headline: string;
  intro: string;
  greetingName: string | null;
}) {
  return (
    <header>
      <p
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--color-accent)' }}
      >
        {ROLE_LABELS[role]}
      </p>
      <h1
        className="mt-2 text-2xl font-semibold tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {headline}
        {greetingName ? (
          <span
            className="ml-2 text-lg font-normal"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            · {greetingName}
          </span>
        ) : null}
      </h1>
      <p
        className="mt-3 max-w-[70ch] text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {intro}
      </p>
    </header>
  );
}

export function DashboardQuickLinks({ links }: { links: DashboardQuickLink[] }) {
  if (links.length === 0) return null;
  return (
    <section aria-label="Quick actions">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <QuickLinkCard link={link} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuickLinkCard({ link }: { link: DashboardQuickLink }) {
  const isDisabled = link.status === 'coming-soon' || link.status === 'restricted';
  const commonClass =
    'block h-full rounded-lg border p-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
  const style: React.CSSProperties = {
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    opacity: isDisabled ? 0.6 : 1,
  };

  const body = (
    <>
      <div className="flex items-start gap-3">
        {link.icon ? (
          <span className="mt-0.5 shrink-0" aria-hidden>
            {link.icon}
          </span>
        ) : null}
        <div>
          <p className="text-sm font-semibold">{link.label}</p>
          <p
            className="mt-1 text-xs leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {link.description}
          </p>
          {link.status === 'coming-soon' ? (
            <p
              className="mt-2 text-[0.7rem] font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Coming soon
            </p>
          ) : null}
          {link.status === 'restricted' ? (
            <p
              className="mt-2 text-[0.7rem] font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Requires additional role
            </p>
          ) : null}
        </div>
      </div>
    </>
  );

  if (isDisabled) {
    return (
      <div
        className={commonClass}
        style={{ ...style, cursor: 'not-allowed' }}
        aria-disabled="true"
        role="group"
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      to={link.href}
      className={commonClass + ' hover:border-[var(--color-accent)]'}
      style={style}
    >
      {body}
    </Link>
  );
}

export function DashboardAboutRole({ role, body }: { role: RoleKey; body: string }) {
  return (
    <section
      aria-labelledby={`about-role-${role}`}
      className="rounded-lg border p-5"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <h2
        id={`about-role-${role}`}
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        About your role · {ROLE_LABELS[role]}
      </h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {body}
      </p>
    </section>
  );
}
