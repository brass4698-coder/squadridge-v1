import { Link } from 'react-router-dom';

/**
 * Plain-language security posture for participants (mirrors docs/security/encryption-scope.md).
 */
export function SecurityDisclosurePage() {
  return (
    <div className="mx-auto w-full max-w-copy pb-20 pt-[72px]">
      <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-teal/80">Trust &amp; safety</p>
      <h1 className="mt-2 font-heading text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-[#f1f5f9]">
        How your session data is protected today
      </h1>
      <div className="mt-8 space-y-6 font-sans text-[0.95rem] leading-relaxed text-[#a8b2c1]">
        <p className="mb-0">
          SquadRidge uses verified pseudonymous accounts and encrypted message payloads stored in our database. Squad members
          share a per-squad key so messages are not readable as plain text in the app UI without that key.
        </p>
        <p className="mb-0">
          <strong className="font-medium text-[#e2e8f0]">Operator visibility.</strong> The hosting environment (database and
          logs) can access ciphertext and squad keys under normal operation. We do not claim that operators cannot read
          stored messages if required for moderation, legal process, or incident response — see the project threat model for
          detail.
        </p>
        <p className="mb-0">
          <strong className="font-medium text-[#e2e8f0]">Not full end-to-end yet.</strong> Per-user end-to-end encryption
          (where the server never holds decryptable content) is a future architecture direction, not the current release.
        </p>
        <p className="mb-0 text-[0.875rem] text-[#6b7280]">
          Technical references ship with the repository: <code className="font-mono text-[0.8rem]">docs/security/encryption-scope.md</code>,{' '}
          <code className="font-mono text-[0.8rem]">docs/security/threat-model.md</code>.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/" className="text-teal-light underline-offset-4 hover:underline">
          Home
        </Link>
        <Link to="/ledger" className="text-ink-muted underline-offset-4 hover:text-[#a8b2c1] hover:underline">
          Ledger
        </Link>
      </div>
    </div>
  );
}
