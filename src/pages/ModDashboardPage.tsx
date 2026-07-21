import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Inbox, MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AuditTooltip } from '../components/shared/AuditTooltip';
import { EmptyState } from '../components/shared/EmptyState';
import { SensitiveField } from '../components/shared/SensitiveField';
import { SkeletonCard } from '../components/shared/SkeletonCard';
import { TrustLabel } from '../components/shared/TrustLabel';
import { useAuth } from '../contexts/AuthContext';
import { moderatorDecryptMessageForReview } from '../lib/moderation/modDecrypt';
import { assertEdgeRateLimit } from '../lib/rateLimitEdge';

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
  payload_ciphertext: string;
};

function previewCipher(enc: string): string {
  if (enc.length <= 96) return enc;
  return `${enc.slice(0, 96)}…`;
}

export function ModDashboardPage() {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [squadFilter, setSquadFilter] = useState('');
  const [archiveSquadId, setArchiveSquadId] = useState<string | null>(null);
  const [flagMessageId, setFlagMessageId] = useState<string | null>(null);
  const [flagReasonDraft, setFlagReasonDraft] = useState('');
  const [decryptTarget, setDecryptTarget] = useState<MessageRow | null>(null);
  const [decryptJustification, setDecryptJustification] = useState('');
  const [decryptPlaintext, setDecryptPlaintext] = useState<string | null>(null);

  const squadsQuery = useQuery({
    queryKey: ['mod', 'squads', 'recent'],
    queryFn: async (): Promise<SquadSummary[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('squads')
        .select('id, topic, status, created_at, expires_at, archived_at, squad_members (user_id)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      type Row = {
        id: string;
        topic: string;
        status: string;
        created_at: string;
        expires_at: string;
        archived_at: string | null;
        squad_members: { user_id: string }[] | null;
      };
      const rows = (data ?? []) as unknown as Row[];
      return rows.map((r) => {
        const members = r.squad_members;
        const member_count = Array.isArray(members) ? members.length : 0;
        return {
          id: r.id,
          topic: r.topic,
          status: r.status,
          created_at: r.created_at,
          expires_at: r.expires_at,
          archived_at: r.archived_at,
          member_count,
        };
      });
    },
    enabled: !!supabase,
  });

  const messagesQuery = useQuery({
    queryKey: ['mod', 'messages', expandedId],
    queryFn: async (): Promise<MessageRow[]> => {
      if (!supabase || !expandedId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('id, sent_at, sender_id, status, payload_ciphertext')
        .eq('squad_id', expandedId)
        .order('sent_at', { ascending: false })
        .limit(40);
      if (error) throw new Error(error.message);
      return (data ?? []) as MessageRow[];
    },
    enabled: !!supabase && !!expandedId,
  });

  const squadKeyQuery = useQuery({
    queryKey: ['mod', 'squad-key', expandedId],
    queryFn: async (): Promise<string | null> => {
      if (!supabase || !expandedId) return null;
      const { data, error } = await supabase
        .from('squads')
        .select('message_encryption_key')
        .eq('id', expandedId)
        .maybeSingle();
      if (error) throw error;
      return data?.message_encryption_key ?? null;
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
      await assertEdgeRateLimit(supabase, 'moderator_flag_message');
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
      setFlagMessageId(null);
      setFlagReasonDraft('');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decryptMutation = useMutation({
    mutationFn: async () => {
      if (!supabase || !expandedId || !decryptTarget) throw new Error('Missing context');
      await assertEdgeRateLimit(supabase, 'moderator_decrypt_review');
      const squadKey = squadKeyQuery.data ?? null;
      if (!squadKey) throw new Error('No squad encryption key — cannot decrypt.');
      return moderatorDecryptMessageForReview(supabase, {
        messageId: decryptTarget.id,
        squadId: expandedId,
        payloadCiphertext: decryptTarget.payload_ciphertext,
        squadMessageKeyBase64Url: squadKey,
        justification: decryptJustification.trim(),
      });
    },
    onSuccess: async (data) => {
      setDecryptPlaintext(data.plaintext);
      toast.success('Recorded in moderation audit.');
      await queryClient.invalidateQueries({ queryKey: ['mod', 'audit', 'recent'] });
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
      setArchiveSquadId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const squads = useMemo(() => squadsQuery.data ?? [], [squadsQuery.data]);
  const audits = auditQuery.data ?? [];
  const filteredSquads = useMemo(() => {
    const t = squadFilter.trim().toLowerCase();
    if (!t) return squads;
    return squads.filter(
      (s) =>
        s.topic.toLowerCase().includes(t) ||
        s.id.toLowerCase().includes(t) ||
        s.status.toLowerCase().includes(t),
    );
  }, [squads, squadFilter]);

  return (
    <section
      className="mx-auto flex w-full max-w-[960px] flex-col gap-10 pb-16 pt-[72px]"
      aria-labelledby="mod-title"
    >
      <AlertDialog.Root
        open={archiveSquadId !== null}
        onOpenChange={(o) => !o && setArchiveSquadId(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[min(100%,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-navy-light bg-navy-dark p-6 shadow-xl">
            <AlertDialog.Title className="font-heading text-lg font-semibold text-gray-light">
              Archive squad?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 font-sans text-[0.875rem] leading-relaxed text-slate-400">
              Messaging will be disabled for this squad. This action is recorded in the audit log.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="rounded-lg border border-navy-light px-4 py-2 font-sans text-[0.875rem] text-slate-300 hover:bg-navy-light/30"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  disabled={archiveMutation.isPending}
                  className="rounded-lg bg-amber/90 px-4 py-2 font-sans text-[0.875rem] font-medium text-navy-dark hover:bg-amber disabled:opacity-50"
                  onClick={() => {
                    if (archiveSquadId) archiveMutation.mutate(archiveSquadId);
                  }}
                >
                  {archiveMutation.isPending ? 'Archiving…' : 'Archive'}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {decryptTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => {
            setDecryptTarget(null);
            setDecryptPlaintext(null);
            setDecryptJustification('');
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mod-decrypt-title"
            className="w-full max-w-md rounded-lg border border-navy-light bg-navy-dark p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="mod-decrypt-title"
              className="font-heading text-lg font-semibold text-gray-light"
            >
              Decrypt message for review
            </h2>
            <p className="mt-2 font-sans text-[0.875rem] text-slate-400">
              An audit row is recorded before plaintext is shown. Minimum 8 characters explaining
              why you need to read this message.
            </p>
            {decryptPlaintext !== null ? (
              <div className="mt-4">
                <p className="font-sans text-[0.75rem] font-medium uppercase tracking-wide text-slate-500">
                  Plaintext
                </p>
                <pre className="mt-2 max-h-48 max-w-full overflow-auto whitespace-pre-wrap rounded border border-navy-light bg-[#0a1018] p-3 font-sans text-[0.8rem] text-gray-light">
                  {decryptPlaintext}
                </pre>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="rounded-lg border border-navy-light px-4 py-2 font-sans text-[0.875rem] text-slate-300 hover:bg-navy-light/30"
                    onClick={() => {
                      setDecryptTarget(null);
                      setDecryptPlaintext(null);
                      setDecryptJustification('');
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <label
                  htmlFor="mod-decrypt-justification"
                  className="mt-4 block font-sans text-[0.75rem] text-slate-500"
                >
                  Justification (required)
                </label>
                <textarea
                  id="mod-decrypt-justification"
                  value={decryptJustification}
                  onChange={(e) => setDecryptJustification(e.target.value)}
                  rows={4}
                  className="mt-1 w-full resize-y rounded-lg border border-navy-light bg-[#0a1018] px-3 py-2 font-sans text-[0.875rem] text-gray-light placeholder:text-slate-500 focus:border-teal/40 focus:outline-none"
                  placeholder="e.g. Safety report follow-up · internal ref …"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-navy-light px-4 py-2 font-sans text-[0.875rem] text-slate-300 hover:bg-navy-light/30"
                    onClick={() => {
                      setDecryptTarget(null);
                      setDecryptPlaintext(null);
                      setDecryptJustification('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      decryptMutation.isPending ||
                      !squadKeyQuery.data ||
                      squadKeyQuery.isLoading ||
                      decryptJustification.trim().length < 8
                    }
                    className="rounded-lg bg-teal px-4 py-2 font-sans text-[0.875rem] font-medium text-navy-dark hover:bg-teal-light disabled:opacity-50"
                    onClick={() => decryptMutation.mutate()}
                  >
                    {decryptMutation.isPending ? 'Auditing…' : 'Decrypt (audited)'}
                  </button>
                </div>
                {!squadKeyQuery.data && !squadKeyQuery.isLoading ? (
                  <p className="mt-2 font-sans text-[0.75rem] text-amber" role="alert">
                    No squad encryption key available for this squad.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      {flagMessageId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => {
            setFlagMessageId(null);
            setFlagReasonDraft('');
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mod-flag-title"
            className="w-full max-w-md rounded-lg border border-navy-light bg-navy-dark p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="mod-flag-title" className="font-heading text-lg font-semibold text-gray-light">
              Flag message
            </h2>
            <p id="mod-flag-desc" className="mt-2 font-sans text-[0.875rem] text-slate-400">
              Optional reason (shown in audit metadata).
            </p>
            <label htmlFor="mod-flag-reason" className="sr-only">
              Flag reason
            </label>
            <textarea
              id="mod-flag-reason"
              value={flagReasonDraft}
              onChange={(e) => setFlagReasonDraft(e.target.value)}
              rows={3}
              className="mt-4 w-full resize-y rounded-lg border border-navy-light bg-[#0a1018] px-3 py-2 font-sans text-[0.875rem] text-gray-light placeholder:text-slate-500 focus:border-teal/40 focus:outline-none"
              placeholder="Reason (optional)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-navy-light px-4 py-2 font-sans text-[0.875rem] text-slate-300 hover:bg-navy-light/30"
                onClick={() => {
                  setFlagMessageId(null);
                  setFlagReasonDraft('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={flagMutation.isPending}
                className="rounded-lg bg-amber/90 px-4 py-2 font-sans text-[0.875rem] font-medium text-navy-dark hover:bg-amber disabled:opacity-50"
                onClick={() =>
                  flagMutation.mutate({ messageId: flagMessageId, reason: flagReasonDraft.trim() })
                }
              >
                {flagMutation.isPending ? 'Submitting…' : 'Flag'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <header>
        <h1
          id="mod-title"
          className="font-heading text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-gray-light"
        >
          Moderation
        </h1>
        <div
          role="status"
          className="mt-4 max-w-[72ch] rounded-lg border border-amber/40 bg-amber/10 p-4 font-sans text-[0.82rem] leading-relaxed text-amber"
        >
          <div className="mb-2">
            <TrustLabel variant="moderator" />
          </div>
          <strong className="font-semibold text-amber">Operator visibility:</strong> Squad message
          keys are stored for this product; moderators can read ciphertext and decrypt for review.
          Each decrypt requires a written justification and logs{' '}
          <code className="font-mono text-[0.72rem]">message_plaintext_decrypt_review</code> in the
          audit log. This is not server-blind or Signal-grade encryption.
        </div>
        <p className="mt-2 max-w-[60ch] font-sans text-[0.9rem] leading-relaxed text-slate-400">
          Active squads with member counts, message ciphertext preview (not decrypted), flag
          message, and archive squad. Moderator accounts are provisioned in the database — not
          self-service. Retention and deletion policies are operator-defined — see{' '}
          <code className="font-mono text-[0.75rem] text-slate-500">
            docs/operations/data-retention-operators.md
          </code>
          .
        </p>
      </header>

      <div className="rounded-[10px] border border-navy-light bg-[#0f1623] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-[1rem] font-semibold text-gray-light">Squads</h2>
          <label className="flex max-w-md flex-1 flex-col gap-1 font-sans text-[0.75rem] text-slate-500 sm:min-w-[12rem]">
            <span className="sr-only">Filter squads</span>
            <input
              type="search"
              value={squadFilter}
              onChange={(e) => setSquadFilter(e.target.value)}
              placeholder="Filter by topic, id, or status…"
              className="min-h-[40px] rounded-lg border border-navy-light bg-[#0a1018] px-3 py-2 text-[0.875rem] text-gray-light placeholder:text-slate-500 focus:border-teal/40 focus:outline-none"
            />
          </label>
        </div>
        {squadsQuery.isPending ? (
          <div className="mt-4 space-y-3">
            <SkeletonCard minHeight="5rem" lines={2} />
            <SkeletonCard minHeight="5rem" lines={2} />
          </div>
        ) : squadsQuery.isError ? (
          <p className="mt-4 font-sans text-[0.875rem] text-amber" role="alert">
            {squadsQuery.error instanceof Error
              ? squadsQuery.error.message
              : 'Could not load squads.'}
          </p>
        ) : squads.length === 0 ? (
          <EmptyState
            icon={Inbox}
            heading="No squads yet"
            body="When sessions are created, they will appear here for review."
            className="mt-2 py-10"
          />
        ) : filteredSquads.length === 0 ? (
          <p className="mt-4 font-sans text-[0.875rem] text-slate-500">
            No squads match your filter.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-light">
            {filteredSquads.map((s) => (
              <li key={s.id} className="py-3 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-sans text-[0.9rem] font-medium text-gray-light">{s.topic}</p>
                    <div className="mt-1">
                      <SensitiveField
                        value={s.id}
                        className="font-mono text-[0.7rem] text-slate-500"
                      />
                    </div>
                    <p className="mt-1 font-sans text-[0.75rem] text-slate-400">
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
                      <AuditTooltip>
                        <button
                          type="button"
                          disabled={archiveMutation.isPending}
                          className="rounded-[6px] border border-slate-600 px-2 py-1 font-sans text-[0.75rem] text-slate-300 hover:border-amber/40 hover:text-gray-light disabled:opacity-50"
                          onClick={() => setArchiveSquadId(s.id)}
                        >
                          Archive
                        </button>
                      </AuditTooltip>
                    ) : null}
                  </div>
                </div>

                {expandedId === s.id ? (
                  <div className="mt-4 rounded border border-navy-light bg-[#0a1018] p-3">
                    {sentimentQuery.isPending ? (
                      <p className="mb-3 font-sans text-[0.75rem] text-slate-500">
                        Loading sentiment samples…
                      </p>
                    ) : sentimentQuery.isError ? (
                      <p className="mb-3 font-sans text-[0.75rem] text-amber" role="alert">
                        {sentimentQuery.error instanceof Error
                          ? sentimentQuery.error.message
                          : 'Could not load sentiment metrics.'}
                      </p>
                    ) : (sentimentQuery.data ?? []).length > 0 ? (
                      <div className="mb-4 rounded border border-navy-light bg-[#0f1623]/80 p-3">
                        <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
                          Sentiment samples (optional AI path)
                        </p>
                        <ul className="mt-2 max-h-[120px] space-y-1 overflow-y-auto font-mono text-[0.65rem] text-slate-400">
                          {(sentimentQuery.data ?? []).map((row) => (
                            <li key={row.id}>
                              {new Date(row.recorded_at).toLocaleString()} · tension{' '}
                              {typeof row.tension_level === 'number'
                                ? row.tension_level.toFixed(2)
                                : '—'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="mb-3 font-sans text-[0.72rem] text-slate-500">
                        No sentiment_metrics rows for this squad (expected unless
                        `VITE_ENABLE_AI=true` for clients).
                      </p>
                    )}
                    {messagesQuery.isPending ? (
                      <SkeletonCard
                        minHeight="8rem"
                        lines={3}
                        className="border-navy-light bg-[#0f1623]"
                      />
                    ) : messagesQuery.isError ? (
                      <p className="font-sans text-[0.8rem] text-amber" role="alert">
                        {messagesQuery.error instanceof Error
                          ? messagesQuery.error.message
                          : 'Could not load.'}
                      </p>
                    ) : (messagesQuery.data ?? []).length === 0 ? (
                      <EmptyState
                        icon={MessageSquare}
                        heading="No messages in this squad"
                        body="The message queue is empty."
                        className="py-8"
                      />
                    ) : (
                      <ul className="max-h-[320px] space-y-2 overflow-y-auto">
                        {(messagesQuery.data ?? []).map((m) => (
                          <li
                            key={m.id}
                            className="rounded border border-navy-light p-2 font-mono text-[0.65rem] text-slate-400"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 font-sans text-[0.7rem] text-slate-500">
                              <span>{new Date(m.sent_at).toLocaleString()}</span>
                              <span>{m.status}</span>
                            </div>
                            <p className="mt-1 break-all text-slate-500">
                              {previewCipher(m.payload_ciphertext)}
                            </p>
                            <div className="mt-1">
                              <TrustLabel variant="moderator" />
                            </div>
                            {m.status === 'sent' ? (
                              <div className="mt-2 flex flex-wrap gap-3">
                                <AuditTooltip>
                                  <button
                                    type="button"
                                    disabled={flagMutation.isPending}
                                    className="font-sans text-[0.75rem] font-medium text-amber hover:underline disabled:opacity-50"
                                    onClick={() => {
                                      setFlagMessageId(m.id);
                                      setFlagReasonDraft('');
                                    }}
                                  >
                                    Flag message
                                  </button>
                                </AuditTooltip>
                                <AuditTooltip>
                                  <button
                                    type="button"
                                    disabled={decryptMutation.isPending}
                                    className="font-sans text-[0.75rem] font-medium text-teal hover:underline disabled:opacity-50"
                                    onClick={() => {
                                      setDecryptTarget(m);
                                      setDecryptJustification('');
                                      setDecryptPlaintext(null);
                                    }}
                                  >
                                    Decrypt for review
                                  </button>
                                </AuditTooltip>
                              </div>
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

      <div className="rounded-[10px] border border-navy-light bg-[#0f1623] p-6">
        <h2 className="font-heading text-[1rem] font-semibold text-gray-light">
          Moderation audit log
        </h2>
        {auditQuery.isPending ? (
          <div className="mt-4">
            <SkeletonCard minHeight="8rem" lines={4} />
          </div>
        ) : auditQuery.isError ? (
          <p className="mt-4 font-sans text-[0.875rem] text-amber" role="alert">
            {auditQuery.error instanceof Error
              ? auditQuery.error.message
              : 'Could not load audit log.'}
          </p>
        ) : audits.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            heading="No audit entries yet"
            body="Flag, archive, and decrypt-review actions will appear here."
            className="mt-2 py-10"
          />
        ) : (
          <ul className="mt-4 divide-y divide-navy-light">
            {audits.map((row) => (
              <li key={row.id} className="py-3 font-sans text-[0.8rem] text-slate-300 first:pt-0">
                <span className="text-gray-light">{row.action}</span>
                {row.target_type ? (
                  <span className="ml-2 text-slate-500">{row.target_type}</span>
                ) : null}
                <span className="ml-2 text-slate-500">
                  {new Date(row.created_at).toLocaleString()}
                </span>
                {row.target_id ? (
                  <div className="mt-1">
                    <SensitiveField
                      value={String(row.target_id)}
                      className="font-mono text-[0.7rem] text-slate-500"
                    />
                  </div>
                ) : null}
                {row.metadata &&
                typeof row.metadata === 'object' &&
                Object.keys(row.metadata).length > 0 ? (
                  <pre className="mt-2 max-h-24 overflow-auto rounded border border-navy-light bg-[#0a1018] p-2 font-mono text-[0.65rem] text-slate-500">
                    {JSON.stringify(row.metadata, null, 0)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
