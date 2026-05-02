import { screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { renderWithAuth } from '../test/renderWithAuth';
import { useSquad, type SquadRow } from './useSquad';
import type { Database } from '../lib';

function Harness({ squadId }: { squadId?: string }) {
  const q = useSquad(squadId);
  return (
    <div>
      <div data-testid="status">{q.status}</div>
      <div data-testid="error">{q.error?.message ?? ''}</div>
      <div data-testid="id">{q.data?.id ?? ''}</div>
    </div>
  );
}

interface MakeStubOptions {
  row?: Partial<SquadRow> | null;
  error?: { message: string } | null;
}

function makeSupabaseStub({ row = null, error = null }: MakeStubOptions = {}): {
  client: SupabaseClient<Database>;
  /** Mock spy on `.from('squads').select('*').eq(...).maybeSingle()`. */
  maybeSingle: ReturnType<typeof vi.fn>;
  fromSpy: ReturnType<typeof vi.fn>;
} {
  const maybeSingle = vi.fn().mockResolvedValue({ data: row, error });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const fromSpy = vi.fn().mockReturnValue({ select });
  const client = { from: fromSpy } as unknown as SupabaseClient<Database>;
  return { client, maybeSingle, fromSpy };
}

describe('useSquad', () => {
  it('is disabled when squadId is undefined', async () => {
    const { client, fromSpy } = makeSupabaseStub();
    renderWithAuth(<Harness squadId={undefined} />, client);
    // Wait one microtask cycle and assert no DB call was made.
    await Promise.resolve();
    expect(fromSpy).not.toHaveBeenCalled();
  });

  it('returns the row from .from("squads").select("*").eq("id", ?).maybeSingle()', async () => {
    const row = { id: 'sq-1', archived_at: null } as Partial<SquadRow>;
    const { client, fromSpy, maybeSingle } = makeSupabaseStub({ row });
    renderWithAuth(<Harness squadId="sq-1" />, client);

    await waitFor(() => {
      expect(screen.getByTestId('id').textContent).toBe('sq-1');
    });
    expect(fromSpy).toHaveBeenCalledWith('squads');
    expect(maybeSingle).toHaveBeenCalledTimes(1);
  });

  it('surfaces a query error as a thrown Error with the original message', async () => {
    const { client } = makeSupabaseStub({ error: { message: 'permission denied' } });
    renderWithAuth(<Harness squadId="sq-2" />, client);

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error');
    });
    expect(screen.getByTestId('error').textContent).toBe('permission denied');
  });

  it('returns null when the row does not exist (RLS-filtered or archived)', async () => {
    const { client } = makeSupabaseStub({ row: null });
    renderWithAuth(<Harness squadId="sq-3" />, client);

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('success');
    });
    expect(screen.getByTestId('id').textContent).toBe('');
  });
});
