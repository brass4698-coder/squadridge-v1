import { useCallback, useEffect, useState } from 'react';

export interface SendCooldownState {
  /** True while the cooldown is active. */
  paused: boolean;
  /** Whole seconds remaining before sends re-enable. */
  secondsRemaining: number;
  /** Engage a cooldown for `cooldownMs` from now. */
  engage: (cooldownMs: number) => void;
  /** Cancel an active cooldown immediately. */
  reset: () => void;
}

/**
 * Lightweight "Power of Pause" cooldown timer used by the session composer.
 * Tick-driven by `setInterval` so the visible countdown updates each second
 * without re-rendering the whole page.
 */
export function useSendCooldown(): SendCooldownState {
  const [until, setUntil] = useState<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!until || Date.now() >= until) return;
    const id = window.setInterval(() => {
      setTick((n) => n + 1);
      if (Date.now() >= until) {
        setUntil(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [until]);

  const engage = useCallback((cooldownMs: number) => {
    setUntil(Date.now() + cooldownMs);
  }, []);

  const reset = useCallback(() => {
    setUntil(null);
  }, []);

  const paused = until !== null && Date.now() < until;
  const secondsRemaining = until ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0;

  return { paused, secondsRemaining, engage, reset };
}
