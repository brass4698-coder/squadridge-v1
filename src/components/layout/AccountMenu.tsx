import { useEffect, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks';
import { isSupabaseConfigured } from '../../lib';

export type AccountMenuProps = {
  /** When set (e.g. demo walkthrough), shown as the menu button label instead of callsign/email. */
  menuTriggerLabel?: string;
  /**
   * Public shell: signed-out keeps muted “Sign in”; signed-in uses icon-only trigger (no standalone “Account” label).
   */
  triggerVariant?: 'default' | 'public-shell';
};

export function AccountMenu({ menuTriggerLabel, triggerVariant = 'default' }: AccountMenuProps) {
  const { pathname } = useLocation();
  const { session, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  /** Marketing and public document routes: neutral account chrome (no callsign / demo personas in the bar). */
  const neutralAccountChrome =
    pathname === '/' || pathname.startsWith('/ledger') || pathname.startsWith('/security');
  const publicShell = triggerVariant === 'public-shell';
  /** Landing only: don’t compete with the hero primary CTA. */
  const demoteOnLandingHome = pathname === '/';

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (authLoading) {
    return (
      <span className="inline-flex min-h-[36px] min-w-[5rem] items-center justify-end font-sans text-[0.8rem] text-ink-faint">
        …
      </span>
    );
  }

  if (!session) {
    return (
      <Link
        to="/sign-in"
        className={
          demoteOnLandingHome
            ? 'inline-flex min-h-[36px] items-center justify-center rounded-md px-2 py-1 font-sans text-[0.78rem] font-medium text-ink-faint transition-colors hover:text-ink-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/40'
            : publicShell
              ? 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[6px] px-2 font-sans text-[0.8125rem] font-medium text-slate-500 transition-colors hover:bg-surface-hover hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/50'
              : 'inline-flex min-h-[36px] items-center justify-center rounded-[8px] border border-line-strong bg-transparent px-3 py-1.5 font-sans text-[0.85rem] font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink'
        }
      >
        Sign in
      </Link>
    );
  }

  const label =
    neutralAccountChrome && !publicShell
      ? 'Account'
      : menuTriggerLabel?.trim() ||
        profile?.callsign?.trim() ||
        session.user?.email?.split('@')[0] ||
        'Operator';

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        className={
          publicShell && neutralAccountChrome
            ? 'inline-flex size-11 shrink-0 items-center justify-center rounded-[6px] border border-line text-slate-400 transition-colors hover:border-line-strong hover:bg-surface-hover hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/50'
            : demoteOnLandingHome
              ? 'inline-flex max-w-[12rem] items-center gap-1.5 rounded-md border border-line bg-transparent px-2.5 py-1 font-sans text-[0.78rem] font-medium text-ink-faint transition-colors hover:border-line-strong hover:text-ink-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/40'
              : 'inline-flex max-w-[14rem] items-center gap-2 rounded-[8px] border border-line-strong bg-surface-elevated/80 px-3 py-1.5 font-sans text-[0.85rem] font-medium text-ink transition-colors hover:border-line-strong'
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={publicShell && neutralAccountChrome ? 'Account menu' : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {publicShell && neutralAccountChrome ? (
          <UserRound className="size-[18px] shrink-0" aria-hidden />
        ) : (
          <>
            <span className="truncate">{label}</span>
            <span className="text-ink-faint" aria-hidden>
              ▾
            </span>
          </>
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-[100] min-w-[12rem] rounded-[8px] border border-line bg-surface-elevated py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <Link
            role="menuitem"
            to="/app/settings/profile"
            className="block px-4 py-2.5 font-sans text-[0.85rem] text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
            onClick={() => setOpen(false)}
          >
            Profile &amp; keys
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-2.5 text-left font-sans text-[0.85rem] text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
            onClick={() => {
              setOpen(false);
              void signOut().then(() => {
                navigate('/sign-in?reason=signed-out', { replace: true });
              });
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
