// ============================================================
// UserAvatarMenu (Phase 5)
//
// Compact top-right avatar + role dropdown, used by both AppTopShell and
// AuthenticatedShell. Falls back to a "Sign in" button when there is no
// session. Shows a "Demo" pill next to the avatar for the demo user.
// ============================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessRoute } from '../../lib/guards';
import { isDemoUser } from '../../lib/demoLogin';

function initialsFor(email: string | undefined | null): string {
  if (!email) return 'SR';
  const local = email.split('@')[0] ?? email;
  const parts = local.split(/[.\-_ ]/).filter(Boolean);
  if (parts.length === 0) return 'SR';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

export function UserAvatarMenu() {
  const { session, profile, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSignOut = useCallback(async () => {
    setOpen(false);
    await signOut();
    navigate('/sign-in?reason=signed-out', { replace: true });
  }, [navigate, signOut]);

  if (!session) {
    return (
      <Link
        to="/sign-in"
        className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{
          borderColor: 'var(--sr-line)',
          color: 'var(--sr-ink)',
        }}
      >
        Sign in
      </Link>
    );
  }

  const email = session.user?.email ?? profile?.email ?? '';
  const initials = initialsFor(email);
  const demo = isDemoUser(session);
  const showInvestorNav = canAccessRoute(roles, ['super_admin']);

  return (
    <div ref={rootRef} className="relative flex items-center gap-2">
      {demo ? (
        <span
          className="rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider"
          style={{
            background: 'color-mix(in oklch, var(--sr-primary) 22%, transparent)',
            color: 'var(--sr-primary)',
            border: '1px solid color-mix(in oklch, var(--sr-primary) 40%, transparent)',
          }}
          aria-label="Demo account"
        >
          Demo
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${email || 'signed-in user'}`}
        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-transform hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, var(--sr-primary), var(--sr-primary-pressed))',
          color: 'var(--sr-on-primary)',
        }}
      >
        {initials}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border p-2 shadow-lg"
          style={{
            borderColor: 'var(--sr-line)',
            background: 'var(--sr-bg-elevated)',
            boxShadow: 'var(--sr-shadow-lg)',
          }}
        >
          {email ? (
            <div
              className="mb-1 truncate rounded-md px-3 py-2 text-xs"
              style={{ color: 'var(--sr-ink-secondary)' }}
              title={email}
            >
              Signed in as
              <div className="truncate text-sm font-medium" style={{ color: 'var(--sr-ink)' }}>
                {email}
              </div>
            </div>
          ) : null}
          <MenuItem to="/app" label="Dashboard" onClick={() => setOpen(false)} />
          {showInvestorNav ? (
            <MenuItem to="/decks" label="Decks (admin)" onClick={() => setOpen(false)} />
          ) : null}
          <MenuItem to="/app/settings" label="Settings" onClick={() => setOpen(false)} />
          <div
            className="my-1 border-t"
            role="separator"
            style={{ borderColor: 'var(--sr-divider)' }}
          />
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleSignOut()}
            className="block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[color-mix(in_oklch,var(--sr-ink)_6%,transparent)]"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-[color-mix(in_oklch,var(--sr-ink)_6%,transparent)]"
      style={{ color: 'var(--sr-ink)' }}
    >
      {label}
    </Link>
  );
}
