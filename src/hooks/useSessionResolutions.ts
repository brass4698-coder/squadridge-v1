import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SessionResolutionItem } from '../lib/sessionResolutions';

export function useSessionResolutions(sessionId: string | undefined) {
  const [items, setItems] = useState<SessionResolutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('session_resolution_items')
      .select('*')
      .eq('session_id', sessionId)
      .neq('status', 'archived')
      .order('rank_order', { ascending: true, nullsFirst: false })
      .order('support_count', { ascending: false })
      .order('created_at', { ascending: true });

    if (err) setError(err.message);
    else setItems((data ?? []) as SessionResolutionItem[]);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  async function createItem(payload: {
    title: string;
    description?: string;
    owner_org?: string;
    target_days?: number;
    proposed_by_label?: string;
  }) {
    if (!sessionId) return;
    const { data, error: err } = await supabase
      .from('session_resolution_items')
      .insert({
        session_id: sessionId,
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        owner_org: payload.owner_org?.trim() || null,
        target_days: payload.target_days ?? null,
        proposed_by_label: payload.proposed_by_label ?? 'Facilitator',
      })
      .select()
      .single();
    if (err) throw err;
    const row = data as SessionResolutionItem;
    setItems((prev) => [...prev, row].sort(sortItems));
    return row;
  }

  async function createMany(
    proposals: Array<{
      title: string;
      description?: string;
      owner_org?: string;
      target_days?: number;
    }>,
  ) {
    if (!sessionId || proposals.length === 0) return;
    const rows = proposals.map((p) => ({
      session_id: sessionId,
      title: p.title.trim(),
      description: p.description?.trim() || null,
      owner_org: p.owner_org?.trim() || null,
      target_days: p.target_days ?? null,
      proposed_by_label: 'Template',
    }));
    const { data, error: err } = await supabase
      .from('session_resolution_items')
      .insert(rows)
      .select();
    if (err) throw err;
    await fetchItems();
    return (data ?? []) as SessionResolutionItem[];
  }

  async function shortlistItem(itemId: string, rankOrder: number) {
    const { data, error: err } = await supabase
      .from('session_resolution_items')
      .update({
        status: 'shortlisted',
        rank_order: rankOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();
    if (err) throw err;
    const row = data as SessionResolutionItem;
    setItems((prev) => prev.map((i) => (i.id === itemId ? row : i)).sort(sortItems));
    return row;
  }

  async function removeFromShortlist(itemId: string) {
    const { data, error: err } = await supabase
      .from('session_resolution_items')
      .update({
        status: 'proposed',
        rank_order: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();
    if (err) throw err;
    const row = data as SessionResolutionItem;
    setItems((prev) => prev.map((i) => (i.id === itemId ? row : i)).sort(sortItems));
    return row;
  }

  async function archiveItem(itemId: string) {
    const { error: err } = await supabase
      .from('session_resolution_items')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', itemId);
    if (err) throw err;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    createItem,
    createMany,
    shortlistItem,
    removeFromShortlist,
    archiveItem,
  };
}

function sortItems(a: SessionResolutionItem, b: SessionResolutionItem): number {
  const aRank = a.rank_order ?? 999;
  const bRank = b.rank_order ?? 999;
  if (aRank !== bRank) return aRank - bRank;
  if (a.support_count !== b.support_count) return b.support_count - a.support_count;
  return a.created_at.localeCompare(b.created_at);
}
