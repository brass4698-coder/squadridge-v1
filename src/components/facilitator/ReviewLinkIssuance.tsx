import { useCallback, useState } from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { buildParticipantReviewUrl } from '../../lib/participantRoutes';
import { approvalWorkflowLabel } from '../../lib/releaseIntegrity';
import { describeSendSessionInviteResult, sendSessionInvite } from '../../lib/sendSessionInvite';
import { supabase } from '../../lib/supabase';
import type { OutcomeApproval, Participant } from '../../lib/supabaseTypes';

interface ReviewLinkIssuanceProps {
  approvals: OutcomeApproval[];
  participants: Participant[];
  participantsLoading?: boolean;
}

function CopyReviewLinkButton({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [url]);

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      aria-label={copied ? `Copied review link for ${label}` : `Copy review link for ${label}`}
      className="min-h-[44px] rounded border border-line px-3 py-2 text-xs font-medium text-brand transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40"
    >
      {copied ? 'Copied' : 'Copy review link'}
    </button>
  );
}

function EmailReviewLinkForm({ participantId, label }: { participantId: string; label: string }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onSend = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('Enter an email address to attempt delivery.');
      return;
    }
    setBusy(true);
    setStatus(null);
    const result = await sendSessionInvite(supabase, {
      participantId,
      toEmail: trimmed,
      linkKind: 'review',
    });
    setBusy(false);
    setStatus(describeSendSessionInviteResult(result));
  }, [email, participantId]);

  return (
    <div className="mt-3 w-full border-t border-line pt-3">
      <label className="block text-xs text-ink-secondary" htmlFor={`review-email-${participantId}`}>
        Optional email (not stored)
      </label>
      <div className="mt-1 flex flex-wrap gap-2">
        <input
          id={`review-email-${participantId}`}
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="participant@org.example"
          disabled={busy}
          className="min-h-[44px] min-w-[12rem] flex-1 rounded border border-line bg-surface-sunken px-3 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSend()}
          aria-label={`Email review link for ${label}`}
          className="min-h-[44px] rounded border border-line px-3 py-2 text-xs font-medium text-ink transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40"
        >
          {busy ? 'Sending…' : 'Email link'}
        </button>
      </div>
      {status ? (
        <p className="mt-2 text-xs leading-relaxed text-ink-secondary" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Review-link sharing for the release console.
 * Primary path: copy `/p/review/:token`. Optional email via `send-session-invite`
 * Edge Function — falls back to manual copy when Resend is not configured.
 * Does not allow facilitator proxy-approval of participant rows.
 */
export function ReviewLinkIssuance({
  approvals,
  participants,
  participantsLoading = false,
}: ReviewLinkIssuanceProps) {
  const byId = new Map(participants.map((p) => [p.id, p]));
  const participantApprovals = approvals.filter(
    (a) => a.approval_source === 'participant' || a.participant_id,
  );
  const pendingCount = participantApprovals.filter((a) => a.status === 'pending').length;
  const disputedCount = participantApprovals.filter((a) => a.status === 'rejected').length;

  if (participantsLoading) {
    return (
      <section className="mb-8" aria-labelledby="review-links-h" aria-busy="true">
        <h2
          id="review-links-h"
          className="mb-3 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint"
        >
          Participant review links
        </h2>
        <p className="text-sm text-ink-secondary" role="status">
          Loading participants…
        </p>
      </section>
    );
  }

  return (
    <section className="mb-8" aria-labelledby="review-links-h">
      <h2
        id="review-links-h"
        className="mb-1 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint"
      >
        Participant review links
      </h2>
      <p className="mb-3 text-xs leading-relaxed text-ink-secondary">
        Share each link by copy, or attempt email when Resend is configured on Edge. Without a
        provider key the function returns the URL for manual send. Participants must approve or
        dispute themselves — this console cannot proxy-approve their rows.
      </p>

      {pendingCount > 0 ? (
        <div
          className="mb-4 rounded border-l-4 border-warning bg-surface-sunken px-4 py-3 text-sm text-ink-secondary"
          role="status"
        >
          Waiting on review — {pendingCount} participant
          {pendingCount === 1 ? '' : 's'} still pending. Release stays blocked until every party
          decides on this exact text.
        </div>
      ) : null}

      {disputedCount > 0 ? (
        <div
          className="mb-4 rounded border-l-4 border-sem-danger bg-surface-sunken px-4 py-3 text-sm text-sem-danger"
          role="status"
        >
          {disputedCount} dispute{disputedCount === 1 ? '' : 's'} recorded. Resolve disputes before
          release.
        </div>
      ) : null}

      {participantApprovals.length === 0 ? (
        <EmptyState
          className="py-8"
          heading="No participant review rows yet"
          body="Submit the draft from the outcome workspace to open self-review for verified participants."
        />
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Participant review status">
          {participantApprovals.map((a) => {
            const participant = a.participant_id ? byId.get(a.participant_id) : undefined;
            const token = participant?.invite_token;
            const reviewUrl = token ? buildParticipantReviewUrl(token) : null;
            const statusLabel = approvalWorkflowLabel(a.status);
            const badgeVariant =
              a.status === 'rejected' ? 'denied' : a.status === 'approved' ? 'verified' : 'pending';

            return (
              <li
                key={a.id}
                className="flex flex-col gap-3 rounded-lg bg-surface-elevated px-5 py-4 shadow-sr-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{a.approver_label}</p>
                    {reviewUrl ? (
                      <p
                        className="mt-1 truncate font-mono text-[11px] text-ink-faint"
                        title={reviewUrl}
                      >
                        {reviewUrl}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-ink-faint">
                        Invite token unavailable — re-open invites for this participant.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge variant={badgeVariant}>{statusLabel}</StatusBadge>
                    {reviewUrl ? (
                      <CopyReviewLinkButton url={reviewUrl} label={a.approver_label} />
                    ) : null}
                  </div>
                </div>
                {participant?.id && reviewUrl ? (
                  <EmailReviewLinkForm participantId={participant.id} label={a.approver_label} />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
