/** Vertical padding for `<main>` — avoids brittle pathname chains in `AppLayout`. */
export function mainContentPaddingClass(pathname: string): string {
  if (pathname === '/') {
    return 'pt-0 pb-xl';
  }

  const tightPrefixes = [
    '/session',
    '/match',
    '/intent',
    '/onboarding',
    '/ledger',
    '/verify',
    '/security',
  ] as const;

  for (const p of tightPrefixes) {
    if (pathname === p || pathname.startsWith(`${p}/`)) {
      return 'pt-0 pb-xl';
    }
  }

  return 'py-xl';
}
