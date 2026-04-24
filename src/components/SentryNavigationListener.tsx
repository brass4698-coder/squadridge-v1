import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureRouteNavigation, isSentryEnabled } from '../lib';

/**
 * SPA navigation breadcrumbs + transaction naming when Sentry is enabled (React Router v7 has no `createRoutesFromChildren` for the official integration).
 */
export function SentryNavigationListener() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    captureRouteNavigation(pathname, search);
    if (isSentryEnabled()) {
      Sentry.getCurrentScope().setTransactionName(pathname || '/');
    }
  }, [pathname, search]);

  return null;
}
