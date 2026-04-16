import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to the top on every client-side navigation (path, query, or hash).
 */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
}
