import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client BEFORE importing the module under test so that
// the module's `import { supabase } from './supabase'` picks up the stub.
const rpcMock = vi.fn();
vi.mock('./supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => rpcMock(...args) },
}));

// Silence the logger writes so they don't clutter test output; we still
// verify error-handling behaviour via return values.
vi.mock('./log', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  safeErrorMessage: (e: unknown) => (e instanceof Error ? e.message : 'unknown'),
}));

import { listUsersWithRoles, grantRoleToUser, revokeRoleFromUser } from './roles';

beforeEach(() => {
  rpcMock.mockReset();
});

describe('listUsersWithRoles', () => {
  it('passes limit + offset to the RPC and returns rows', async () => {
    const rows = [
      {
        user_id: 'u1',
        email: 'a@example.com',
        display_name: null,
        status: 'active',
        primary_role: 'facilitator',
        onboarding_completed: true,
        created_at: '2026-07-01T00:00:00Z',
        roles: [],
      },
    ];
    rpcMock.mockResolvedValueOnce({ data: rows, error: null });

    const result = await listUsersWithRoles({ limit: 25, offset: 50 });

    expect(rpcMock).toHaveBeenCalledWith('list_users_with_roles', {
      p_limit: 25,
      p_offset: 50,
    });
    expect(result).toEqual(rows);
  });

  it('defaults limit=100 and offset=0 when no options are given', async () => {
    rpcMock.mockResolvedValueOnce({ data: [], error: null });
    await listUsersWithRoles();
    expect(rpcMock).toHaveBeenCalledWith('list_users_with_roles', {
      p_limit: 100,
      p_offset: 0,
    });
  });

  it('returns [] and swallows the error when the RPC fails', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    const result = await listUsersWithRoles();
    expect(result).toEqual([]);
  });

  it('returns [] when data is null (defensive)', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });
    expect(await listUsersWithRoles()).toEqual([]);
  });
});

describe('grantRoleToUser', () => {
  it('serialises role_key + explicit nulls for unspecified scope', async () => {
    rpcMock.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await grantRoleToUser('user-1', 'facilitator');

    expect(rpcMock).toHaveBeenCalledWith('grant_role_to_user', {
      p_target_user_id: 'user-1',
      p_role_key: 'facilitator',
      p_workspace_id: null,
      p_institution_id: null,
    });
    expect(result).toEqual({ success: true });
  });

  it('passes scoped workspace / institution IDs when provided', async () => {
    rpcMock.mockResolvedValueOnce({ data: { success: true }, error: null });
    await grantRoleToUser('user-1', 'analyst', {
      workspaceId: 'ws-9',
      institutionId: 'inst-3',
    });
    expect(rpcMock).toHaveBeenCalledWith('grant_role_to_user', {
      p_target_user_id: 'user-1',
      p_role_key: 'analyst',
      p_workspace_id: 'ws-9',
      p_institution_id: 'inst-3',
    });
  });

  it('surfaces the RPC error message on failure', async () => {
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'unauthorized: insufficient role to grant roles' },
    });
    const result = await grantRoleToUser('user-1', 'super_admin');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/insufficient role/);
  });

  it('reports success=false when the RPC succeeds but the payload lacks success:true', async () => {
    rpcMock.mockResolvedValueOnce({ data: {}, error: null });
    expect(await grantRoleToUser('user-1', 'observer')).toEqual({ success: false });
  });
});

describe('revokeRoleFromUser', () => {
  it('returns {success:true} on a successful revoke', async () => {
    rpcMock.mockResolvedValueOnce({ data: { success: true }, error: null });
    const result = await revokeRoleFromUser('user-1', 'facilitator');
    expect(result).toEqual({ success: true, reason: undefined });
  });

  it('surfaces {success:false, reason:not_found} when the tuple did not exist', async () => {
    rpcMock.mockResolvedValueOnce({
      data: { success: false, reason: 'not_found' },
      error: null,
    });
    const result = await revokeRoleFromUser('user-1', 'observer');
    expect(result).toEqual({ success: false, reason: 'not_found' });
  });

  it('surfaces the "cannot revoke the last super_admin" guard as an error string', async () => {
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'refused: cannot revoke the last super_admin' },
    });
    const result = await revokeRoleFromUser('user-1', 'super_admin');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/last super_admin/);
  });
});
