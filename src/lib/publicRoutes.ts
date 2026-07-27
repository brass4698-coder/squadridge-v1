/**
 * Public routes that must paint immediately for unauthenticated diligence visitors.
 * Keep AuthGate and PublicShell in sync — import from here only.
 */

export const PUBLIC_IMMEDIATE_PAINT_PREFIXES = [
  '/how-it-works',
  '/use-cases',
  '/security',
  '/ledger',
  '/faq',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/request-access',
  '/briefings',
  '/pricing',
  '/roadmap',
  '/pipeline',
  '/traction',
  '/sign-in',
  '/enter',
  '/auth/callback',
  '/access-pending',
  '/demo',
  '/diligence',
] as const;

export function allowsImmediatePublicPaint(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_IMMEDIATE_PAINT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
