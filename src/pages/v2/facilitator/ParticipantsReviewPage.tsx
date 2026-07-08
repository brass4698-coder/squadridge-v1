import { useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { useParticipants } from '../../../hooks/useParticipants';
import { appRoutes } from '../../../lib/appRoutes';

export function ParticipantsReviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { participants, loading, setVerificationStatus } = useParticipants(sessionId);

  const allVerified =
    participants.length > 0 && participants.every((p) => p.verification_status === 'verified');

  if (loading) return <RouteSkeleton label="Loading participants" />;

  return (
    <AuthenticatedShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Session {sessionId}
            </p>
            <h1 className="text-xl font-semibold text-ink">Participant review</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              Approve or deny each participant before opening the live room.
            </p>
          </div>
          <button
            type="button"
            disabled={!allVerified}
            onClick={() => navigate(appRoutes.sessionControl(sessionId ?? ''))}
            className="btn-pill btn-pill--primary shrink-0 text-sm disabled:opacity-40"
          >
            Open room
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {participants.length === 0 ? (
            <p className="text-sm text-ink-secondary">No participants invited yet.</p>
          ) : (
            participants.map((p) => (
              <div key={p.id} className="rounded-lg border border-line bg-surface-elevated p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.codename}</p>
                    <p className="text-xs text-ink-secondary">
                      Invited {new Date(p.created_at).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge variant={p.verification_status}>{p.verification_status}</StatusBadge>
                </div>

                <div
                  className={`mb-4 rounded p-3 text-xs ${
                    p.document_submitted
                      ? 'bg-brand-soft text-brand'
                      : 'bg-surface-sunken text-ink-secondary'
                  }`}
                >
                  {p.document_submitted
                    ? 'Identity document submitted'
                    : 'No document submitted yet'}
                </div>

                {p.verification_status !== 'verified' ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => void setVerificationStatus(p.id, 'denied')}
                      className="flex-1 rounded border border-line py-2 text-xs font-medium text-ink-secondary"
                    >
                      Deny
                    </button>
                    <button
                      type="button"
                      onClick={() => void setVerificationStatus(p.id, 'verified')}
                      className="flex-1 rounded bg-brand py-2 text-xs font-medium text-brand-on"
                    >
                      Approve
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void setVerificationStatus(p.id, 'pending')}
                    className="text-xs text-ink-secondary underline"
                  >
                    Undo approval
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
