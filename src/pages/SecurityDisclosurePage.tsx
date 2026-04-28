import { Link } from 'react-router-dom';

/** Documentation-style section block: subtle border, restrained radius. */
function DocSection({
  labelledBy,
  children,
  className = '',
}: {
  labelledBy?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={`rounded-md border border-white/[0.08] bg-[#0a0e18]/60 px-5 py-5 md:px-6 md:py-6 ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * Plain-language security posture for participants (mirrors docs/security/encryption-scope.md).
 */
export function SecurityDisclosurePage() {
  return (
    <article className="mx-auto w-full max-w-copy pb-20 pt-6 md:pt-8">
      <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        SECURITY DISCLOSURE
      </p>
      <h1 className="mt-2.5 font-heading text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-[1.15] tracking-tight text-[#f1f5f9]">
        Security boundaries in the current release
      </h1>
      <p className="mt-4 max-w-[40rem] font-sans text-[0.95rem] leading-[1.65] text-[#a8b2c1]">
        This page describes what SquadRidge protects today, what operators can still access during
        normal operation, and which guarantees are not yet part of the current release.
      </p>

      <div className="mt-8 flex flex-col gap-7 md:gap-8">
        <DocSection labelledBy="security-protected-heading">
          <h2
            id="security-protected-heading"
            className="mb-3 font-heading text-[1.0625rem] font-semibold leading-snug text-[#e2e8f0]"
          >
            What is protected today
          </h2>
          <ul className="m-0 list-disc space-y-2.5 pl-5 font-sans text-[0.95rem] leading-[1.65] text-[#a8b2c1] marker:text-slate-600">
            <li className="pl-1">
              Participants use verified pseudonymous accounts rather than public real-name identity
              inside the room.
            </li>
            <li className="pl-1">Message payloads are encrypted before storage.</li>
            <li className="pl-1">
              Each squad uses a shared squad key to access message content in the product
              experience.
            </li>
          </ul>
        </DocSection>

        <section
          aria-labelledby="security-operator-heading"
          className="rounded-md border border-slate-500/40 bg-[#0c121c]/90 px-5 py-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)] md:px-6 md:py-6"
        >
          <h2
            id="security-operator-heading"
            className="mb-3 font-heading text-[1.0625rem] font-semibold leading-snug text-[#e8eef5]"
          >
            Current operator visibility
          </h2>
          <div className="space-y-3 font-sans text-[0.95rem] leading-[1.65] text-[#b8c2cf]">
            <p className="mb-0">
              The hosting environment, including the database and logs, can access ciphertext and
              squad keys during normal operation.
            </p>
            <p className="mb-0">
              SquadRidge does not currently claim that operators are technically unable to read
              stored messages when moderation, legal process, or incident response requires access.
            </p>
          </div>
        </section>

        <DocSection labelledBy="security-not-e2ee-heading">
          <h2
            id="security-not-e2ee-heading"
            className="mb-3 font-heading text-[1.0625rem] font-semibold leading-snug text-[#e2e8f0]"
          >
            What is not yet implemented
          </h2>
          <p className="mb-0 font-sans text-[0.95rem] leading-[1.65] text-[#a8b2c1]">
            Per-user end-to-end encryption, where the server never holds decryptable content, is not
            part of the current release. That remains a future architecture direction rather than a
            current guarantee.
          </p>
        </DocSection>

        <DocSection labelledBy="security-refs-heading">
          <h2
            id="security-refs-heading"
            className="mb-3 font-heading text-[1.0625rem] font-semibold leading-snug text-[#e2e8f0]"
          >
            Technical references
          </h2>
          <p className="mb-3 font-sans text-[0.95rem] leading-[1.65] text-[#a8b2c1]">
            Further technical detail is documented in the repository:
          </p>
          <div className="rounded border border-white/[0.06] bg-[#070a12]/80 px-3 py-3 font-mono text-[0.8125rem] leading-relaxed text-[#94a3b8]">
            <ul className="m-0 list-none space-y-1.5 p-0">
              <li className="break-all pl-0">
                <code className="text-[0.8125rem] text-[#cbd5e1]">
                  docs/security/encryption-scope.md
                </code>
              </li>
              <li className="break-all pl-0">
                <code className="text-[0.8125rem] text-[#cbd5e1]">
                  docs/security/threat-model.md
                </code>
              </li>
            </ul>
          </div>
        </DocSection>
      </div>

      <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-10 sm:gap-y-3">
        <Link
          to="/#waitlist"
          className="font-sans text-[0.875rem] font-medium text-[#94a3b8] underline-offset-4 transition-colors hover:text-[#cbd5e1] hover:underline"
        >
          Request pilot access
        </Link>
        <Link
          to="/"
          className="font-sans text-[0.8125rem] text-slate-600 underline-offset-4 transition-colors hover:text-slate-500 hover:underline"
        >
          Return home
        </Link>
      </div>
    </article>
  );
}
