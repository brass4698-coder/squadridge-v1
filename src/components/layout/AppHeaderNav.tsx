import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppNavContext, useIsModerator } from '../../hooks';
import { NavigationProgress } from './NavigationProgress';
import { publicShellInnerClass, shellListResetClass } from './publicShell';
import { twMerge } from 'tailwind-merge';

const HEADER_SHELL =
  'sticky top-0 z-[100] border-b border-white/[0.08] bg-[rgba(11,15,26,0.92)] backdrop-blur-[8px] supports-[backdrop-filter]:bg-[rgba(11,15,26,0.88)]';

/** Single primary row: 64px mobile, 72px desktop — context bar is always separate below. */
const HEADER_MAIN_ROW = twMerge(
  publicShellInnerClass,
  'flex h-16 shrink-0 items-center justify-between gap-3 lg:grid lg:h-[72px] lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_auto] lg:items-center lg:justify-normal lg:gap-6',
);

/** Institutional desktop nav — text-only states, no pill chrome */
const deskNavLink = (active: boolean) =>
  twMerge(
    'inline-flex items-center border-b border-transparent pb-px text-[15px] font-medium leading-none tracking-normal transition-colors duration-150',
    'min-h-[44px] min-w-0 shrink px-0.5 pt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal/50',
    active
      ? 'border-slate-200/90 text-slate-100'
      : 'text-slate-500 hover:border-slate-500/50 hover:text-slate-300',
  );

const mobileLink = (active: boolean) =>
  twMerge(
    'flex min-h-[44px] w-full items-center rounded-[6px] px-1 text-left text-[15px] font-medium leading-snug transition-colors',
    active
      ? 'text-slate-100 underline decoration-slate-500 underline-offset-4'
      : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300',
  );

type Variant = 'full' | 'minimal';

function usePublicNavActive() {
  const { pathname, hash } = useLocation();
  return {
    howItWorks: pathname === '/' && hash === '#how-it-works',
    security: pathname.startsWith('/security'),
    ledger: pathname === '/ledger' || pathname === '/ledger/' || pathname.startsWith('/ledger/'),
    pilotAccess: (pathname === '/' && hash === '#waitlist') || pathname.startsWith('/invite'),
  };
}

function HeaderContextContent(): ReactNode | null {
  const { pathname } = useLocation();
  if (pathname === '/security') {
    return (
      <span className="text-[13px] font-medium leading-snug text-slate-500">
        Security disclosure
      </span>
    );
  }
  if (pathname === '/ledger' || pathname === '/ledger/') {
    return <span className="text-[13px] font-medium leading-snug text-slate-500">Ledger</span>;
  }
  const record = pathname.match(/^\/ledger\/([^/]+)\/?$/);
  if (record) {
    const slug = record[1];
    return (
      <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1 text-[13px] font-medium leading-snug text-slate-500">
        <Link
          to="/ledger"
          className="shrink-0 text-slate-400 underline-offset-4 transition-colors hover:text-slate-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/50"
        >
          Ledger
        </Link>
        <span className="text-slate-600" aria-hidden>
          /
        </span>
        <span className="shrink-0">Public outcome record</span>
        <span className="text-slate-600" aria-hidden>
          /
        </span>
        <span
          className="min-w-0 truncate font-mono text-[12px] font-normal text-slate-400"
          title={slug}
        >
          {slug}
        </span>
      </span>
    );
  }
  return null;
}

function JourneyStrip() {
  const { pathname } = useLocation();
  const { showResumeCta, resumeHref, showOnboardingCta, onboardingHref, onboardingLabel } =
    useAppNavContext();
  if (pathname === '/' || pathname.startsWith('/ledger') || pathname.startsWith('/security'))
    return null;
  if (!showResumeCta && !showOnboardingCta) return null;
  return (
    <div className="border-b border-[#141e30] bg-[rgba(8,11,18,0.92)] py-2.5">
      <div
        className={twMerge(
          publicShellInnerClass,
          'flex flex-wrap items-center justify-end gap-x-6 gap-y-2',
        )}
      >
        {showOnboardingCta ? (
          <Link
            to={onboardingHref}
            className="inline-flex min-h-[44px] items-center font-sans text-[0.8rem] font-medium text-teal-light underline-offset-4 hover:underline"
          >
            {onboardingLabel}
          </Link>
        ) : null}
        {showResumeCta && resumeHref ? (
          <Link
            to={resumeHref}
            className="inline-flex min-h-[44px] items-center font-sans text-[0.8rem] font-medium text-teal-light underline-offset-4 hover:underline"
          >
            Resume your room
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function DesktopPrimaryNav({
  active,
  onNavigate,
}: {
  active: ReturnType<typeof usePublicNavActive>;
  onNavigate?: () => void;
}) {
  const items = [
    { key: 'how', to: '/#how-it-works', label: 'How it works', isActive: active.howItWorks },
    { key: 'sec', to: '/security', label: 'Security', isActive: active.security },
    { key: 'led', to: '/ledger', label: 'Ledger', isActive: active.ledger },
    { key: 'pilot', to: '/#waitlist', label: 'Pilot access', isActive: active.pilotAccess },
  ] as const;

  return (
    <nav className="hidden min-w-0 w-full lg:flex lg:justify-center" aria-label="Primary">
      <ul
        className={twMerge(
          shellListResetClass,
          'flex min-w-0 flex-wrap items-center justify-center gap-x-6',
        )}
      >
        {items.map(({ key, to, label, isActive }) => (
          <li key={key} className="list-none">
            {to.startsWith('/#') ? (
              <a
                href={to}
                className={deskNavLink(isActive)}
                aria-current={isActive ? 'page' : undefined}
                onClick={onNavigate}
              >
                {label}
              </a>
            ) : (
              <Link
                to={to}
                className={deskNavLink(isActive)}
                aria-current={isActive ? 'page' : undefined}
                onClick={onNavigate}
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MobileNavPanel({
  open,
  active,
  onClose,
  returnFocusRef,
  ctaMuted,
}: {
  open: boolean;
  active: ReturnType<typeof usePublicNavActive>;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  ctaMuted: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const titleId = useId();
  const wasOpenRef = useRef(false);
  const { pathname } = useLocation();
  const { data: isMod } = useIsModerator();
  const isDev = import.meta.env.DEV;
  const showDev =
    isDev &&
    pathname !== '/' &&
    !pathname.startsWith('/security') &&
    !pathname.startsWith('/ledger');

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
    const t = window.setTimeout(() => firstFocusRef.current?.focus(), 0);
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
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (activeEl === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!open) return null;

  const linkItems = [
    { to: '/#how-it-works', label: 'How it works', active: active.howItWorks, hash: true },
    { to: '/security', label: 'Security', active: active.security, hash: false },
    { to: '/ledger', label: 'Ledger', active: active.ledger, hash: false },
    { to: '/#waitlist', label: 'Pilot access', active: active.pilotAccess, hash: true },
  ] as const;

  return (
    <div
      ref={panelRef}
      id="public-site-mobile-nav"
      role="region"
      aria-labelledby={titleId}
      className="absolute left-0 right-0 top-full border-b border-white/[0.07] bg-[rgba(10,14,22,0.98)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] lg:hidden"
    >
      <h2 id={titleId} className="sr-only">
        Site navigation
      </h2>
      <div className={twMerge(publicShellInnerClass, 'py-4')}>
        <nav aria-label="Mobile primary">
          <ul className={twMerge(shellListResetClass, 'flex flex-col gap-3.5')}>
            {linkItems.map((item, i) => (
              <li key={item.label} className="list-none">
                {item.hash ? (
                  <a
                    ref={i === 0 ? firstFocusRef : undefined}
                    href={item.to}
                    className={mobileLink(item.active)}
                    aria-current={item.active ? 'page' : undefined}
                    onClick={onClose}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    ref={i === 0 ? firstFocusRef : undefined}
                    to={item.to}
                    className={mobileLink(item.active)}
                    aria-current={item.active ? 'page' : undefined}
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-5 border-t border-white/[0.06] pt-5">
          <a
            href="/#waitlist"
            className={twMerge(
              'focus-ring inline-flex h-10 min-h-[40px] w-full items-center justify-center rounded-[8px] px-4 font-heading text-[0.875rem] font-semibold transition-opacity',
              'bg-teal text-white hover:bg-teal-dark',
              ctaMuted && 'opacity-[0.88]',
            )}
            onClick={onClose}
          >
            Request pilot access
          </a>
        </div>
        {showDev ? (
          <div className="mt-6 border-t border-white/[0.06] pt-4">
            <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
              Dev
            </p>
            <ul className={twMerge(shellListResetClass, 'flex flex-col gap-2 text-[0.875rem]')}>
              <li className="list-none">
                <Link
                  to="/verify"
                  className="block min-h-[44px] py-2.5 text-slate-500 hover:text-slate-300"
                  onClick={onClose}
                >
                  Verify
                </Link>
              </li>
              <li className="list-none">
                <Link
                  to="/find-squad"
                  className="block min-h-[44px] py-2.5 text-slate-500 hover:text-slate-300"
                  onClick={onClose}
                >
                  Find squad
                </Link>
              </li>
              <li className="list-none">
                <Link
                  to="/admin/health"
                  className="block min-h-[44px] py-2.5 text-slate-500 hover:text-slate-300"
                  onClick={onClose}
                >
                  Supabase health
                </Link>
              </li>
            </ul>
          </div>
        ) : null}
        {isMod ? (
          <div className="mt-4">
            <Link
              to="/admin/rooms"
              className="block min-h-[44px] py-2 text-[0.875rem] text-slate-500 hover:text-slate-300"
              onClick={onClose}
            >
              Admin
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PublicShellHeader() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const active = usePublicNavActive();
  const contextNode = HeaderContextContent();
  const showContext = pathname !== '/' && contextNode != null;
  const ledgerRecord = /^\/ledger\/[^/]+\/?$/.test(pathname);
  const ctaMuted = Boolean(ledgerRecord);

  const menuId = 'public-site-mobile-nav';

  return (
    <header className={HEADER_SHELL}>
      <div className="relative">
        {/* Primary row only — brand | nav | CTA (nav + CTA hidden/replaced on small screens). */}
        <div className={HEADER_MAIN_ROW}>
          <Link
            to="/"
            className="flex max-w-[260px] min-w-0 shrink-0 flex-col gap-0.5 no-underline transition-opacity hover:opacity-[0.95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal/50"
            aria-label="SquadRidge home"
          >
            <span className="font-heading text-[16px] font-semibold tracking-tight text-slate-100 lg:text-[17px]">
              SquadRidge
            </span>
            <span className="hidden sm:block text-[12px] font-normal leading-snug text-slate-500 lg:text-[13px]">
              Verified dialogue infrastructure
            </span>
          </Link>

          <DesktopPrimaryNav active={active} onNavigate={closeMobile} />

          <div className="flex min-w-0 shrink-0 items-center justify-end gap-3 lg:justify-self-end">
            <div className="hidden lg:block">
              <a
                href="/#waitlist"
                className={twMerge(
                  'focus-ring inline-flex min-h-[42px] items-center justify-center rounded-[8px] border border-transparent bg-teal px-[16px] font-heading text-[0.875rem] font-semibold text-white transition-[opacity,background-color] hover:bg-teal-dark',
                  'lg:min-h-[44px]',
                  ctaMuted && 'opacity-[0.88]',
                )}
              >
                Request pilot access
              </a>
            </div>
            <div className="flex items-center lg:hidden">
              <button
                ref={menuBtnRef}
                type="button"
                className="inline-flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[6px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/50"
                aria-expanded={mobileOpen}
                aria-controls={menuId}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4 6h16M4 12h16M4 18h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Route context only — full-width row, never inline with the CTA */}
        {showContext ? (
          <div className="border-t border-white/[0.06] bg-[rgba(7,10,16,0.65)]">
            <div
              className={twMerge(
                publicShellInnerClass,
                'flex min-h-0 items-center py-2.5 lg:h-9 lg:py-0',
              )}
            >
              <div className="min-w-0 flex-1">{contextNode}</div>
            </div>
          </div>
        ) : null}

        <MobileNavPanel
          open={mobileOpen}
          active={active}
          onClose={closeMobile}
          returnFocusRef={menuBtnRef}
          ctaMuted={ctaMuted}
        />
      </div>
    </header>
  );
}

export function AppHeaderNav({ variant }: { variant: Variant }) {
  if (variant === 'minimal') {
    return (
      <header className={HEADER_SHELL}>
        <div
          className={twMerge(
            publicShellInnerClass,
            'flex h-16 items-center justify-between gap-4 lg:h-[72px]',
          )}
        >
          <Link
            to="/"
            className="flex max-w-[260px] flex-col gap-0.5 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal/50"
            aria-label="SquadRidge home"
          >
            <span className="font-heading text-[16px] font-semibold tracking-tight text-slate-100 lg:text-[17px]">
              SquadRidge
            </span>
            <span className="hidden sm:block text-[12px] font-normal text-slate-500 lg:text-[13px]">
              Verified dialogue infrastructure
            </span>
          </Link>
          <span className="flex-1" aria-hidden />
          <Link
            to="/"
            className="min-h-[44px] shrink-0 content-center font-sans text-[0.875rem] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-300 hover:underline"
          >
            Exit to home
          </Link>
        </div>
      </header>
    );
  }

  return (
    <>
      <PublicShellHeader />
      <NavigationProgress />
      <JourneyStrip />
    </>
  );
}
