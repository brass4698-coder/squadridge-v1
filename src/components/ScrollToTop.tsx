import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls appropriately on client-side navigation: hash links scroll to the target id;
 * otherwise scroll to top. (Scrolling to top on every hash change broke `/#waitlist` and in-page anchors.)
 */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash.length > 1) {
      const id = decodeURIComponent(hash.slice(1));
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
}
