/**
 * Local check-off persistence for the pilot readiness instrument.
 * Browser-only — no backend. Keyed by user id when available.
 */

import { PILOT_CHECKABLE_ITEM_IDS } from '../data/pilotReadinessChecklist';

export const PILOT_CHECKLIST_STORAGE_PREFIX = 'sr_pilot_checklist_v1' as const;

export type PilotChecklistProgress = {
  checkedIds: string[];
  updatedAt: string | null;
};

export function pilotChecklistStorageKey(userId: string | null | undefined): string {
  const scope = userId && userId.length > 0 ? userId : 'anonymous';
  return `${PILOT_CHECKLIST_STORAGE_PREFIX}:${scope}`;
}

export function emptyPilotChecklistProgress(): PilotChecklistProgress {
  return { checkedIds: [], updatedAt: null };
}

function sanitizeCheckedIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(PILOT_CHECKABLE_ITEM_IDS);
  const next: string[] = [];
  for (const id of raw) {
    if (typeof id === 'string' && allowed.has(id) && !next.includes(id)) {
      next.push(id);
    }
  }
  return next;
}

export function parsePilotChecklistProgress(raw: string | null): PilotChecklistProgress {
  if (!raw) return emptyPilotChecklistProgress();
  try {
    const parsed = JSON.parse(raw) as { checkedIds?: unknown; updatedAt?: unknown };
    const checkedIds = sanitizeCheckedIds(parsed.checkedIds);
    const updatedAt =
      typeof parsed.updatedAt === 'string' && parsed.updatedAt.length > 0
        ? parsed.updatedAt
        : checkedIds.length > 0
          ? new Date().toISOString()
          : null;
    return { checkedIds, updatedAt };
  } catch {
    return emptyPilotChecklistProgress();
  }
}

export function readPilotChecklistProgress(
  userId: string | null | undefined,
): PilotChecklistProgress {
  if (typeof localStorage === 'undefined') {
    return emptyPilotChecklistProgress();
  }
  try {
    return parsePilotChecklistProgress(localStorage.getItem(pilotChecklistStorageKey(userId)));
  } catch {
    return emptyPilotChecklistProgress();
  }
}

export function writePilotChecklistProgress(
  userId: string | null | undefined,
  checkedIds: readonly string[],
): PilotChecklistProgress {
  const sanitized = sanitizeCheckedIds([...checkedIds]);
  const progress: PilotChecklistProgress = {
    checkedIds: sanitized,
    updatedAt: sanitized.length > 0 ? new Date().toISOString() : null,
  };
  if (typeof localStorage === 'undefined') {
    return progress;
  }
  try {
    if (sanitized.length === 0) {
      localStorage.removeItem(pilotChecklistStorageKey(userId));
    } else {
      localStorage.setItem(pilotChecklistStorageKey(userId), JSON.stringify(progress));
    }
  } catch {
    /* quota / private mode — keep in-memory result */
  }
  return progress;
}

export function togglePilotChecklistItem(
  checkedIds: readonly string[],
  itemId: string,
  checked: boolean,
): string[] {
  const allowed = new Set(PILOT_CHECKABLE_ITEM_IDS);
  if (!allowed.has(itemId)) return [...checkedIds];
  const set = new Set(checkedIds);
  if (checked) set.add(itemId);
  else set.delete(itemId);
  return PILOT_CHECKABLE_ITEM_IDS.filter((id) => set.has(id));
}
