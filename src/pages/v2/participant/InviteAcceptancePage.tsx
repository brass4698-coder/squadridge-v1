import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function InviteAcceptancePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? 'demo-token';
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function accept() {
    setLoading(true);
    // Replace with real token validation
    setTimeout(() => navigate(`/p/verify?token=${token}`), 800);
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-md rounded-xl border p-10"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Eyebrow */}
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Secure Invitation
        </p>

        <h1
          className="mb-3 text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          You have been invited to participate
        </h1>

        <p
          className="mb-6 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          A facilitator has extended a formal invitation for you to join a protected dialogue session on MENDguild. Before you can enter, you will complete a short verification process.
        </p>

        <div
          className="mb-8 rounded-lg border p-5"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        >
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Session
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Northern Watershed Consultation
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Facilitated by Regional Mediation Centre &middot; Jun 20, 2024
          </p>
        </div>

        <ul className="mb-8 space-y-2">
          {[
            'Your participation is confidential.',
            'Only the approved outcome document may become public.',
            'Your identity is protected within the room.',
            'You may leave at any time.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="mt-0.5 text-base leading-none" style={{ color: 'var(--color-success)' }}>✓</span>
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={accept}
          disabled={loading}
          className="w-full rounded py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {loading ? 'Verifying invitation…' : 'Accept Invitation & Continue'}
        </button>

        <p className="mt-4 text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This invitation link is single-use and expires after verification is complete.
        </p>
      </div>
    </div>
  );
}
