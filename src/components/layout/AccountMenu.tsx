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
      <span className="inline-flex min-h-[36px] min-w-[5rem] items-center justify-end font-sans text-[0.8rem] text-[#4b5563]">
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
            ? 'inline-flex min-h-[36px] items-center justify-center rounded-md px-2 py-1 font-sans text-[0.78rem] font-medium text-[#5f6b7c] transition-colors hover:text-[#94a3b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/40'
            : publicShell
              ? 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[6px] px-2 font-sans text-[0.8125rem] font-medium text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/50'
              : 'inline-flex min-h-[36px] items-center justify-center rounded-[8px] border border-[#2d3f55] bg-transparent px-3 py-1.5 font-sans text-[0.85rem] font-medium text-[#a8b2c1] transition-colors hover:border-[#3d4f63] hover:text-[#e2e8f0]'
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
            ? 'inline-flex size-11 shrink-0 items-center justify-center rounded-[6px] border border-white/[0.08] text-slate-400 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/50'
            : demoteOnLandingHome
              ? 'inline-flex max-w-[12rem] items-center gap-1.5 rounded-md border border-white/[0.07] bg-transparent px-2.5 py-1 font-sans text-[0.78rem] font-medium text-[#64748b] transition-colors hover:border-white/[0.12] hover:text-[#94a3b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/40'
              : 'inline-flex max-w-[14rem] items-center gap-2 rounded-[8px] border border-[#2d3f55] bg-[#0f1623]/80 px-3 py-1.5 font-sans text-[0.85rem] font-medium text-[#e2e8f0] transition-colors hover:border-[#3d4f63]'
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
            <span className="text-[#6b7280]" aria-hidden>
              ▾
            </span>
          </>
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-[100] min-w-[12rem] rounded-[8px] border border-[#1a2236] bg-[#0c101c] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <Link
            role="menuitem"
            to="/settings/profile"
            className="block px-4 py-2.5 font-sans text-[0.85rem] text-[#c4cdd9] transition-colors hover:bg-[#141c2e] hover:text-[#f1f5f9]"
            onClick={() => setOpen(false)}
          >
            Profile &amp; keys
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-2.5 text-left font-sans text-[0.85rem] text-[#c4cdd9] transition-colors hover:bg-[#141c2e] hover:text-[#f1f5f9]"
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
