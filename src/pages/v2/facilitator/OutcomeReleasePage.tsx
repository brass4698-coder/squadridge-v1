import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { useOutcomeRecord } from '../../../hooks/useOutcomeRecord';
import { useSession } from '../../../hooks/useSessions';
import {
  allApprovalsComplete,
  countApprovalsByStatus,
  formatApprovalCount,
} from '../../../lib/approvalCounts';
import { appRoutes } from '../../../lib/appRoutes';

export function OutcomeReleasePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { outcome, approvals, loading, setApprovalStatus, publishToLedger } =
    useOutcomeRecord(sessionId);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = countApprovalsByStatus(approvals);
  const allApproved = allApprovalsComplete(approvals);
  const outcomePublic = session?.outcome_public === true;
  const instrumentPreview = [outcome?.summary, outcome?.agreed_terms, outcome?.pending_items]
    .filter(Boolean)
    .join('\n\n');

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
      <AuthenticatedShell>
        <EmptyState
          heading="Session not found"
          body="Open release from a session detail page."
          action={
            <Link to={appRoutes.sessions} className="text-sm font-medium text-brand underline">
              Back to sessions
            </Link>
          }
        />
      </AuthenticatedShell>
    );
  }

  if (!outcome) {
    return (
      <AuthenticatedShell>
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
      </AuthenticatedShell>
    );
  }

  return (
    <AuthenticatedShell>
      <div className="sr-mode-gate mx-auto max-w-xl rounded-lg border border-[color:var(--sr-mode-gate-border)] p-6 md:p-8">
        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
            Release gate · Session {sessionId.slice(0, 8)}
          </p>
          <h1 className="text-xl font-semibold text-ink">Approve &amp; release</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            {outcomePublic
              ? 'All parties must approve before the outcome is published to the public ledger. Room dialogue is never published.'
              : 'All parties must approve before the outcome is released as a private anchored record for partners and funders. It will not appear on the public ledger. Room dialogue stays in the room.'}
          </p>
          <p className="mt-2 font-mono text-xs text-ink-faint">
            {outcomePublic ? 'Visibility: public ledger' : 'Visibility: private anchored record'}
          </p>
        </div>

        {instrumentPreview ? (
          <section className="sr-evidence-frame mb-8 p-5" aria-labelledby="instrument-preview-h">
            <h2
              id="instrument-preview-h"
              className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint"
            >
              Instrument preview
            </h2>
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink">
              {instrumentPreview}
            </pre>
          </section>
        ) : null}

        <div
          className={`mb-6 rounded border-l-4 px-4 py-3 text-sm ${
            allApproved
              ? 'border-brand bg-brand-soft text-brand'
              : 'border-warning bg-surface-sunken text-ink-secondary'
          }`}
          role="status"
        >
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="sr-approval-count text-base font-medium">
              {formatApprovalCount(counts.approved, counts.total)}
            </span>
            <span className="text-xs">
              {allApproved
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
              {counts.rejected} rejection{counts.rejected === 1 ? '' : 's'} recorded — resolve
              before release.
            </p>
          ) : null}
        </div>

        {approvals.length === 0 ? (
          <div className="mb-8">
            <EmptyState
              className="py-10"
              heading="No approvers listed"
              body="Return to the outcome workspace and add party labels before collecting approvals."
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
        ) : (
          <ul className="mb-8 flex flex-col gap-3" aria-label="Approver status">
            {approvals.map((a) => (
              <li
                key={a.id}
                className="flex min-h-[44px] items-center justify-between gap-3 rounded border border-line bg-surface-elevated px-5 py-4"
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
                    {a.status}
                  </StatusBadge>
                  {a.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => void setApprovalStatus(a.id, 'approved')}
                      className="min-h-[44px] px-2 text-xs font-medium text-brand hover:underline"
                    >
                      Mark approved
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {error ? (
          <p className="mb-4 text-sm text-sem-danger" role="alert">
            {error}
          </p>
        ) : null}

        {!published ? (
          <button
            type="button"
            disabled={!allApproved || counts.rejected > 0}
            onClick={() => setShowPublishModal(true)}
            className="btn-pill btn-pill--primary min-h-[44px] w-full text-sm disabled:opacity-40"
          >
            {outcomePublic ? 'Publish to ledger' : 'Release private record'}
          </button>
        ) : (
          <p className="rounded bg-brand-soft py-3 text-center text-sm font-medium text-brand">
            {outcomePublic
              ? 'Published — redirecting to ledger…'
              : 'Released — returning to session…'}
          </p>
        )}

        <p className="mt-4 text-center font-mono text-[0.65rem] leading-relaxed text-ink-faint">
          Release is irreversible for this instrument. Participant identities are not disclosed on
          the record; room content remains operator-readable under your MOU.
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
    </AuthenticatedShell>
  );
}
