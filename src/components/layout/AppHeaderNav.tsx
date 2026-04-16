import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SquadLogo from '../SquadLogo';
import { SquadRidgeWordmark } from '../SquadRidgeWordmark';
import { useIsModerator } from '../../hooks/useIsModerator';
import { useAppNavContext } from '../../hooks/useAppNavContext';
import { AccountMenu } from './AccountMenu';

const navMuted = 'font-normal text-[#6b7280]';
const navActive = 'font-normal text-[#e2e8f0]';

type Variant = 'full' | 'minimal';

function NavLink({
  to,
  children,
  active,
  onNavigate,
}: {
  to: string;
  children: React.ReactNode;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      className={active ? navActive : navMuted}
      onClick={onNavigate}
    >
      {children}
    </Link>
  );
}

function NavGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#4b5563]">{label}</span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">{children}</div>
    </div>
  );
}

function useNavActive() {
  const { pathname, hash } = useLocation();
  return {
    homeActive: pathname === '/' && hash !== '#waitlist',
    waitlistActive: pathname === '/' && hash === '#waitlist',
    onboardingActive: pathname.startsWith('/onboarding'),
    verifyActive: pathname.startsWith('/verify'),
    intentActive: pathname.startsWith('/intent'),
    matchActive: pathname.startsWith('/match'),
    sessionActive: pathname.startsWith('/session'),
    ledgerActive: pathname.startsWith('/ledger'),
    securityActive: pathname.startsWith('/security'),
    supabaseActive: pathname.startsWith('/dev/supabase'),
    modActive: pathname.startsWith('/mod'),
  };
}

function JourneyStrip() {
  const { showResumeCta, resumeHref, showOnboardingCta, onboardingHref, onboardingLabel } = useAppNavContext();
  if (!showResumeCta && !showOnboardingCta) return null;
  return (
    <div className="border-b border-[#141e30] bg-[rgba(8,11,18,0.92)] px-md py-2">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-x-6 gap-y-2 px-md">
        {showOnboardingCta ? (
          <Link
            to={onboardingHref}
            className="font-sans text-[0.8rem] font-medium text-teal-light underline-offset-4 hover:underline"
          >
            {onboardingLabel}
          </Link>
        ) : null}
        {showResumeCta && resumeHref ? (
          <Link
            to={resumeHref}
            className="font-sans text-[0.8rem] font-medium text-teal-light underline-offset-4 hover:underline"
          >
            Resume your room
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function ModNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const { data: isMod } = useIsModerator();
  const a = useNavActive();
  if (!isMod) return null;
  return (
    <NavLink to="/mod" active={a.modActive} onNavigate={onNavigate}>
      Mod
    </NavLink>
  );
}

function DesktopNav({ onNavigate }: { onNavigate?: () => void }) {
  const a = useNavActive();
  const isDev = import.meta.env.DEV;
  return (
    <div className="hidden lg:flex lg:flex-1 lg:flex-wrap lg:items-start lg:justify-end lg:gap-x-10 lg:gap-y-3">
      <NavGroup label="Discover">
        <NavLink to="/" active={a.homeActive} onNavigate={onNavigate}>
          Home
        </NavLink>
        <NavLink to="/#waitlist" active={a.waitlistActive} onNavigate={onNavigate}>
          Early access
        </NavLink>
      </NavGroup>
      <NavGroup label="Participate">
        <NavLink to="/onboarding" active={a.onboardingActive} onNavigate={onNavigate}>
          Onboarding
        </NavLink>
        <NavLink to="/verify" active={a.verifyActive} onNavigate={onNavigate}>
          Verify
        </NavLink>
        <NavLink to="/intent" active={a.intentActive || a.matchActive} onNavigate={onNavigate}>
          Find a squad
        </NavLink>
        <NavLink to="/session" active={a.sessionActive} onNavigate={onNavigate}>
          Session
        </NavLink>
      </NavGroup>
      <NavGroup label="Record">
        <NavLink to="/ledger" active={a.ledgerActive} onNavigate={onNavigate}>
          Ledger
        </NavLink>
      </NavGroup>
      <div className="flex flex-col gap-1.5">
        <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#4b5563]">Trust</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <NavLink to="/security" active={a.securityActive} onNavigate={onNavigate}>
            Security
          </NavLink>
        </div>
      </div>
      {isDev ? (
        <div className="flex flex-col gap-1.5">
          <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#4b5563]">Dev</span>
          <div className="text-sm">
            <NavLink to="/dev/supabase" active={a.supabaseActive} onNavigate={onNavigate}>
              Supabase
            </NavLink>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <span className="sr-only">Staff</span>
        <div className="flex min-h-[1.25rem] flex-wrap items-center gap-x-4 text-sm">
          <ModNavLink onNavigate={onNavigate} />
        </div>
      </div>
      <div className="flex items-start pt-[1.35rem]">
        <AccountMenu />
      </div>
    </div>
  );
}

function MobileNavDrawer({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpenRef = useRef(false);
  const titleId = useId();
  const a = useNavActive();
  const isDev = import.meta.env.DEV;
  const { pathname } = useLocation();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (wasOpenRef.current && !open) {
      returnFocusRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstLinkRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const root = panelRef.current;
    if (!root) return;
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute('disabled'),
      );
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] lg:hidden" role="presentation">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] motion-safe:transition-opacity"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id="mobile-nav-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-[#1a2236] bg-[#0b0f18] shadow-[-8px_0_32px_rgba(0,0,0,0.4)] motion-safe:transition-transform motion-safe:duration-200"
      >
        <div className="flex items-center justify-between border-b border-[#1a2236] px-4 py-3">
          <h2 id={titleId} className="font-heading text-sm font-semibold text-[#e2e8f0]">
            Menu
          </h2>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg font-sans text-[0.85rem] text-[#a8b2c1] hover:bg-[#141c2e]"
            onClick={onClose}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4 font-sans text-[0.9rem]" aria-label="Mobile">
          <div className="space-y-6">
            <div>
              <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                Discover
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    ref={firstLinkRef}
                    to="/"
                    className={a.homeActive ? navActive : navMuted}
                    onClick={onClose}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/#waitlist" className={a.waitlistActive ? navActive : navMuted} onClick={onClose}>
                    Early access
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                Participate
              </p>
              <ul className="space-y-2">
                <li>
                  <Link to="/onboarding" className={a.onboardingActive ? navActive : navMuted} onClick={onClose}>
                    Onboarding
                  </Link>
                </li>
                <li>
                  <Link to="/verify" className={a.verifyActive ? navActive : navMuted} onClick={onClose}>
                    Verify
                  </Link>
                </li>
                <li>
                  <Link
                    to="/intent"
                    className={a.intentActive || a.matchActive ? navActive : navMuted}
                    onClick={onClose}
                  >
                    Find a squad
                  </Link>
                </li>
                <li>
                  <Link to="/session" className={a.sessionActive ? navActive : navMuted} onClick={onClose}>
                    Session
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                Record
              </p>
              <ul className="space-y-2">
                <li>
                  <Link to="/ledger" className={a.ledgerActive ? navActive : navMuted} onClick={onClose}>
                    Ledger
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                Trust
              </p>
              <ul className="space-y-2">
                <li>
                  <Link to="/security" className={a.securityActive ? navActive : navMuted} onClick={onClose}>
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            {isDev ? (
              <div>
                <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                  Dev
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link to="/dev/supabase" className={a.supabaseActive ? navActive : navMuted} onClick={onClose}>
                      Supabase
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
            <ModNavLinkMobile onClose={onClose} />
          </div>
        </nav>
        <div className="border-t border-[#1a2236] p-4">
          <AccountMenu />
        </div>
      </div>
    </div>
  );
}

function ModNavLinkMobile({ onClose }: { onClose: () => void }) {
  const { data: isMod } = useIsModerator();
  const a = useNavActive();
  if (!isMod) return null;
  return (
    <div>
      <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">Staff</p>
      <ul className="space-y-2">
        <li>
          <Link to="/mod" className={a.modActive ? navActive : navMuted} onClick={onClose}>
            Mod
          </Link>
        </li>
      </ul>
    </div>
  );
}

function MobileMenuBar({
  open,
  onOpen,
  menuButtonRef,
}: {
  open: boolean;
  onOpen: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="flex flex-1 items-center justify-end gap-2 lg:hidden">
      <AccountMenu />
      <button
        ref={menuButtonRef}
        type="button"
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#2d3f55] bg-[#0f1623]/80 font-sans text-[0.85rem] text-[#e2e8f0] hover:border-[#3d4f63]"
        aria-expanded={open}
        aria-controls="mobile-nav-dialog"
        aria-haspopup="dialog"
        aria-label="Open navigation menu"
        onClick={onOpen}
      >
        <span className="sr-only">Open menu</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function AppHeaderNav({ variant }: { variant: Variant }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  if (variant === 'minimal') {
    return (
      <header className="sticky top-0 z-50 border-b border-solid border-[#141e30] bg-[rgba(11,15,26,0.92)] px-md py-3 backdrop-blur-[12px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-md">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="SquadRidge home"
          >
            <span className="flex shrink-0 items-center" aria-hidden>
              <SquadLogo size={36} className="block" />
            </span>
            <SquadRidgeWordmark
              alt=""
              className="h-8 w-auto max-w-[min(200px,50vw)] translate-y-0.5 sm:h-9"
              aria-hidden
            />
          </Link>
          <Link
            to="/"
            className="font-sans text-[0.85rem] font-medium text-[#8892a4] underline-offset-4 hover:text-[#c4cdd9] hover:underline"
          >
            Exit to home
          </Link>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-solid border-[#141e30] bg-[rgba(11,15,26,0.85)] px-md py-4 backdrop-blur-[12px]">
        <nav
          className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-4 gap-y-3 px-md sm:gap-sm lg:items-center"
          aria-label="Main"
        >
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 sm:gap-3"
            aria-label="SquadRidge home"
          >
            <span className="flex shrink-0 items-center" aria-hidden>
              <SquadLogo size={42} className="block" />
            </span>
            <SquadRidgeWordmark
              alt=""
              className="h-9 w-auto max-w-[min(240px,58vw)] translate-y-0.5 sm:h-10 md:h-11"
              aria-hidden
            />
          </Link>
          <DesktopNav onNavigate={closeMobile} />
          <MobileMenuBar
            open={mobileOpen}
            onOpen={() => setMobileOpen(true)}
            menuButtonRef={mobileMenuButtonRef}
          />
        </nav>
      </header>
      <JourneyStrip />
      <MobileNavDrawer open={mobileOpen} onClose={closeMobile} returnFocusRef={mobileMenuButtonRef} />
    </>
  );
}
