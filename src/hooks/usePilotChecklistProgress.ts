import { useCallback, useEffect, useMemo, useState } from 'react';
import { PILOT_CHECKABLE_ITEM_IDS } from '../data/pilotReadinessChecklist';
import {
  emptyPilotChecklistProgress,
  readPilotChecklistProgress,
  togglePilotChecklistItem,
  writePilotChecklistProgress,
  type PilotChecklistProgress,
} from '../lib/pilotChecklistStorage';
import { useAuth } from './useAuth';

export type UsePilotChecklistProgressResult = {
  ready: boolean;
  checkedIds: ReadonlySet<string>;
  checkedCount: number;
  totalCheckable: number;
  updatedAt: string | null;
  isChecked: (itemId: string) => boolean;
  setChecked: (itemId: string, checked: boolean) => void;
  reset: () => void;
};

/**
 * Local facilitator check-offs for /app/pilot-guide.
 * Persists to localStorage keyed by auth user id (anonymous fallback).
 */
export function usePilotChecklistProgress(): UsePilotChecklistProgressResult {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [progress, setProgress] = useState<PilotChecklistProgress>(emptyPilotChecklistProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    setProgress(readPilotChecklistProgress(userId));
    setHydrated(true);
  }, [authLoading, userId]);

  const checkedSet = useMemo(() => new Set(progress.checkedIds), [progress.checkedIds]);

  const setChecked = useCallback(
    (itemId: string, checked: boolean) => {
      setProgress((prev) => {
        const nextIds = togglePilotChecklistItem(prev.checkedIds, itemId, checked);
        return writePilotChecklistProgress(userId, nextIds);
      });
    },
    [userId],
  );

  const reset = useCallback(() => {
    setProgress(writePilotChecklistProgress(userId, []));
  }, [userId]);

  const isChecked = useCallback((itemId: string) => checkedSet.has(itemId), [checkedSet]);

  return {
    ready: hydrated && !authLoading,
    checkedIds: checkedSet,
    checkedCount: progress.checkedIds.length,
    totalCheckable: PILOT_CHECKABLE_ITEM_IDS.length,
    updatedAt: progress.updatedAt,
    isChecked,
    setChecked,
    reset,
  };
}
