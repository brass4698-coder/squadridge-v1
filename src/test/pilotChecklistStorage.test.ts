import { beforeEach, describe, expect, it } from 'vitest';
import {
  PILOT_CHECKABLE_ITEM_IDS,
  PILOT_READINESS_SECTIONS,
  getCheckablePilotItemIds,
} from '../data/pilotReadinessChecklist';
import {
  emptyPilotChecklistProgress,
  parsePilotChecklistProgress,
  pilotChecklistStorageKey,
  readPilotChecklistProgress,
  togglePilotChecklistItem,
  writePilotChecklistProgress,
} from '../lib/pilotChecklistStorage';

describe('pilotReadinessChecklist data', () => {
  it('covers the v2 checklist section set', () => {
    const ids = PILOT_READINESS_SECTIONS.map((s) => s.id);
    expect(ids).toEqual([
      'before-go-live',
      'session-setup',
      'participant-path',
      'during-session',
      'close-release',
      'post-session',
      'abort',
      'deferred',
    ]);
  });

  it('exposes only checkable ids for progress', () => {
    expect(getCheckablePilotItemIds().length).toBeGreaterThan(10);
    expect(PILOT_CHECKABLE_ITEM_IDS.every((id) => typeof id === 'string')).toBe(true);
    const abortIds = PILOT_READINESS_SECTIONS.find((s) => s.id === 'abort')?.items.map((i) => i.id);
    for (const id of abortIds ?? []) {
      expect(PILOT_CHECKABLE_ITEM_IDS).not.toContain(id);
    }
  });
});

describe('pilotChecklistStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keys storage by user id', () => {
    expect(pilotChecklistStorageKey('user-1')).toBe('sr_pilot_checklist_v1:user-1');
    expect(pilotChecklistStorageKey(null)).toBe('sr_pilot_checklist_v1:anonymous');
  });

  it('parses and sanitizes checked ids', () => {
    const parsed = parsePilotChecklistProgress(
      JSON.stringify({
        checkedIds: ['golive-commit', 'not-a-real-id', 'golive-commit'],
        updatedAt: '2026-07-26T12:00:00.000Z',
      }),
    );
    expect(parsed.checkedIds).toEqual(['golive-commit']);
    expect(parsed.updatedAt).toBe('2026-07-26T12:00:00.000Z');
  });

  it('returns empty progress for corrupt JSON', () => {
    expect(parsePilotChecklistProgress('{')).toEqual(emptyPilotChecklistProgress());
  });

  it('toggles items in canonical order', () => {
    const next = togglePilotChecklistItem(['golive-check-all'], 'golive-commit', true);
    expect(next[0]).toBe('golive-commit');
    expect(next).toContain('golive-check-all');
    expect(togglePilotChecklistItem(next, 'golive-check-all', false)).toEqual(['golive-commit']);
  });

  it('persists and clears localStorage', () => {
    writePilotChecklistProgress('u1', ['golive-mou']);
    expect(readPilotChecklistProgress('u1').checkedIds).toEqual(['golive-mou']);
    writePilotChecklistProgress('u1', []);
    expect(localStorage.getItem(pilotChecklistStorageKey('u1'))).toBeNull();
  });
});
