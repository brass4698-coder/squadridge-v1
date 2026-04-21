import { Link } from 'react-router-dom';

function DocBulletList({ children }: { children: React.ReactNode }) {
  return <ul className="m-0 list-none space-y-3 p-0">{children}</ul>;
}

function DocBulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[#a8b2c1]">
      <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-teal/55" aria-hidden />
      <span className="min-w-0 flex-1 leading-relaxed">{children}</span>
    </li>
  );
}

/**
 * Plain-language security posture for participants (mirrors docs/security/encryption-scope.md).
 */
export function SecurityDisclosurePage() {
  return (
    <article className="mx-auto w-full max-w-copy pb-20 pt-[72px]">
      <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-teal/80">
        Trust &amp; safety
      </p>
      <h1 className="mt-2 font-heading text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-[#f1f5f9]">
        Security boundaries in the current release
      </h1>
      <p className="mt-6 font-sans text-[0.95rem] leading-relaxed text-[#a8b2c1]">
        SquadRidge uses verified pseudonymous accounts and stores encrypted message payloads in the
        database. Each squad shares a per-squad key, so messages are not presented as plain text in
        the product experience without that key.
      </p>

      <div className="mt-12 space-y-10 font-sans text-[0.95rem] leading-relaxed text-[#a8b2c1]">
        <section aria-labelledby="security-protected-heading">
          <h2
            id="security-protected-heading"
            className="mb-3 font-heading text-[1rem] font-semibold text-[#e2e8f0]"
          >
            What is protected today
          </h2>
          <DocBulletList>
            <DocBulletItem>
              Participants use verified pseudonymous accounts rather than public real-name identity
              in the room.
            </DocBulletItem>
            <DocBulletItem>Message payloads are encrypted before storage.</DocBulletItem>
            <DocBulletItem>
              Each squad uses a shared squad key to access message content in the product
              experience.
            </DocBulletItem>
          </DocBulletList>
        </section>

        <section aria-labelledby="security-operator-heading">
          <h2
            id="security-operator-heading"
            className="mb-3 font-heading text-[1rem] font-semibold text-[#e2e8f0]"
          >
            Current operator visibility
          </h2>
          <p className="mb-0">
            The hosting environment, including the database and logs, can access ciphertext and
            squad keys during normal operation. SquadRidge does not currently claim that operators
            are technically unable to read stored messages when moderation, legal process, or
            incident response requires access.
          </p>
        </section>

        <section aria-labelledby="security-not-e2ee-heading">
          <h2
            id="security-not-e2ee-heading"
            className="mb-3 font-heading text-[1rem] font-semibold text-[#e2e8f0]"
          >
            What is not yet implemented
          </h2>
          <p className="mb-0">
            Per-user end-to-end encryption, where the server never holds decryptable content, is not
            part of the current release. That remains a future architecture direction rather than a
            current guarantee.
          </p>
        </section>

        <section aria-labelledby="security-refs-heading">
          <h2
            id="security-refs-heading"
            className="mb-3 font-heading text-[1rem] font-semibold text-[#e2e8f0]"
          >
            Technical references
          </h2>
          <p className="mb-3">The repository includes deeper documentation in:</p>
          <DocBulletList>
            <DocBulletItem>
              <code className="font-mono text-[0.8rem] text-[#94a3b8]">
                docs/security/encryption-scope.md
              </code>
            </DocBulletItem>
            <DocBulletItem>
              <code className="font-mono text-[0.8rem] text-[#94a3b8]">
                docs/security/threat-model.md
              </code>
            </DocBulletItem>
          </DocBulletList>
        </section>
      </div>

      <div className="mt-12 flex flex-col gap-5 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-baseline sm:gap-12">
        <Link
          to="/#waitlist"
          className="font-sans text-[0.875rem] text-[#94a3b8] underline-offset-4 hover:text-[#cbd5e1] hover:underline"
        >
          Request pilot access
        </Link>
        <Link
          to="/"
          className="font-sans text-[0.875rem] text-[#6b7280] underline-offset-4 hover:text-[#94a3b8] hover:underline"
        >
          Home
        </Link>
      </div>
    </article>
  );
}
