import { useCallback, useEffect, useState } from 'react';

export const SLOW_DOWN_BREATH_MS = 2_000;
export const SLOW_DOWN_COOLDOWN_MS = 12_000;

export type SlowDownState = {
  breathing: boolean;
  cooldownUntil: number;
  cooldownRemainingMs: number;
  isCoolingDown: boolean;
};

/**
 * Shared Slow down controller for v2 rooms.
 * Breath overlay (~2s) then send cooldown (default 12s within 10–15s band).
 */
export function useSlowDown(options?: { cooldownMs?: number; breathMs?: number }) {
  const cooldownMs = options?.cooldownMs ?? SLOW_DOWN_COOLDOWN_MS;
  const breathMs = options?.breathMs ?? SLOW_DOWN_BREATH_MS;
  const [breathing, setBreathing] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!breathing && cooldownUntil <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [breathing, cooldownUntil]);

  const trigger = useCallback(() => {
    if (breathing) return false;
    if (cooldownUntil > Date.now()) return false;
    setBreathing(true);
    window.setTimeout(() => {
      setBreathing(false);
      setCooldownUntil(Date.now() + cooldownMs);
      setNow(Date.now());
    }, breathMs);
    return true;
  }, [breathing, breathMs, cooldownMs, cooldownUntil]);

  const cooldownRemainingMs = Math.max(0, cooldownUntil - now);
  const isCoolingDown = cooldownRemainingMs > 0;

  return {
    breathing,
    cooldownUntil,
    cooldownRemainingMs,
    isCoolingDown,
    trigger,
    sendBlocked: breathing || isCoolingDown,
  } satisfies SlowDownState & {
    trigger: () => boolean;
    sendBlocked: boolean;
  };
}
