import { Link, useLocation } from 'react-router-dom';

/**
 * Non-landing pages: fast escape to home on small viewports (complements footer “Start over”).
 */
export function MobileHomeFab() {
  const { pathname } = useLocation();
  if (pathname === '/') return null;
  /** Fixed profile footer bar occupies the bottom; avoid covering Save. */
  if (pathname.startsWith('/settings/')) return null;
  return (
    <Link
      to="/"
      className="fixed bottom-6 right-6 z-40 flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-full border border-[#2d3f55] bg-[#0f1623]/95 px-3.5 py-2 font-sans text-[0.8rem] font-medium text-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-colors hover:border-teal/45 hover:text-slate-100 lg:hidden"
      title="Return home"
    >
      <span aria-hidden>←</span> Home
    </Link>
  );
}
