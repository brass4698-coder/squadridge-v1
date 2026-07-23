import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface Approver {
  id: string;
  label: string;
  status: ApprovalStatus;
}

const SEED_APPROVERS: Approver[] = [
  { id: 'a1', label: 'Participant A', status: 'approved' },
  { id: 'a2', label: 'Participant B', status: 'pending' },
  { id: 'a3', label: 'Facilitator (you)', status: 'approved' },
];

export function OutcomeReleasePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [approvers] = useState<Approver[]>(SEED_APPROVERS);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [published, setPublished] = useState(false);

  const allApproved = approvers.every((a) => a.status === 'approved');

  function handlePublish() {
    setPublished(true);
    setShowPublishModal(false);
    setTimeout(() => navigate('/ledger'), 1200);
  }

  return (
    <>
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Session {sessionId}
          </p>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Approve &amp; publish
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            All parties must approve the outcome before it can be published to the public ledger.
          </p>
        </div>

        {/* Progress strip */}
        <div
          className="mb-8 rounded border-l-4 px-4 py-3 text-xs"
          style={{
            borderColor: allApproved ? 'var(--color-accent)' : '#92710a',
            backgroundColor: allApproved
              ? 'var(--color-accent-light)'
              : 'var(--color-pending-strip)',
            color: allApproved ? 'var(--color-accent)' : '#92710a',
          }}
        >
          {allApproved
            ? 'All parties have approved. Ready to publish.'
            : `${approvers.filter((a) => a.status === 'approved').length} of ${approvers.length} parties approved.`}
        </div>

        {/* Approver list */}
        <div className="mb-8 flex flex-col gap-3">
          {approvers.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded border px-5 py-4"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {a.label}
              </p>
              <StatusBadge
                variant={
                  a.status === 'approved'
                    ? 'verified'
                    : a.status === 'rejected'
                      ? 'denied'
                      : 'pending'
                }
              >
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </StatusBadge>
            </div>
          ))}
        </div>

        {/* Publish */}
        {!published ? (
          <button
            disabled={!allApproved}
            onClick={() => setShowPublishModal(true)}
            className="w-full rounded py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Publish to ledger
          </button>
        ) : (
          <div
            className="rounded py-3 text-center text-sm font-medium"
            style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          >
            ✓ Published — redirecting to ledger…
          </div>
        )}
      </div>

      {showPublishModal && (
        <ConfirmModal
          title="Publish outcome"
          body="The approved outcome text will be written to the public ledger. Participant identities will not be disclosed. This action cannot be undone."
          confirmLabel="Publish"
          cancelLabel="Review again"
          onConfirm={handlePublish}
          onCancel={() => setShowPublishModal(false)}
        />
      )}
    </>
  );
}
