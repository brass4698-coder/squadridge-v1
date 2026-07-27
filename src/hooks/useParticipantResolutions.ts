import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ParticipantResolutionItem } from '../lib/sessionResolutions';

export function useParticipantResolutions(token: string | undefined) {
  const [items, setItems] = useState<ParticipantResolutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.rpc('list_session_resolutions_for_participant', {
      p_token: token,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const result = data as { ok?: boolean; error?: string; items?: ParticipantResolutionItem[] };
    if (!result?.ok) {
      setError(result?.error ?? 'Could not load interventions');
      setItems([]);
    } else {
      setItems(result.items ?? []);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  async function supportItem(itemId: string) {
    if (!token) return { ok: false as const, error: 'NO_TOKEN' };
    const { data, error: err } = await supabase.rpc('participant_support_resolution', {
      p_token: token,
      p_item_id: itemId,
    });
    if (err) return { ok: false as const, error: err.message };
    const result = data as { ok?: boolean; error?: string };
    if (!result?.ok) return { ok: false as const, error: result?.error ?? 'SUPPORT_FAILED' };
    await fetchItems();
    return { ok: true as const };
  }

  return { items, loading, error, refetch: fetchItems, supportItem };
}
