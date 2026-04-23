import { getSiteUrl } from './env';

export function getAuthCallbackUrl(nextPath?: string): string {
  const origin = getSiteUrl();
  const url = new URL('/auth/callback', origin);
  if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    url.searchParams.set('next', nextPath);
  }
  return url.toString();
}
