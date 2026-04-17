import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  ensureAnonymousSession,
  getLastSquadIdFromStorage,
  LAST_SQUAD_KEY,
  setLastSquadIdInStorage,
} from './squad';

describe('squad storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('getLastSquadIdFromStorage returns null when empty', () => {
    expect(getLastSquadIdFromStorage()).toBeNull();
  });

  it('setLastSquadIdInStorage round-trips', () => {
    setLastSquadIdInStorage('squad-xyz');
    expect(localStorage.getItem(LAST_SQUAD_KEY)).toBe('squad-xyz');
    expect(getLastSquadIdFromStorage()).toBe('squad-xyz');
  });
});

describe('ensureAnonymousSession', () => {
  it('returns when session already exists', async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: { access_token: 'x' } } });
    const signInAnonymously = vi.fn();
    const supabase = {
      auth: { getSession, signInAnonymously },
    } as never;

    await ensureAnonymousSession(supabase);
    expect(getSession).toHaveBeenCalled();
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('signs in anonymously when no session', async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: null } });
    const signInAnonymously = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      auth: { getSession, signInAnonymously },
    } as never;

    await ensureAnonymousSession(supabase);
    expect(signInAnonymously).toHaveBeenCalled();
  });

  it('throws when anonymous sign-in fails', async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: null } });
    const signInAnonymously = vi.fn().mockResolvedValue({ error: { message: 'nope' } });
    const supabase = {
      auth: { getSession, signInAnonymously },
    } as never;

    await expect(ensureAnonymousSession(supabase)).rejects.toEqual({ message: 'nope' });
  });
});

describe('createDemoSquad', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('crypto', {
      randomUUID: () => '11111111-1111-4111-8111-111111111111',
      getRandomValues: (arr: Uint8Array) => {
        arr.fill(7);
        return arr;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates squad and membership and stores last squad id', async () => {
    const { createDemoSquad } = await import('./squad');
    const squadInsert = vi.fn().mockResolvedValue({ error: null });
    const memberInsert = vi.fn().mockResolvedValue({ error: null });
    const getSession = vi.fn().mockResolvedValue({ data: { session: { access_token: 't' } } });
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: '00000000-0000-4000-8000-0000000000bb' } },
    });
    const supabase = {
      auth: { getSession, getUser, signInAnonymously: vi.fn() },
      from: vi.fn((table: string) => {
        if (table === 'squads') return { insert: squadInsert };
        if (table === 'squad_members') return { insert: memberInsert };
        throw new Error(`unexpected table ${table}`);
      }),
    } as never;

    const id = await createDemoSquad(supabase);

    expect(id).toBe('11111111-1111-4111-8111-111111111111');
    expect(squadInsert).toHaveBeenCalled();
    expect(memberInsert).toHaveBeenCalled();
    expect(localStorage.getItem(LAST_SQUAD_KEY)).toBe(id);
  });
});
