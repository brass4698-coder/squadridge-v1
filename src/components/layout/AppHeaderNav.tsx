import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SquadLogo from '../SquadLogo';
import { SquadRidgeWordmark } from '../SquadRidgeWordmark';
import { useAppNavContext, useIsModerator } from '../../hooks';
import { DEMO_PROPOSAL_ID, isSupabaseConfigured } from '../../lib';
import { AccountMenu } from './AccountMenu';
import { PrimaryCTA } from '../ui/PrimaryCTA';

const navLinkBase =
  'inline-flex min-h-[44px] items-center rounded-full px-3.5 py-2 text-[0.8125rem] font-medium leading-none transition-[color,background-color,border-color,box-shadow] duration-150';
const navMuted = `${navLinkBase} border border-transparent text-[#8b95a8] hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-[#e2e8f0]`;
const navActive = `${navLinkBase} border border-white/[0.08] bg-white/[0.05] text-[#f1f5f9] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]`;

function mobileDrawerLinkClass(active: boolean) {
  return `block w-full rounded-lg py-2.5 text-[0.9rem] font-medium transition-colors duration-150 ${
    active ? 'text-[#f1f5f9]' : 'text-[#8b95a8] hover:bg-white/[0.05] hover:text-[#e2e8f0]'
  }`;
}

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
    <Link to={to} className={active ? navActive : navMuted} onClick={onNavigate}>
      {children}
    </Link>
  );
}

function useDemoNavState() {
  const { pathname, hash } = useLocation();
  const sessionMatch = pathname.match(/^\/session\/([^/]+)\/?/);
  const sessionSquadId = sessionMatch?.[1];
  const inSessionRoom = Boolean(sessionSquadId);

  return {
    homeActive: pathname === '/' && hash !== '#waitlist' && hash !== '#how-it-works',
    matchFlowActive: pathname.startsWith('/match') || pathname.startsWith('/intent'),
    intentActive: pathname.startsWith('/intent'),
    sessionLinkActive: pathname.startsWith('/session'),
    inSessionRoom,
    sessionHref: sessionSquadId ? `/session/${sessionSquadId}` : '/session',
    waitlistActive: pathname === '/' && hash === '#waitlist',
    howItWorksActive: pathname === '/' && hash === '#how-it-works',
    pilotAccessActive: pathname === '/' && hash === '#waitlist',
    sampleOutputActive: pathname.startsWith('/ledger'),
    verifyActive: pathname.startsWith('/verify'),
    ledgerActive: pathname.startsWith('/ledger'),
    securityActive: pathname.startsWith('/security'),
    supabaseActive: pathname.startsWith('/admin/health'),
    modActive: pathname.startsWith('/mod'),
  };
}

function JourneyStrip() {
  const { pathname } = useLocation();
  const { showResumeCta, resumeHref, showOnboardingCta, onboardingHref, onboardingLabel } =
    useAppNavContext();
  /** Landing, public ledger, security disclosure: no session-recovery strip. */
  if (pathname === '/' || pathname.startsWith('/ledger') || pathname.startsWith('/security'))
    return null;
  if (!showResumeCta && !showOnboardingCta) return null;
  return (
    <div className="border-b border-[#141e30] bg-[rgba(8,11,18,0.92)] py-2.5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-x-6 gap-y-2 px-4 sm:px-6 lg:px-8">
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

/** Center bar: orientation + conversion (marketing). */
function DemoDesktopNav({ onNavigate }: { onNavigate?: () => void }) {
  const nav = useDemoNavState();
  return (
    <nav
      className="hidden flex-1 items-center justify-center gap-1 sm:gap-2 lg:flex"
      aria-label="Primary"
    >
      <NavLink to="/#how-it-works" active={nav.howItWorksActive} onNavigate={onNavigate}>
        How it works
      </NavLink>
      <NavLink to="/security" active={nav.securityActive} onNavigate={onNavigate}>
        Security
      </NavLink>
      <NavLink
        to={`/ledger/${DEMO_PROPOSAL_ID}`}
        active={nav.sampleOutputActive}
        onNavigate={onNavigate}
      >
        Sample output
      </NavLink>
      <NavLink to="/#waitlist" active={nav.pilotAccessActive} onNavigate={onNavigate}>
        Pilot access
      </NavLink>
    </nav>
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
  const nav = useDemoNavState();
  const isDev = import.meta.env.DEV;
  const { pathname } = useLocation();
  const { data: isMod } = useIsModerator();
  const showDevInDrawer = isDev && pathname !== '/' && !pathname.startsWith('/security');
  const showAccountInDrawerFooter =
    isSupabaseConfigured() && !pathname.startsWith('/ledger') && !pathname.startsWith('/security');

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
        <nav
          className="flex-1 overflow-y-auto px-5 py-5 font-sans text-[0.9rem]"
          aria-label="Mobile"
        >
          <div className="space-y-6">
            <div>
              <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                Site
              </p>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    ref={firstLinkRef}
                    to="/#how-it-works"
                    className={mobileDrawerLinkClass(nav.howItWorksActive)}
                    onClick={onClose}
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/security"
                    className={mobileDrawerLinkClass(nav.securityActive)}
                    onClick={onClose}
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/ledger/${DEMO_PROPOSAL_ID}`}
                    className={mobileDrawerLinkClass(nav.sampleOutputActive)}
                    onClick={onClose}
                  >
                    Sample output
                  </Link>
                </li>
                <li>
                  <a
                    href="/#waitlist"
                    className={mobileDrawerLinkClass(nav.pilotAccessActive)}
                    onClick={onClose}
                  >
                    Pilot access
                  </a>
                </li>
              </ul>
            </div>
            {showDevInDrawer ? (
              <div>
                <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                  Dev
                </p>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      to="/verify"
                      className={mobileDrawerLinkClass(nav.verifyActive)}
                      onClick={onClose}
                    >
                      Verify
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/intent"
                      className={mobileDrawerLinkClass(nav.intentActive)}
                      onClick={onClose}
                    >
                      Intent
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/health"
                      className={mobileDrawerLinkClass(nav.supabaseActive)}
                      onClick={onClose}
                    >
                      Supabase health (mods)
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
            {isMod ? (
              <div>
                <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                  Staff
                </p>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      to="/mod"
                      className={mobileDrawerLinkClass(nav.modActive)}
                      onClick={onClose}
                    >
                      Mod
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </nav>
        <div className="border-t border-[#1a2236] p-4">
          {showAccountInDrawerFooter ? <AccountMenu /> : null}
        </div>
      </div>
    </div>
  );
}

function MobileMenuBar({
  open,
  onOpen,
  menuButtonRef,
  showAccountMenu,
}: {
  open: boolean;
  onOpen: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  showAccountMenu: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-3 lg:hidden">
      {showAccountMenu ? <AccountMenu /> : null}
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
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function AppHeaderNav({ variant }: { variant: Variant }) {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const showAccount = isSupabaseConfigured();
  /** Public ledger and security explainer read as documentation; session chrome undermines that framing. */
  const showAccountMenuChrome =
    showAccount && !pathname.startsWith('/ledger') && !pathname.startsWith('/security');

  if (variant === 'minimal') {
    return (
      <header className="sticky top-0 z-50 border-b border-solid border-[#141e30] bg-[rgba(11,15,26,0.92)] backdrop-blur-[12px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="SquadRidge home"
          >
            <span className="flex shrink-0 items-center" aria-hidden>
              <SquadLogo size={28} className="block" />
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
      <header className="sticky top-0 z-50 border-b border-solid border-[#141e30] bg-[rgba(11,15,26,0.92)] backdrop-blur-[12px]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:gap-6 sm:px-6 lg:gap-8 lg:px-8 lg:py-4">
          <Link
            to="/"
            className="inline-flex min-w-0 shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
            aria-label="SquadRidge home"
          >
            <span className="flex shrink-0 items-center" aria-hidden>
              <SquadLogo size={32} className="block" />
            </span>
            <SquadRidgeWordmark
              alt=""
              className="h-8 w-auto max-w-[min(200px,46vw)] translate-y-0.5 sm:h-9 md:h-10"
              aria-hidden
            />
          </Link>

          <DemoDesktopNav onNavigate={closeMobile} />

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 lg:flex">
              <PrimaryCTA
                label="Request pilot access"
                href="/#waitlist"
                size="sm"
                shape="squircle"
                className="px-5"
              />
            </div>
            {showAccountMenuChrome ? (
              <div className="hidden lg:block">
                <AccountMenu />
              </div>
            ) : null}
            <MobileMenuBar
              open={mobileOpen}
              onOpen={() => setMobileOpen(true)}
              menuButtonRef={mobileMenuButtonRef}
              showAccountMenu={showAccountMenuChrome}
            />
          </div>
        </div>
      </header>
      <JourneyStrip />
      <MobileNavDrawer
        open={mobileOpen}
        onClose={closeMobile}
        returnFocusRef={mobileMenuButtonRef}
      />
    </>
  );
}
