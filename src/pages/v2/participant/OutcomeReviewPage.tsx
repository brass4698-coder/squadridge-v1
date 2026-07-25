import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { FormPanel } from '../../../components/ui/FormPanel';
import { Textarea } from '../../../components/ui/Textarea';
import { TokenShell } from '../../../components/layout/TokenShell';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { participantRoute } from '../../../lib/participantRoutes';
import {
  participantGetOutcomeReview,
  participantReviewOutcome,
  type ParticipantOutcomeReview,
} from '../../../lib/outcomeReview';

/**
 * Token-gated draft outcome review — approve or dispute before release.
 * Room dialogue is never shown here; only facilitator-authored instrument fields.
 */
export function OutcomeReviewPage() {
  const token = useParticipantToken();
  const [review, setReview] = useState<ParticipantOutcomeReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [disputeNote, setDisputeNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    void (async () => {
      const data = await participantGetOutcomeReview(token);
      if (!cancelled) {
        setReview(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function decide(decision: 'approved' | 'rejected') {
    if (!token) return;
    setError(null);
    if (decision === 'rejected' && disputeNote.trim().length < 8) {
      setError('Add a short note explaining what must change before release.');
      setShowDispute(true);
      return;
    }
    setBusy(true);
    const next = await participantReviewOutcome(
      token,
      decision,
      decision === 'rejected' ? disputeNote : undefined,
    );
    setBusy(false);
    if (!next.valid) {
      setError(
        next.error === 'DISPUTE_NOTE_REQUIRED'
          ? 'Add a short dispute note (at least a sentence).'
          : next.error === 'ALREADY_DECIDED'
            ? 'You already recorded a decision on this draft.'
            : next.error === 'REVIEW_NOT_OPEN'
              ? 'Review is not open yet. Wait for the facilitator to submit the draft.'
              : (next.error ?? 'Could not record your decision.'),
      );
      return;
    }
    setReview(next);
  }

  if (!token) return null;

  if (loading) {
    return (
      <TokenShell>
        <div className="flex flex-1 items-center justify-center px-6 py-16" role="status">
          <p className="text-sm text-ink-secondary">Loading outcome review…</p>
        </div>
      </TokenShell>
    );
  }

  if (!review?.valid) {
    return (
      <TokenShell>
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <FormPanel
            className="w-full max-w-md text-center"
            eyebrow="Outcome review"
            title="Invitation not valid"
            titleAs="h1"
            description="This review link is invalid or expired."
          >
            <Link to="/p/invalid" className="text-sm font-medium text-brand underline">
              Learn more
            </Link>
          </FormPanel>
        </div>
      </TokenShell>
    );
  }

  if (!review.available) {
    return (
      <TokenShell>
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <FormPanel
            className="w-full max-w-md"
            eyebrow="Outcome review"
            title="Review not open yet"
            titleAs="h1"
            description={
              review.message ??
              'The facilitator has not opened draft outcome review. You will use this same link when it is ready.'
            }
            footer="Room dialogue stays private. Only an approved instrument may leave the room."
          >
            <Link
              to={participantRoute('done', token)}
              className="btn-institutional btn-institutional--ghost inline-flex items-center justify-center no-underline"
            >
              Back to session end
            </Link>
          </FormPanel>
        </div>
      </TokenShell>
    );
  }

  const decided = review.approval_status === 'approved' || review.approval_status === 'rejected';

  return (
    <TokenShell>
      <div className="sr-form-atmosphere flex flex-1 flex-col items-center px-6 py-12">
        <FormPanel
          className="w-full max-w-lg"
          eyebrow="Release gate · participant review"
          title="Verify the draft outcome"
          titleAs="h1"
          description={
            review.outcome_public
              ? 'Approve only if this text may appear on the public ledger. Room dialogue is never published.'
              : 'Approve only if this private anchored record is accurate. Room dialogue stays in the room.'
          }
        >
          <p className="mb-4 text-sm font-medium text-ink">{review.session_title}</p>

          <section className="mb-6 rounded-[var(--sr-radius-lg)] bg-surface-elevated p-5 shadow-sr-card">
            <h2 className="mb-2 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              Summary
            </h2>
            <p className="whitespace-pre-wrap text-sm text-ink">{review.summary}</p>
            {review.agreed_terms ? (
              <>
                <h2 className="mb-2 mt-5 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
                  Agreed terms
                </h2>
                <p className="whitespace-pre-wrap text-sm text-ink">{review.agreed_terms}</p>
              </>
            ) : null}
            {review.pending_items ? (
              <>
                <h2 className="mb-2 mt-5 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
                  Pending items
                </h2>
                <p className="whitespace-pre-wrap text-sm text-ink">{review.pending_items}</p>
              </>
            ) : null}
          </section>

          <p className="mb-6 text-xs leading-relaxed text-ink-secondary">
            Your decision is recorded against this exact wording. If the facilitator changes it,
            every approval resets and you will be asked again.
          </p>

          {decided ? (
            <div
              className={`mb-6 rounded border-l-4 px-4 py-3 text-sm ${
                review.approval_status === 'approved'
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-sem-danger bg-sem-danger-soft text-sem-danger'
              }`}
              role="status"
            >
              {review.approval_status === 'approved'
                ? 'You approved this draft. The facilitator cannot release until all parties approve.'
                : 'You disputed this draft. The facilitator must revise before release.'}
              {review.dispute_note ? (
                <p className="mt-2 text-ink-secondary">Your note: {review.dispute_note}</p>
              ) : null}
            </div>
          ) : review.can_decide ? (
            <>
              {showDispute ? (
                <FormField
                  id="dispute-note"
                  label="What must change?"
                  hint="Visible to the facilitator only — not published."
                  instrument
                >
                  <Textarea
                    id="dispute-note"
                    rows={3}
                    value={disputeNote}
                    onChange={(e) => setDisputeNote(e.target.value)}
                    placeholder="e.g. The timeline in term 2 does not match what we agreed in the room."
                  />
                </FormField>
              ) : null}

              {error ? (
                <p className="mb-4 text-sm text-sem-danger" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1"
                  size="lg"
                  loading={busy}
                  onClick={() => void decide('approved')}
                >
                  Approve for release
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  variant="secondary"
                  loading={busy}
                  onClick={() => {
                    if (!showDispute) {
                      setShowDispute(true);
                      return;
                    }
                    void decide('rejected');
                  }}
                >
                  {showDispute ? 'Submit dispute' : 'Dispute draft'}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-secondary">This review window is closed.</p>
          )}
        </FormPanel>
      </div>
    </TokenShell>
  );
}
