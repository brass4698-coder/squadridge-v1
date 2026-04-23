import { Link, useLocation } from 'react-router-dom';

/** Primary match journey: progress strip covers orientation; skip duplicate crumbs. */
function isInPrimaryMatchFlow(pathname: string) {
  return (
    pathname.startsWith('/find-squad') ||
    pathname.startsWith('/intent') ||
    pathname.startsWith('/match') ||
    pathname.startsWith('/session') ||
    pathname.startsWith('/ledger')
  );
}

type Crumb = { to?: string; label: string };

const EXACT: Record<string, { parent: Crumb; current: string }> = {
  '/verify': { parent: { to: '/', label: 'Home' }, current: 'Verification' },
  '/security': { parent: { to: '/', label: 'Home' }, current: 'Security' },
  '/settings/profile': { parent: { to: '/', label: 'Home' }, current: 'Profile & keys' },
  '/admin/health': { parent: { to: '/', label: 'Home' }, current: 'Supabase health' },
  '/mod': { parent: { to: '/', label: 'Home' }, current: 'Moderation' },
  '/sign-in': { parent: { to: '/', label: 'Home' }, current: 'Sign in' },
  '/pitch-deck-hub': { parent: { to: '/', label: 'Home' }, current: 'Pitch materials' },
  '/auth/callback': { parent: { to: '/', label: 'Home' }, current: 'Account' },
};

function humanizeLastSegment(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return 'Page';
  const raw = parts[parts.length - 1] ?? 'Page';
  return raw
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getTrail(pathname: string): Crumb[] | null {
  if (pathname === '/' || isInPrimaryMatchFlow(pathname)) return null;
  const exact = EXACT[pathname];
  if (exact) {
    return [exact.parent, { label: exact.current }];
  }
  if (pathname.startsWith('/settings/')) {
    return [{ to: '/', label: 'Home' }, { label: humanizeLastSegment(pathname) }];
  }
  return [{ to: '/', label: 'Home' }, { label: humanizeLastSegment(pathname) }];
}

/** Line-of-sight for secondary and account routes (not the main match flow). */
export function Breadcrumbs() {
  const { pathname } = useLocation();
  const trail = getTrail(pathname);
  if (!trail || trail.length === 0) return null;

  return (
    <nav
      className="mb-3 flex w-full max-w-6xl flex-wrap items-center gap-2 font-sans text-[0.8125rem] leading-snug text-slate-400"
      aria-label="Breadcrumb"
    >
      {trail.map((crumb, i) => {
        const isLast = i === trail.length - 1;
        if (isLast) {
          return (
            <span key={`cur-${i}`} className="font-medium text-slate-100">
              {crumb.label}
            </span>
          );
        }
        if (crumb.to) {
          return (
            <span key={`link-${i}`} className="contents">
              <Link
                to={crumb.to}
                className="text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/50"
              >
                {crumb.label}
              </Link>
              <span className="text-slate-500" aria-hidden>
                /
              </span>
            </span>
          );
        }
        return null;
      })}
    </nav>
  );
}
