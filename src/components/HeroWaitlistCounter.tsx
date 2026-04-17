import { useCallback, useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib';

export const WAITLIST_CHANGED_EVENT = 'squadridge:waitlist-changed';

function parseWaitlistCount(data: unknown): number | null {
  if (data == null) return null;
  if (typeof data === 'number' && Number.isFinite(data)) return Math.max(0, Math.floor(data));
  if (typeof data === 'string' && data.length > 0) {
    const n = Number.parseInt(data, 10);
    return Number.isFinite(n) ? Math.max(0, n) : null;
  }
  return null;
}

/**
 * Social proof line beneath the hero waitlist CTA — uses public aggregate only (no PII).
 */
export function HeroWaitlistCounter() {
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    void (async () => {
      const { data, error } = await getSupabase().rpc('waitlist_signup_count');
      if (error) return;
      setCount(parseWaitlistCount(data));
    })();
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    function onWaitlistChanged() {
      fetchCount();
    }
    window.addEventListener(WAITLIST_CHANGED_EVENT, onWaitlistChanged);
    return () => window.removeEventListener(WAITLIST_CHANGED_EVENT, onWaitlistChanged);
  }, [fetchCount]);

  if (!isSupabaseConfigured()) {
    return (
      <p className="mt-2 max-w-copy font-sans text-sm font-normal leading-relaxed text-landing-muted">
        Add your email below — you&apos;ll be in good company.
      </p>
    );
  }

  if (count === null) {
    return <div className="mt-2 h-4" aria-hidden />;
  }

  if (count === 0) {
    return (
      <p className="mt-2 font-sans text-sm font-normal text-landing-muted">
        Be among the first on the list — we&apos;re just getting started.
      </p>
    );
  }

  const n = count.toLocaleString();
  const people = count === 1 ? 'person' : 'people';
  return (
    <p className="mt-2 font-sans text-sm font-normal tabular-nums leading-relaxed text-landing-muted">
      {n} {people} waiting
      <span className="text-landing-muted/75"> — you&apos;re not alone.</span>
    </p>
  );
}
