import { Link, useLocation } from 'react-router-dom';
import { publicShellInnerClass } from './publicShell';

/** Primary match journey: progress strip covers orientation; skip duplicate crumbs. */
function isInPrimaryMatchFlow(pathname: string) {
  return (
    pathname.startsWith('/find-squad') ||
    pathname.startsWith('/intent') ||
    pathname.startsWith('/match') ||
    pathname.startsWith('/session')
  );
}

type Crumb = { to?: string; label: string };

const EXACT: Record<string, { parent: Crumb; current: string }> = {
  '/verify': { parent: { to: '/', label: 'Home' }, current: 'Verification' },
  '/security': {
    parent: { to: '/trust', label: 'Trust & Safety' },
    current: 'Security Disclosure',
  },
  '/dialogues': { parent: { to: '/', label: 'Home' }, current: 'Dialogues' },
  '/trust': { parent: { to: '/', label: 'Home' }, current: 'Trust & Safety' },
  '/ledger': { parent: { to: '/', label: 'Home' }, current: 'Ledger' },
  '/insights': { parent: { to: '/', label: 'Home' }, current: 'Insights' },
  '/insights/dashboard': {
    parent: { to: '/insights', label: 'Insights' },
    current: 'Moderator dashboard',
  },
  '/partners': { parent: { to: '/', label: 'Home' }, current: 'Partners' },
  '/settings': { parent: { to: '/', label: 'Home' }, current: 'Settings' },
  '/settings/profile': {
    parent: { to: '/settings', label: 'Settings' },
    current: 'Profile & keys',
  },
  '/settings/safety': { parent: { to: '/settings', label: 'Settings' }, current: 'Safety center' },
  '/admin/health': { parent: { to: '/admin/rooms', label: 'Admin' }, current: 'Supabase health' },
  '/admin/reports': { parent: { to: '/admin/rooms', label: 'Admin' }, current: 'Reports' },
  '/admin/verification': {
    parent: { to: '/admin/rooms', label: 'Admin' },
    current: 'Verification',
  },
  '/admin/rooms': { parent: { to: '/', label: 'Home' }, current: 'Admin rooms' },
  '/admin/logs': { parent: { to: '/admin/rooms', label: 'Admin' }, current: 'Audit log' },
  '/admin/csi': { parent: { to: '/admin/rooms', label: 'Admin' }, current: 'CSI' },
  '/admin/demo-hub': {
    parent: { to: '/admin/rooms', label: 'Admin' },
    current: 'Demo command center',
  },
  '/mod': { parent: { to: '/admin/rooms', label: 'Admin' }, current: 'Moderation' },
  '/invite': { parent: { to: '/', label: 'Home' }, current: 'Invite' },
  '/sign-in': { parent: { to: '/', label: 'Home' }, current: 'Sign in' },
  /* Internal tooling — surfaced only inside Admin; crumb anchors back there
   * so it never reads as a public marketing surface. */
  '/pitch-deck-hub': { parent: { to: '/admin/rooms', label: 'Admin' }, current: 'Pitch deck hub' },
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
  const ledgerRecord = pathname.match(/^\/ledger\/([^/]+)\/?$/);
  if (ledgerRecord) {
    return [{ to: '/ledger', label: 'Ledger' }, { label: ledgerRecord[1] }];
  }
  const exact = EXACT[pathname];
  if (exact) {
    return [exact.parent, { label: exact.current }];
  }
  if (pathname.startsWith('/settings/')) {
    return [{ to: '/settings', label: 'Settings' }, { label: humanizeLastSegment(pathname) }];
  }
  if (pathname.startsWith('/admin/')) {
    return [{ to: '/admin/rooms', label: 'Admin' }, { label: humanizeLastSegment(pathname) }];
  }
  return [{ to: '/', label: 'Home' }, { label: humanizeLastSegment(pathname) }];
}

/** Line-of-sight for secondary and account routes (not the main match flow). */
export function Breadcrumbs() {
  const { pathname } = useLocation();
  const trail = getTrail(pathname);
  if (!trail || trail.length === 0) return null;

  return (
    <div className="bg-band-navy">
      <nav
        className={`${publicShellInnerClass} flex w-full flex-wrap items-center gap-2 py-3 font-sans text-[0.8125rem] leading-snug text-slate-400`}
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
    </div>
  );
}
