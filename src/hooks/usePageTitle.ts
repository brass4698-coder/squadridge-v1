import { useLayoutEffect } from 'react';

const DEFAULT_TITLE = 'SquadRidge';

/**
 * Sets document.title for public pages so browser history and review tools
 * can distinguish routes (SPA shell alone is not enough).
 * useLayoutEffect so the tab title updates before paint when possible.
 */
export function usePageTitle(title: string) {
  useLayoutEffect(() => {
    const previous = document.title;
    document.title = title.includes('SquadRidge') ? title : `${title} · SquadRidge`;
    return () => {
      document.title = previous || DEFAULT_TITLE;
    };
  }, [title]);
}
