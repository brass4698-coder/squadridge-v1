import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, type Database } from '../lib';

export type LedgerProposalListRow = Pick<
  Database['public']['Tables']['ledger_proposals']['Row'],
  'id' | 'slug' | 'title' | 'summary' | 'tags' | 'published_at' | 'ledger_ref'
>;

export type LedgerProposalDetail = Database['public']['Tables']['ledger_proposals']['Row'];

export function useLedgerPublishedList() {
  const { supabase } = useAuth();
  const configured = isSupabaseConfigured();
  return useQuery({
    queryKey: ['ledger', 'published'],
    queryFn: async (): Promise<LedgerProposalListRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('ledger_proposals')
        .select('id, slug, title, summary, tags, published_at, ledger_ref')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as LedgerProposalListRow[];
    },
    enabled: configured && !!supabase,
  });
}

export function useLedgerProposalBySlug(slug: string | undefined) {
  const { supabase } = useAuth();
  const configured = isSupabaseConfigured();
  return useQuery({
    queryKey: ['ledger', 'proposal', slug],
    queryFn: async (): Promise<LedgerProposalDetail | null> => {
      if (!supabase || !slug) return null;
      const { data, error } = await supabase
        .from('ledger_proposals')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as LedgerProposalDetail | null;
    },
    enabled: configured && !!supabase && !!slug && slug.length > 0,
  });
}
