import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

type SessionReportMode = 'room' | 'participant';

type PeerOption = {
  user_id: string;
  callsign: string;
  role_archetype: string | null;
};

const REASON_OPTIONS: Record<SessionReportMode, string[]> = {
  room: ['Safety concern', 'Escalation risk', 'Harassment or intimidation', 'Other'],
  participant: [
    'Harassment or intimidation',
    'Doxxing or identity pressure',
    'Threat or coercion',
    'Other',
  ],
};

export function SessionReportDialog({
  open,
  mode,
  squadId,
  peers,
  onClose,
}: {
  open: boolean;
  mode: SessionReportMode;
  squadId: string;
  peers: PeerOption[];
  onClose: () => void;
}) {
  const { supabase, session } = useAuth();
  const participantOptions = useMemo(
    () => peers.filter((peer) => peer.user_id !== session?.user?.id),
    [peers, session?.user?.id],
  );
  const [targetUserId, setTargetUserId] = useState<string | null>(
    participantOptions[0]?.user_id ?? null,
  );
  const [reason, setReason] = useState(REASON_OPTIONS[mode][0]);
  const [evidence, setEvidence] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [alsoMute, setAlsoMute] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTargetUserId(participantOptions[0]?.user_id ?? null);
    setReason(REASON_OPTIONS[mode][0]);
    setEvidence('');
    setAlsoBlock(false);
    setAlsoMute(false);
  }, [mode, open, participantOptions]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!supabase || !session?.user?.id)
        throw new Error('Sign in again before sending a report.');
      if (mode === 'participant' && !targetUserId) {
        throw new Error('Choose the participant you want to report.');
      }

      const { error: reportError } = await supabase.from('session_reports').insert({
        squad_id: squadId,
        report_type: mode,
        target_user_id: mode === 'participant' ? targetUserId : null,
        reason,
        evidence: evidence.trim() || null,
      });
      if (reportError) throw new Error(reportError.message);

      if (mode === 'participant' && targetUserId) {
        const controlRows = [] as Array<{
          owner_user_id: string;
          target_user_id: string;
          control_type: 'block' | 'mute';
          reason: string;
          active: boolean;
        }>;
        if (alsoBlock) {
          controlRows.push({
            owner_user_id: session.user.id,
            target_user_id: targetUserId,
            control_type: 'block',
            reason,
            active: true,
          });
        }
        if (alsoMute) {
          controlRows.push({
            owner_user_id: session.user.id,
            target_user_id: targetUserId,
            control_type: 'mute',
            reason,
            active: true,
          });
        }
        if (controlRows.length > 0) {
          const { error: controlError } = await supabase
            .from('participant_safety_controls')
            .upsert(controlRows, { onConflict: 'owner_user_id,target_user_id,control_type' });
          if (controlError) throw new Error(controlError.message);
        }
      }
    },
    onSuccess: () => {
      toast.success(mode === 'room' ? 'Room report submitted.' : 'Participant report submitted.');
      onClose();
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/80 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b111a] p-5 shadow-2xl">
        <h2 className="font-heading text-lg font-semibold text-slate-100">
          {mode === 'room' ? 'Report this room' : 'Report a participant'}
        </h2>
        <p className="mt-2 font-sans text-[0.85rem] leading-relaxed text-slate-400">
          Reports create a moderation case with assignment and resolution tracking. Share facts that
          help a facilitator follow up without posting sensitive personal data.
        </p>

        {mode === 'participant' ? (
          <label className="mt-4 block font-sans text-[0.78rem] text-slate-400">
            Participant
            <select
              value={targetUserId ?? ''}
              onChange={(e) => setTargetUserId(e.target.value || null)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#09101a] px-3 py-2 text-[0.9rem] text-slate-100"
            >
              {participantOptions.map((peer) => (
                <option key={peer.user_id} value={peer.user_id}>
                  {peer.callsign || peer.user_id}{' '}
                  {peer.role_archetype ? `· ${peer.role_archetype}` : ''}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="mt-4 block font-sans text-[0.78rem] text-slate-400">
          Reason
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#09101a] px-3 py-2 text-[0.9rem] text-slate-100"
          >
            {REASON_OPTIONS[mode].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block font-sans text-[0.78rem] text-slate-400">
          Evidence or context
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#09101a] px-3 py-2 text-[0.9rem] text-slate-100"
            placeholder="What happened, when, and what follow-up would help?"
          />
        </label>

        {mode === 'participant' ? (
          <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 font-sans text-[0.8rem] text-slate-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={alsoBlock}
                onChange={(e) => setAlsoBlock(e.target.checked)}
              />
              Block this participant from your account after filing the report
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={alsoMute}
                onChange={(e) => setAlsoMute(e.target.checked)}
              />
              Mute this participant on your account after filing the report
            </label>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 font-sans text-[0.85rem] text-slate-300 hover:border-white/20"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            className="rounded-lg bg-teal px-4 py-2 font-heading text-[0.85rem] font-semibold text-[#0b0f1a] disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </div>
    </div>
  );
}
