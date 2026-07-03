import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { TokenShell } from '../../../components/layout/TokenShell';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { participantRoute } from '../../../lib/participantRoutes';

export function InviteAcceptancePage() {
  const token = useParticipantToken();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function accept() {
    if (!token) return;
    setLoading(true);
    setTimeout(() => navigate(participantRoute('verify', token)), 800);
  }

  if (!token) return null;

  return (
    <TokenShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="sr-glass-strong w-full max-w-md rounded-xl p-10">
          <p className="mb-4 text-app-meta font-semibold uppercase tracking-widest text-brand">
            Secure invitation
          </p>

          <h1 className="mb-3 text-page-title text-ink">You have been invited to participate</h1>

          <p className="mb-6 text-app-body leading-relaxed text-ink-secondary">
            A facilitator has extended a formal invitation for you to join a protected dialogue
            session on SquadRidge. Before you can enter, you will complete a short verification
            process.
          </p>

          <div className="mb-8 rounded-lg border border-line bg-surface-secondary p-5">
            <p className="mb-1 text-app-meta font-semibold uppercase tracking-wider text-ink-secondary">
              Session
            </p>
            <p className="text-app-body font-medium text-ink">Northern Watershed Consultation</p>
            <p className="mt-1 text-app-meta text-ink-secondary">
              Facilitated by Regional Mediation Centre · Jun 20, 2024
            </p>
          </div>

          <ul className="mb-8 space-y-2">
            {[
              'Your participation is confidential.',
              'Only the approved outcome document may become public.',
              'Your identity is protected within the session room.',
              'You may leave at any time.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-app-body text-ink-secondary">
                <span className="mt-0.5 text-base leading-none text-sem-success">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <Button className="w-full" size="lg" onClick={accept} loading={loading}>
            Accept invitation &amp; continue
          </Button>

          <p className="mt-4 text-center text-app-meta text-ink-secondary">
            This invitation link is single-use and expires after verification is complete.
          </p>
        </div>
      </div>
    </TokenShell>
  );
}
