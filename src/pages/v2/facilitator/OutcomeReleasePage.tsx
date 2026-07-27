import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { ReleaseReadinessChecklist } from '../../../components/facilitator/ReleaseReadinessChecklist';
import { ReviewLinkIssuance } from '../../../components/facilitator/ReviewLinkIssuance';
import { useOutcomeRecord } from '../../../hooks/useOutcomeRecord';
import { useParticipants } from '../../../hooks/useParticipants';
import { useSession } from '../../../hooks/useSessions';
import {
  allApprovalsComplete,
  countApprovalsByStatus,
  formatApprovalCount,
} from '../../../lib/approvalCounts';
import { appRoutes } from '../../../lib/appRoutes';
import { ApprovalCount } from '../../../components/motion';
import {
  approvalWorkflowLabel,
  describeReleaseBlock,
  shortContentSha,
  staleApprovalNotice,
} from '../../../lib/releaseIntegrity';

export function OutcomeReleasePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { participants, loading: participantsLoading } = useParticipants(sessionId);
  const {
    outcome,
    approvals,
    readiness,
    loading,
    setApprovalStatus,
    attestAuthorship,
    publishToLedger,
  } = useOutcomeRecord(sessionId);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attesting, setAttesting] = useState(false);

  const counts = countApprovalsByStatus(approvals);
  const allApproved = allApprovalsComplete(approvals);
  const outcomePublic = session?.outcome_public === true;
  const instrumentPreview = [outcome?.summary, outcome?.agreed_terms, outcome?.pending_items]
    .filter(Boolean)
    .join('\n\n');
  const attested = readiness?.authorshipAttested === true;
  const blockingCopy = describeReleaseBlock(readiness?.blockingReason);
  const staleNotice = staleApprovalNotice(readiness);
  const releaseBlocked = readiness ? !readiness.canRelease : !allApproved || counts.rejected > 0;
  const facilitatorApprovals = approvals.filter(
    (a) => a.approval_source !== 'participant' && !a.participant_id,
  );
  const waitingOnParticipantReview = approvals.some(
    (a) => (a.approval_source === 'participant' || a.participant_id) && a.status === 'pending',
  );

  async function handleAttest() {
    setError(null);
    setAttesting(true);
    try {
      await attestAuthorship();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record the attestation');
    }
    setAttesting(false);
  }

  async function handlePublish() {
    setError(null);
    try {
      await publishToLedger();
      setPublished(true);
      setShowPublishModal(false);
      setTimeout(() => {
        if (outcomePublic) {
          navigate('/ledger');
        } else if (sessionId) {
          navigate(appRoutes.session(sessionId));
        }
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Release failed');
      setShowPublishModal(false);
    }
  }

  if (loading || sessionLoading) return <RouteSkeleton label="Loading approvals" />;

  if (!sessionId) {
    return (
      <EmptyState
        heading="Session not found"
        body="Open release from a session detail page."
        action={
          <Link to={appRoutes.sessions} className="text-sm font-medium text-brand underline">
            Back to sessions
          </Link>
        }
      />
    );
  }

  if (!outcome) {
    return (
      <div className="sr-mode-gate mx-auto max-w-xl rounded-lg border border-[color:var(--sr-mode-gate-border)] p-6 md:p-8">
        <EmptyState
          heading="No outcome draft yet"
          body="Draft and submit the decision memo before collecting approvals and releasing."
          action={
            <Link
              to={appRoutes.sessionOutcome(sessionId)}
              className="btn-pill btn-pill--primary text-sm"
            >
              Open outcome workspace
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div
        className="sr-mode-gate mx-auto max-w-xl rounded-lg border border-[color:var(--sr-mode-gate-border)] p-6 md:p-8"
        data-demo="session-release"
      >
        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
            Release gate · Session {sessionId.slice(0, 8)}
          </p>
          <h1 className="text-xl font-semibold text-ink">Approve &amp; release</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            {outcomePublic
              ? 'All parties must approve via their review links before the outcome is published to the public ledger. Room dialogue is never published.'
              : 'All parties must approve via their review links before the outcome is released as a private anchored record. It will not appear on the public ledger. Room dialogue stays in the room.'}
          </p>
          <p className="mt-2 text-xs text-ink-secondary">
            Copy each participant&apos;s review link below and share it manually. Automated email is
            not wired. You may only mark the Facilitator row from this console.
          </p>
          <p className="mt-2 font-mono text-xs text-ink-faint">
            {outcomePublic ? 'Visibility: public ledger' : 'Visibility: private anchored record'}
          </p>
        </div>

        <ReleaseReadinessChecklist readiness={readiness} />

        {instrumentPreview ? (
          <section className="sr-evidence-frame mb-8 p-5" aria-labelledby="instrument-preview-h">
            <h2
              id="instrument-preview-h"
              className="mb-3 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint"
            >
              Instrument preview
            </h2>
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink">
              {instrumentPreview}
            </pre>
          </section>
        ) : null}

        <section className="sr-evidence-frame mb-8 p-5" aria-labelledby="provenance-h">
          <h2
            id="provenance-h"
            className="mb-3 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint"
          >
            Provenance
          </h2>
          <dl className="m-0 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-secondary">Instrument hash</dt>
              <dd className="mt-1 mb-0 font-mono text-xs text-ink">
                {shortContentSha(readiness?.contentSha)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-secondary">Approvals bound to this text</dt>
              <dd className="mt-1 mb-0 font-mono text-xs text-ink">
                {readiness
                  ? `${readiness.approvalsApproved - readiness.approvalsStale} / ${readiness.approvalsTotal}`
                  : '—'}
              </dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-line pt-4">
            {attested ? (
              <>
                <p className="m-0 text-sm text-ink">
                  <span className="sr-verify">
                    <span className="sr-verify-dot" aria-hidden />
                    Authorship attested
                  </span>{' '}
                  for this exact text.
                </p>
                {readiness?.authorshipStatement ? (
                  <p className="mt-1 mb-0 text-xs leading-relaxed text-ink-secondary">
                    “{readiness.authorshipStatement}”
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="m-0 text-sm text-ink-secondary">
                  Attest that this instrument is your own wording of the outcome — not a verbatim
                  transcript. The attestation is recorded against the hash above and is cleared
                  automatically if you edit the text.
                </p>
                <button
                  type="button"
                  onClick={() => void handleAttest()}
                  disabled={attesting || !outcome}
                  className="btn-pill mt-3 min-h-[44px] w-full border border-line text-sm text-ink disabled:opacity-40"
                >
                  {attesting ? 'Recording…' : 'Record authorship attestation'}
                </button>
              </>
            )}
          </div>

          {staleNotice ? (
            <p className="mt-3 mb-0 text-xs text-sem-danger" role="status">
              {staleNotice}
            </p>
          ) : null}
        </section>

        <div
          className={`mb-6 rounded border-l-4 px-4 py-3 text-sm ${
            allApproved && !waitingOnParticipantReview
              ? 'border-brand bg-brand-soft text-brand'
              : 'border-warning bg-surface-sunken text-ink-secondary'
          }`}
          role="status"
        >
          <p className="flex flex-wrap items-baseline gap-2">
            <ApprovalCount className="text-base font-medium">
              {formatApprovalCount(counts.approved, counts.total)}
            </ApprovalCount>
            <span className="text-xs">
              {waitingOnParticipantReview
                ? 'approved — waiting on participant review'
                : allApproved
                  ? outcomePublic
                    ? 'approved — ready to publish'
                    : 'approved — ready to release privately'
                  : counts.total === 0
                    ? 'No approvers yet'
                    : 'approved'}
            </span>
          </p>
          {counts.rejected > 0 ? (
            <p className="mt-1 text-xs text-sem-danger">
              {counts.rejected} dispute{counts.rejected === 1 ? '' : 's'} recorded — resolve before
              release.
            </p>
          ) : null}
        </div>

        <ReviewLinkIssuance
          approvals={approvals}
          participants={participants}
          participantsLoading={participantsLoading}
        />

        {facilitatorApprovals.length > 0 ? (
          <section className="mb-8" aria-labelledby="facilitator-approval-h">
            <h2
              id="facilitator-approval-h"
              className="mb-3 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint"
            >
              Facilitator console approval
            </h2>
            <ul className="flex flex-col gap-3" aria-label="Facilitator approval status">
              {facilitatorApprovals.map((a) => (
                <li
                  key={a.id}
                  className="flex min-h-[44px] items-center justify-between gap-3 rounded-lg bg-surface-elevated px-5 py-4 shadow-sr-sm"
                >
                  <p className="text-sm font-medium text-ink">{a.approver_label}</p>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <StatusBadge
                      variant={
                        a.status === 'rejected'
                          ? 'denied'
                          : a.status === 'approved'
                            ? 'verified'
                            : 'pending'
                      }
                    >
                      {approvalWorkflowLabel(a.status)}
                    </StatusBadge>
                    {a.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => {
                          void setApprovalStatus(a.id, 'approved').catch((err: unknown) => {
                            setError(err instanceof Error ? err.message : 'Update failed');
                          });
                        }}
                        className="min-h-[44px] px-2 text-xs font-medium text-brand hover:underline"
                      >
                        Mark approved
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {approvals.length === 0 ? (
          <div className="mb-8">
            <EmptyState
              className="py-10"
              heading="No approvers listed"
              body="Return to the outcome workspace and submit the draft to open participant review."
              action={
                <Link
                  to={appRoutes.sessionOutcome(sessionId)}
                  className="text-sm font-medium text-brand underline"
                >
                  Edit outcome draft
                </Link>
              }
            />
          </div>
        ) : null}

        {error ? (
          <p className="mb-4 text-sm text-sem-danger" role="alert">
            {error}
          </p>
        ) : null}

        {!published ? (
          <>
            <button
              type="button"
              disabled={releaseBlocked}
              onClick={() => setShowPublishModal(true)}
              className="btn-pill btn-pill--primary min-h-[44px] w-full text-sm disabled:opacity-40"
            >
              {outcomePublic ? 'Publish to ledger' : 'Release private record'}
            </button>
            {blockingCopy ? (
              <p className="mt-3 text-center text-xs leading-relaxed text-ink-secondary">
                {blockingCopy}
              </p>
            ) : null}
          </>
        ) : (
          <p className="rounded bg-brand-soft py-3 text-center text-sm font-medium text-brand">
            {outcomePublic
              ? 'Published — redirecting to ledger…'
              : 'Released — returning to session…'}
          </p>
        )}

        <p className="mt-4 text-center font-mono text-[length:var(--text-label)] leading-relaxed text-ink-faint">
          Release is irreversible for this instrument. The verification anchor is a SHA-256 hash of
          this text — it proves the record is unaltered, not when it was written. Participant
          identities are not disclosed on the record; room content remains operator-readable under
          your MOU.
        </p>
      </div>

      {showPublishModal ? (
        <ConfirmModal
          title={
            outcomePublic ? 'Publish outcome permanently?' : 'Release private outcome permanently?'
          }
          body={
            outcomePublic
              ? 'This writes the approved instrument to the public ledger with a verification anchor. The action cannot be undone from this screen. Participant identities are not disclosed. Room dialogue is not published.'
              : 'This releases the approved instrument as a private anchored record for partner and funder sharing. It will not appear on the public ledger. The action cannot be undone from this screen. Participant identities are not disclosed.'
          }
          confirmLabel={outcomePublic ? 'Publish permanently' : 'Release permanently'}
          cancelLabel="Review again"
          dangerous
          onConfirm={() => void handlePublish()}
          onCancel={() => setShowPublishModal(false)}
        />
      ) : null}
    </>
  );
}
