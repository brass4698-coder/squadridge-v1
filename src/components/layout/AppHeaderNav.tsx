import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppNavContext, useIsModerator } from '../../hooks';
import { NavigationProgress } from './NavigationProgress';
import { publicShellInnerClass, shellListResetClass } from './publicShell';
import { twMerge } from 'tailwind-merge';
import { LanguageSwitcher } from './LanguageSwitcher';
import { IdentityModeChip } from './IdentityModeChip';
import { AccountMenu } from './AccountMenu';
import { useStrings } from '../../lib/i18n/strings';
import { SquadLogo } from '../SquadLogo';
import { SquadRidgeWordmark } from '../SquadRidgeWordmark';

const HEADER_SHELL =
  'sticky top-0 z-[100] border-b border-line-divider bg-surface backdrop-blur-[6px] supports-[backdrop-filter]:bg-[rgba(11,13,16,0.92)]';

/** Single primary row: 64px mobile, 72px desktop — context bar is always separate below. */
const HEADER_MAIN_ROW = twMerge(
  publicShellInnerClass,
  'flex h-16 shrink-0 items-center justify-between gap-3 lg:grid lg:h-[72px] lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_auto] lg:items-center lg:justify-normal lg:gap-6',
);

/** Institutional desktop nav — text-only states, no pill chrome */
const deskNavLink = (active: boolean) =>
  twMerge(
    'inline-flex max-w-full items-center justify-center border-b border-transparent pb-px text-center text-[15px] font-medium leading-snug tracking-normal transition-colors duration-150',
    'min-h-[44px] min-w-0 shrink px-0.5 pt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand',
    active
      ? 'border-record-line text-ink'
      : 'text-ink-faint hover:border-ink-faint/50 hover:text-ink-secondary',
  );

const mobileLink = (active: boolean) =>
  twMerge(
    'flex min-h-[44px] w-full items-center rounded-[6px] px-1 text-left text-[15px] font-medium leading-snug transition-colors',
    active
      ? 'text-ink underline decoration-ink-faint underline-offset-4'
      : 'text-ink-faint hover:bg-white/[0.04] hover:text-ink-secondary',
  );

type Variant = 'public' | 'app' | 'minimal';

function usePublicNavActive() {
  const { pathname } = useLocation();
  return {
    mission: pathname === '/' || pathname === '',
    dialogues:
      pathname === '/dialogues' ||
      pathname.startsWith('/dialogues/') ||
      pathname.startsWith('/find-squad') ||
      pathname.startsWith('/match') ||
      pathname.startsWith('/session/'),
    trust:
      pathname === '/trust' || pathname.startsWith('/trust/') || pathname.startsWith('/security'),
    partners: pathname === '/partners' || pathname.startsWith('/partners/'),
    ledger: pathname === '/ledger' || pathname === '/ledger/' || pathname.startsWith('/ledger/'),
  };
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
            className="inline-flex min-h-[44px] min-w-0 items-center font-sans text-[0.8rem] font-medium leading-snug text-teal-light underline-offset-4 hover:underline"
          >
            {onboardingLabel}
          </Link>
        ) : null}
        {showResumeCta && resumeHref ? (
          <Link
            to={resumeHref}
            className="inline-flex min-h-[44px] min-w-0 items-center font-sans text-[0.8rem] font-medium leading-snug text-teal-light underline-offset-4 hover:underline"
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
  const { t } = useStrings();
  /* Primary nav surfaces only the essential walkthrough/marketing pillars.
   * Insights is fixture-backed prototype reporting and lives in the footer. */
  const items = [
    { key: 'mission', to: '/', label: t('nav.mission'), isActive: active.mission },
    { key: 'dialogues', to: '/dialogues', label: t('nav.dialogues'), isActive: active.dialogues },
    { key: 'ledger', to: '/ledger', label: t('nav.ledger'), isActive: active.ledger },
    { key: 'trust', to: '/trust', label: t('nav.trust'), isActive: active.trust },
    { key: 'partners', to: '/partners', label: t('nav.partners'), isActive: active.partners },
  ] as const;

  return (
    <nav className="hidden min-w-0 w-full lg:flex lg:justify-center" aria-label="Primary">
      <ul
        className={twMerge(
          shellListResetClass,
          'flex min-w-0 flex-wrap items-center justify-center gap-x-5 xl:gap-x-6',
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
  mode,
}: {
  open: boolean;
  active: ReturnType<typeof usePublicNavActive>;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  ctaMuted: boolean;
  mode: 'public' | 'app';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const titleId = useId();
  const wasOpenRef = useRef(false);
  const { pathname } = useLocation();
  const { t } = useStrings();
  const showOperationalChrome = mode === 'app';
  const isDev = import.meta.env.DEV;
  const showDev =
    showOperationalChrome &&
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
    { to: '/', label: t('nav.mission'), active: active.mission, hash: false },
    { to: '/dialogues', label: t('nav.dialogues'), active: active.dialogues, hash: false },
    { to: '/ledger', label: t('nav.ledger'), active: active.ledger, hash: false },
    { to: '/trust', label: t('nav.trust'), active: active.trust, hash: false },
    { to: '/partners', label: t('nav.partners'), active: active.partners, hash: false },
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
        <div className="mt-5 flex flex-col gap-3 border-t border-line-divider pt-5">
          {showOperationalChrome ? (
            <div className="flex flex-wrap items-center gap-2">
              <LanguageSwitcher compact />
              <IdentityModeChip />
              <AccountMenu triggerVariant="public-shell" />
            </div>
          ) : (
            <div className="flex">
              <AccountMenu triggerVariant="public-shell" />
            </div>
          )}
          <a
            href="/#waitlist"
            className={twMerge(
              'focus-ring inline-flex min-h-[44px] w-full min-w-0 items-center justify-center rounded-[6px] px-4 py-2 text-center font-sans text-[0.875rem] font-semibold leading-snug transition-colors',
              'bg-brand text-brand-on hover:bg-brand-hover',
              ctaMuted && 'opacity-[0.88]',
            )}
            onClick={onClose}
          >
            {t('nav.apply')}
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
        {showOperationalChrome ? <MobileAdminLink onClose={onClose} /> : null}
      </div>
    </div>
  );
}

function MobileAdminLink({ onClose }: { onClose: () => void }) {
  const { data: isMod } = useIsModerator();
  if (!isMod) return null;
  return (
    <div className="mt-4">
      <Link
        to="/admin/rooms"
        className="block min-h-[44px] py-2 text-[0.875rem] text-slate-500 hover:text-slate-300"
        onClick={onClose}
      >
        Admin
      </Link>
    </div>
  );
}

function PublicShellHeader({ mode }: { mode: 'public' | 'app' }) {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const active = usePublicNavActive();
  const ledgerRecord = /^\/ledger\/[^/]+\/?$/.test(pathname);
  const ctaMuted = Boolean(ledgerRecord);
  const showOperationalChrome = mode === 'app';
  const { t } = useStrings();

  const menuId = 'public-site-mobile-nav';

  return (
    <header className={HEADER_SHELL}>
      <div className="relative">
        {/* Primary row only — brand | nav | CTA (nav + CTA hidden/replaced on small screens). */}
        <div className={HEADER_MAIN_ROW}>
          <Link
            to="/"
            className="flex max-w-[260px] min-w-0 shrink-0 items-center gap-2.5 no-underline transition-opacity hover:opacity-[0.92] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            aria-label="SquadRidge home"
          >
            <SquadLogo
              size={28}
              className="block h-[28px] w-[28px] shrink-0 lg:h-[32px] lg:w-[32px]"
              aria-hidden
            />
            <SquadRidgeWordmark
              alt=""
              aria-hidden
              className="h-[1.25rem] w-auto max-w-[min(180px,34vw)] translate-y-px lg:h-[1.4rem]"
            />
          </Link>

          <DesktopPrimaryNav active={active} onNavigate={closeMobile} />

          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 lg:justify-self-end lg:gap-3">
            <div className="hidden lg:flex lg:items-center lg:gap-2">
              {showOperationalChrome ? (
                <>
                  <LanguageSwitcher />
                  <IdentityModeChip />
                </>
              ) : null}
              {/* Account menu is the only signed-in affordance in the header.
               * On the marketing/public shell it self-renders as a muted "Sign in" link. */}
              <AccountMenu triggerVariant="public-shell" />
              <a
                href="/#waitlist"
                className={twMerge(
                  'focus-ring inline-flex min-h-[44px] min-w-0 items-center justify-center rounded-[6px] border border-transparent bg-brand px-4 py-2 text-center font-sans text-[0.85rem] font-semibold leading-snug text-brand-on transition-colors hover:bg-brand-hover',
                  ctaMuted && 'opacity-[0.88]',
                )}
              >
                {t('nav.apply')}
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

        <MobileNavPanel
          open={mobileOpen}
          active={active}
          onClose={closeMobile}
          returnFocusRef={menuBtnRef}
          ctaMuted={ctaMuted}
          mode={mode}
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
            className="flex max-w-[260px] items-center gap-2.5 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal/50"
            aria-label="SquadRidge home"
          >
            <SquadLogo
              size={28}
              className="block h-[28px] w-[28px] shrink-0 lg:h-[32px] lg:w-[32px]"
              aria-hidden
            />
            <SquadRidgeWordmark
              alt=""
              aria-hidden
              className="h-[1.25rem] w-auto max-w-[min(180px,34vw)] translate-y-px lg:h-[1.4rem]"
            />
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

  if (variant === 'public') return <PublicShellHeader mode="public" />;

  return (
    <>
      <PublicShellHeader mode="app" />
      <NavigationProgress />
      <JourneyStrip />
    </>
  );
}
