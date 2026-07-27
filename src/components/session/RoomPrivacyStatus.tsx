import { Link } from 'react-router-dom';

export type RoomPrivacyStatusVariant =
  | 'loading'
  | 'sealed_app_layer'
  | 'key_error'
  | 'demo_local'
  | 'unavailable';

export type RoomPrivacyStatusProps = {
  variant: RoomPrivacyStatusVariant;
  /** Optional technical detail for key/crypto failures (never message bodies). */
  detail?: string | null;
  className?: string;
};

const COPY: Record<
  RoomPrivacyStatusVariant,
  { title: string; body: string; tone: 'neutral' | 'ok' | 'warn' }
> = {
  loading: {
    title: 'Checking room seal',
    body: 'Loading encryption status for this session…',
    tone: 'neutral',
  },
  sealed_app_layer: {
    title: 'Sealed room · application-layer encryption',
    body: 'Message bodies are encrypted before storage. Facilitator and admitted participants can decrypt. Platform operators with database access can still read room keys — not Signal-grade operator-blind encryption.',
    tone: 'ok',
  },
  key_error: {
    title: 'Room key unavailable',
    body: 'Cannot encrypt or decrypt messages until the session room key is available. Refresh or rejoin. Do not continue a high-stakes round while this is shown.',
    tone: 'warn',
  },
  demo_local: {
    title: 'Demo room · local only',
    body: 'This walkthrough does not use a live encrypted session. Production rooms encrypt bodies at the application layer.',
    tone: 'neutral',
  },
  unavailable: {
    title: 'No active room',
    body: 'Open a session to see encryption status.',
    tone: 'neutral',
  },
};

/**
 * Honest sealed-room status — matches threat model (operator-readable keys).
 */
export function RoomPrivacyStatus({ variant, detail, className = '' }: RoomPrivacyStatusProps) {
  const copy = COPY[variant];
  const toneClass =
    copy.tone === 'ok'
      ? 'border-brand/35 bg-surface-accent'
      : copy.tone === 'warn'
        ? 'border-sem-warning/40 bg-sem-warning-soft'
        : 'border-line bg-surface-elevated';

  return (
    <aside
      className={`rounded-[var(--sr-radius-md)] border px-3.5 py-3 shadow-sr-sm ${toneClass} ${className}`}
      aria-live="polite"
      data-demo="room-privacy-status"
    >
      <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.08em] text-ink-faint">
        Who can read
      </p>
      <p className="mt-1 mb-0 text-sm font-medium text-ink">{copy.title}</p>
      <p className="mt-1 mb-0 text-xs leading-relaxed text-ink-secondary">{copy.body}</p>
      {detail && copy.tone === 'warn' ? (
        <p className="mt-1.5 mb-0 font-mono text-[0.7rem] text-ink-faint">{detail}</p>
      ) : null}
      <p className="mt-2 mb-0 text-xs">
        <Link
          to="/security#operator-access"
          className="text-brand underline-offset-2 hover:underline"
        >
          Security boundaries
        </Link>
      </p>
    </aside>
  );
}
