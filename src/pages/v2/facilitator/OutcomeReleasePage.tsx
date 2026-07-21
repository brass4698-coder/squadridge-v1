import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { useOutcomeRecord } from '../../../hooks/useOutcomeRecord';
import { useSession } from '../../../hooks/useSessions';
import { appRoutes } from '../../../lib/appRoutes';

export function OutcomeReleasePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { approvals, loading, setApprovalStatus, publishToLedger } = useOutcomeRecord(sessionId);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allApproved = approvals.length > 0 && approvals.every((a) => a.status === 'approved');
  const outcomePublic = session?.outcome_public === true;

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

  return (
    <AuthenticatedShell>
      <div className="sr-mode-gate mx-auto max-w-xl rounded-lg p-1">
        <div className="mx-auto max-w-xl">
          <div className="mb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Session {sessionId}
            </p>
            <h1 className="text-xl font-semibold text-ink">Approve &amp; release</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              {outcomePublic
                ? 'All parties must approve before the outcome is published to the public ledger.'
                : 'All parties must approve before the outcome is released as a private anchored record for partners and funders. It will not appear on the public ledger.'}
            </p>
          </div>

          <div
            className={`mb-8 rounded border-l-4 px-4 py-3 text-xs ${
              allApproved
                ? 'border-brand bg-brand-soft text-brand'
                : 'border-warning bg-surface-sunken text-ink-secondary'
            }`}
          >
            {allApproved
              ? outcomePublic
                ? 'All parties have approved. Ready to publish to the ledger.'
                : 'All parties have approved. Ready to release the private anchored record.'
              : `${approvals.filter((a) => a.status === 'approved').length} of ${approvals.length} approved.`}
          </div>

          <div className="mb-8 flex flex-col gap-3">
            {approvals.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded border border-line bg-surface-elevated px-5 py-4"
              >
                <p className="text-sm font-medium text-ink">{a.approver_label}</p>
                <div className="flex items-center gap-2">
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
                      className="text-xs text-brand hover:underline"
                    >
                      Mark approved
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <p className="mb-4 text-sm text-sem-danger" role="alert">
              {error}
            </p>
          ) : null}

          {!published ? (
            <button
              type="button"
              disabled={!allApproved}
              onClick={() => setShowPublishModal(true)}
              className="btn-pill btn-pill--primary w-full text-sm disabled:opacity-40"
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
        </div>

        {showPublishModal ? (
          <ConfirmModal
            title={outcomePublic ? 'Publish outcome' : 'Release private outcome'}
            body={
              outcomePublic
                ? 'The approved outcome will be written to the public ledger with a verification anchor. Participant identities are not disclosed.'
                : 'The approved outcome will be released with a verification anchor for partner and funder sharing. It will not appear on the public ledger. Participant identities are not disclosed.'
            }
            confirmLabel={outcomePublic ? 'Publish' : 'Release'}
            cancelLabel="Review again"
            onConfirm={() => void handlePublish()}
            onCancel={() => setShowPublishModal(false)}
          />
        ) : null}
      </div>
    </AuthenticatedShell>
  );
}
