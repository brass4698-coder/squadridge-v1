import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

type SquadSummary = {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  expires_at: string;
  archived_at: string | null;
  member_count: number;
};

type MessageRow = {
  id: string;
  sent_at: string;
  sender_id: string | null;
  status: string;
  encrypted_content: string;
};

function previewCipher(enc: string): string {
  if (enc.length <= 96) return enc;
  return `${enc.slice(0, 96)}…`;
}

export function ModDashboardPage() {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const squadsQuery = useQuery({
    queryKey: ['mod', 'squads', 'recent'],
    queryFn: async (): Promise<SquadSummary[]> => {
      if (!supabase) return [];
      const { data: squads, error: sqErr } = await supabase
        .from('squads')
        .select('id, topic, status, created_at, expires_at, archived_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (sqErr) throw new Error(sqErr.message);
      const rows = squads ?? [];
      if (rows.length === 0) return [];
      const ids = rows.map((r) => r.id);
      const { data: mems, error: mErr } = await supabase
        .from('squad_members')
        .select('squad_id')
        .in('squad_id', ids);
      if (mErr) throw new Error(mErr.message);
      const countBy = new Map<string, number>();
      for (const r of mems ?? []) {
        const sid = r.squad_id as string;
        countBy.set(sid, (countBy.get(sid) ?? 0) + 1);
      }
      return rows.map((r) => ({
        ...r,
        member_count: countBy.get(r.id) ?? 0,
      }));
    },
    enabled: !!supabase,
  });

  const messagesQuery = useQuery({
    queryKey: ['mod', 'messages', expandedId],
    queryFn: async (): Promise<MessageRow[]> => {
      if (!supabase || !expandedId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('id, sent_at, sender_id, status, encrypted_content')
        .eq('squad_id', expandedId)
        .order('sent_at', { ascending: false })
        .limit(40);
      if (error) throw new Error(error.message);
      return (data ?? []) as MessageRow[];
    },
    enabled: !!supabase && !!expandedId,
  });

  const sentimentQuery = useQuery({
    queryKey: ['mod', 'sentiment', expandedId],
    queryFn: async () => {
      if (!supabase || !expandedId) return [];
      const { data, error } = await supabase
        .from('sentiment_metrics')
        .select('id, squad_id, tension_level, recorded_at')
        .eq('squad_id', expandedId)
        .order('recorded_at', { ascending: false })
        .limit(30);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!supabase && !!expandedId,
  });

  const auditQuery = useQuery({
    queryKey: ['mod', 'audit', 'recent'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('moderation_audit_log')
        .select('id, action, target_type, target_id, created_at, actor_user_id, metadata')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!supabase,
  });

  const flagMutation = useMutation({
    mutationFn: async ({ messageId, reason }: { messageId: string; reason: string }) => {
      if (!supabase) throw new Error('No client');
      const { error } = await supabase.rpc('moderator_flag_message', {
        p_message_id: messageId,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mod', 'messages', expandedId] });
      await queryClient.invalidateQueries({ queryKey: ['mod', 'audit', 'recent'] });
      toast.success('Message flagged.');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archiveMutation = useMutation({
    mutationFn: async (squadId: string) => {
      if (!supabase) throw new Error('No client');
      const { error } = await supabase.rpc('moderator_archive_squad', {
        p_squad_id: squadId,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mod', 'squads', 'recent'] });
      await queryClient.invalidateQueries({ queryKey: ['mod', 'audit', 'recent'] });
      toast.success('Squad archived.');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const squads = squadsQuery.data ?? [];
  const audits = auditQuery.data ?? [];

  return (
    <section className="mx-auto flex w-full max-w-[960px] flex-col gap-10 pb-16 pt-[72px]" aria-labelledby="mod-title">
      <header>
        <h1 id="mod-title" className="font-heading text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-[#f1f5f9]">
          Moderation
        </h1>
        <p className="mt-2 max-w-[60ch] font-sans text-[0.9rem] leading-relaxed text-[#8892a4]">
          Active squads with member counts, message ciphertext preview (not decrypted), flag message, and archive squad.
          Moderator accounts are provisioned in the database — not self-service.
        </p>
      </header>

      <div className="rounded-[10px] border border-[#1a2236] bg-[#0f1623] p-6">
        <h2 className="font-heading text-[1rem] font-semibold text-[#e2e8f0]">Squads</h2>
        {squadsQuery.isPending ? (
          <p className="mt-4 font-sans text-[0.875rem] text-[#4b5563]">Loading…</p>
        ) : squadsQuery.isError ? (
          <p className="mt-4 font-sans text-[0.875rem] text-amber" role="alert">
            {squadsQuery.error instanceof Error ? squadsQuery.error.message : 'Could not load squads.'}
          </p>
        ) : squads.length === 0 ? (
          <p className="mt-4 font-sans text-[0.875rem] text-[#4b5563]">No squads found.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#1a2236]">
            {squads.map((s) => (
              <li key={s.id} className="py-3 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-sans text-[0.9rem] font-medium text-[#e2e8f0]">{s.topic}</p>
                    <p className="mt-1 font-mono text-[0.7rem] text-[#4b5563]">{s.id}</p>
                    <p className="mt-1 font-sans text-[0.75rem] text-[#8892a4]">
                      Created {new Date(s.created_at).toLocaleString()} · {s.member_count} members ·{' '}
                      <span className="uppercase">{s.status}</span>
                      {s.archived_at ? <span className="text-amber"> · archived</span> : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="font-sans text-[0.75rem] font-medium text-teal underline-offset-4 hover:underline"
                      onClick={() => setExpandedId((id) => (id === s.id ? null : s.id))}
                    >
                      {expandedId === s.id ? 'Hide messages' : 'Messages'}
                    </button>
                    <Link
                      to={`/session/${s.id}`}
                      className="font-sans text-[0.75rem] font-medium text-teal underline-offset-4 hover:underline"
                    >
                      Open session
                    </Link>
                    {!s.archived_at ? (
                      <button
                        type="button"
                        disabled={archiveMutation.isPending}
                        className="rounded-[6px] border border-[#3d4f63] px-2 py-1 font-sans text-[0.75rem] text-[#a8b2c1] hover:border-amber/40 hover:text-[#e2e8f0] disabled:opacity-50"
                        onClick={() => {
                          if (!window.confirm('Archive this squad? Messaging will be disabled.')) return;
                          archiveMutation.mutate(s.id);
                        }}
                      >
                        Archive
                      </button>
                    ) : null}
                  </div>
                </div>

                {expandedId === s.id ? (
                  <div className="mt-4 rounded border border-[#1a2236] bg-[#0a1018] p-3">
                    {sentimentQuery.isPending ? (
                      <p className="mb-3 font-sans text-[0.75rem] text-[#4b5563]">Loading sentiment samples…</p>
                    ) : sentimentQuery.isError ? (
                      <p className="mb-3 font-sans text-[0.75rem] text-amber" role="alert">
                        {sentimentQuery.error instanceof Error
                          ? sentimentQuery.error.message
                          : 'Could not load sentiment metrics.'}
                      </p>
                    ) : (sentimentQuery.data ?? []).length > 0 ? (
                      <div className="mb-4 rounded border border-[#1e2a3d] bg-[#0f1623]/80 p-3">
                        <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-wider text-[#6b7280]">
                          Sentiment samples (optional AI path)
                        </p>
                        <ul className="mt-2 max-h-[120px] space-y-1 overflow-y-auto font-mono text-[0.65rem] text-[#8892a4]">
                          {(sentimentQuery.data ?? []).map((row) => (
                            <li key={row.id}>
                              {new Date(row.recorded_at).toLocaleString()} · tension{' '}
                              {typeof row.tension_level === 'number' ? row.tension_level.toFixed(2) : '—'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="mb-3 font-sans text-[0.72rem] text-[#4b5563]">
                        No sentiment_metrics rows for this squad (expected unless `VITE_ENABLE_AI=true` for clients).
                      </p>
                    )}
                    {messagesQuery.isPending ? (
                      <p className="font-sans text-[0.8rem] text-[#4b5563]">Loading messages…</p>
                    ) : messagesQuery.isError ? (
                      <p className="font-sans text-[0.8rem] text-amber" role="alert">
                        {messagesQuery.error instanceof Error ? messagesQuery.error.message : 'Could not load.'}
                      </p>
                    ) : (messagesQuery.data ?? []).length === 0 ? (
                      <p className="font-sans text-[0.8rem] text-[#4b5563]">No messages.</p>
                    ) : (
                      <ul className="max-h-[320px] space-y-2 overflow-y-auto">
                        {(messagesQuery.data ?? []).map((m) => (
                          <li
                            key={m.id}
                            className="rounded border border-[#141e30] p-2 font-mono text-[0.65rem] text-[#8892a4]"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 font-sans text-[0.7rem] text-[#4b5563]">
                              <span>{new Date(m.sent_at).toLocaleString()}</span>
                              <span>{m.status}</span>
                            </div>
                            <p className="mt-1 break-all text-[#6b7280]">{previewCipher(m.encrypted_content)}</p>
                            {m.status === 'sent' ? (
                              <button
                                type="button"
                                disabled={flagMutation.isPending}
                                className="mt-2 font-sans text-[0.75rem] font-medium text-amber hover:underline disabled:opacity-50"
                                onClick={() => {
                                  const reason = window.prompt('Flag reason (optional):') ?? '';
                                  flagMutation.mutate({ messageId: m.id, reason });
                                }}
                              >
                                Flag message
                              </button>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[10px] border border-[#1a2236] bg-[#0f1623] p-6">
        <h2 className="font-heading text-[1rem] font-semibold text-[#e2e8f0]">Moderation audit log</h2>
        {auditQuery.isPending ? (
          <p className="mt-4 font-sans text-[0.875rem] text-[#4b5563]">Loading…</p>
        ) : auditQuery.isError ? (
          <p className="mt-4 font-sans text-[0.875rem] text-amber" role="alert">
            {auditQuery.error instanceof Error ? auditQuery.error.message : 'Could not load audit log.'}
          </p>
        ) : audits.length === 0 ? (
          <p className="mt-4 font-sans text-[0.875rem] text-[#4b5563]">No audit entries yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#1a2236]">
            {audits.map((row) => (
              <li key={row.id} className="py-3 font-sans text-[0.8rem] text-[#a8b2c1] first:pt-0">
                <span className="text-[#e2e8f0]">{row.action}</span>
                {row.target_type ? <span className="ml-2 text-[#4b5563]">{row.target_type}</span> : null}
                <span className="ml-2 text-[#4b5563]">{new Date(row.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
