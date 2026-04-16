import { Link, Outlet, useLocation } from 'react-router-dom';
import SquadLogo from '../SquadLogo';
import { SquadRidgeWordmark } from '../SquadRidgeWordmark';
import { getPublicContactEmail } from '../../lib/env';

export function AppLayout() {
  const contactEmail = getPublicContactEmail();
  const { pathname, hash } = useLocation();

  const navMuted = 'font-normal text-[#6b7280]';
  const navActive = 'font-normal text-[#e2e8f0]';

  const homeActive = pathname === '/' && hash !== '#waitlist';
  const waitlistActive = pathname === '/' && hash === '#waitlist';
  const onboardingActive = pathname.startsWith('/onboarding');
  const sessionActive = pathname.startsWith('/session');
  const matchActive = pathname.startsWith('/match');
  const supabaseActive = pathname.startsWith('/dev/supabase');

  const hideChrome = pathname.startsWith('/onboarding');

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden bg-navy text-white">
      {!hideChrome ? (
      <header className="sticky top-0 z-50 border-b border-solid border-[#141e30] bg-[rgba(11,15,26,0.85)] px-md py-4 backdrop-blur-[12px]">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-sm px-md" aria-label="Main">
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
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li>
              <Link
                to="/"
                className={homeActive ? navActive : navMuted}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/#waitlist"
                className={waitlistActive ? navActive : navMuted}
              >
                Early access
              </Link>
            </li>
            <li>
              <Link
                to="/onboarding"
                className={onboardingActive ? navActive : navMuted}
              >
                Onboarding
              </Link>
            </li>
            <li>
              <Link to="/session" className={sessionActive ? navActive : navMuted}>
                Session
              </Link>
            </li>
            <li>
              <Link to="/dev/supabase" className={supabaseActive ? navActive : navMuted}>
                Supabase
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      ) : null}
      <main
        className={`mx-auto flex w-full flex-1 flex-col ${
          hideChrome ? 'max-w-none p-0' : 'max-w-6xl px-md'
        } ${
          pathname === '/'
            ? 'pt-0 pb-xl'
            : pathname.startsWith('/session') || matchActive
              ? 'pt-0 pb-xl'
              : pathname.startsWith('/onboarding') ||
                pathname.startsWith('/ledger') ||
                pathname.startsWith('/verify')
              ? 'pt-0 pb-xl'
              : 'py-xl'
        }`}
      >
        <Outlet />
      </main>
      {!hideChrome ? (
      <footer className="border-t border-[#1a2236] bg-transparent">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-md py-8 text-center">
          <p className="max-w-md font-sans text-[0.85rem] font-normal leading-relaxed text-[#3d4f63]">
            Infrastructure for conversations the world needs but can&apos;t have openly.
          </p>
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="font-sans text-[0.85rem] font-normal text-[#3d4f63] underline-offset-4 hover:text-[#a8b2c1] hover:underline"
            >
              {contactEmail}
            </a>
          ) : null}
        </div>
      </footer>
      ) : null}
    </div>
  );
}
