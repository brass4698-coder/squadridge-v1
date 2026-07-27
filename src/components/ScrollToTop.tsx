import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollAllRootsToTop } from '../demo/scrollRoot';

/**
 * Scrolls appropriately on client-side navigation: hash links scroll to the target id;
 * otherwise every scroll root (window + `[data-scroll-root]`) starts at the top.
 * (Scrolling to top on every hash change broke `/#waitlist` and in-page anchors.)
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
    scrollAllRootsToTop();
  }, [pathname, search, hash]);

  return null;
}
