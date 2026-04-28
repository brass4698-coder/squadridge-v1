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
  });

  it('calls the create_demo_squad RPC and stores the returned id', async () => {
    const { createDemoSquad } = await import('./squad');
    const rpc = vi.fn().mockResolvedValue({
      data: '22222222-2222-4222-8222-222222222222',
      error: null,
    });
    const getSession = vi.fn().mockResolvedValue({ data: { session: { access_token: 't' } } });
    const supabase = {
      auth: { getSession, signInAnonymously: vi.fn() },
      rpc,
      from: vi.fn(() => {
        throw new Error('createDemoSquad must use the RPC, not direct table inserts');
      }),
    } as never;

    const id = await createDemoSquad(supabase);

    expect(rpc).toHaveBeenCalledWith('create_demo_squad');
    expect(id).toBe('22222222-2222-4222-8222-222222222222');
    expect(localStorage.getItem(LAST_SQUAD_KEY)).toBe(id);
  });

  it('propagates the RPC error and does not write to localStorage', async () => {
    const { createDemoSquad } = await import('./squad');
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'rls denied' } });
    const getSession = vi.fn().mockResolvedValue({ data: { session: { access_token: 't' } } });
    const supabase = {
      auth: { getSession, signInAnonymously: vi.fn() },
      rpc,
    } as never;

    await expect(createDemoSquad(supabase)).rejects.toEqual({ message: 'rls denied' });
    expect(localStorage.getItem(LAST_SQUAD_KEY)).toBeNull();
  });

  it('throws a clear error if the RPC returns no data', async () => {
    const { createDemoSquad } = await import('./squad');
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const getSession = vi.fn().mockResolvedValue({ data: { session: { access_token: 't' } } });
    const supabase = {
      auth: { getSession, signInAnonymously: vi.fn() },
      rpc,
    } as never;

    await expect(createDemoSquad(supabase)).rejects.toThrow(/no squad id/);
    expect(localStorage.getItem(LAST_SQUAD_KEY)).toBeNull();
  });
});
