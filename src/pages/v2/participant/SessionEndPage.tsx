import { Link } from 'react-router-dom';
import { TokenShell } from '../../../components/layout/TokenShell';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { participantRoute } from '../../../lib/participantRoutes';

export function SessionEndPage() {
  const token = useParticipantToken();

  return (
    <TokenShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div
          className="mb-8 flex h-14 w-14 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          aria-hidden="true"
        >
          ✓
        </div>
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Session complete
        </p>
        <h1
          className="mb-3 text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Thank you for participating
        </h1>
        <p
          className="mb-8 max-w-sm text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The room has closed. When the facilitator opens draft review, use your review link to
          approve or dispute the instrument before any release.
        </p>

        <div
          className="mb-8 w-full max-w-sm rounded-lg border p-6 text-left"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            What happens next
          </h2>
          <ul className="flex flex-col gap-3">
            {[
              'The facilitator drafts an outcome in their own words — not a transcript.',
              'You review and approve or dispute that draft before release.',
              'Only an approved instrument may leave the room (public or private anchor).',
              'Room dialogue — including your contributions — remains private.',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }}>
                  →
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-3">
          {token ? (
            <Link
              to={participantRoute('review', token)}
              className="btn-institutional btn-institutional--primary inline-flex min-h-[44px] items-center justify-center no-underline"
            >
              Open outcome review
            </Link>
          ) : null}
          <Link
            to="/ledger"
            className="text-sm underline transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            View the public ledger
          </Link>
        </div>
      </div>
    </TokenShell>
  );
}
