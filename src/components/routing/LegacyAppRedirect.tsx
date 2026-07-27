import { Navigate, useLocation } from 'react-router-dom';

/** Rewrites legacy path prefixes to the /app namespace. */
export function LegacyAppRedirect({
  fromPrefix,
  toPrefix,
}: {
  fromPrefix: string;
  toPrefix: string;
}) {
  const { pathname, search, hash } = useLocation();
  const nextPath = pathname.startsWith(fromPrefix)
    ? `${toPrefix}${pathname.slice(fromPrefix.length)}`
    : toPrefix;
  return <Navigate to={`${nextPath}${search}${hash}`} replace />;
}
