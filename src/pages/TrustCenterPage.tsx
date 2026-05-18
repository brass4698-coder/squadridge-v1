import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Server, Users, AlertTriangle } from 'lucide-react';

type PostureLevel = 'strong' | 'partial' | 'not-implemented';

const POSTURE_LABELS: Record<PostureLevel, string> = {
  strong: 'Active',
  partial: 'Partial',
  'not-implemented': 'Not implemented',
};

const POSTURE_CLASSES: Record<PostureLevel, string> = {
  strong: 'border-teal/40 bg-teal/10 text-teal-light',
  partial: 'border-amber/35 bg-amber/8 text-amber-200',
  'not-implemented': 'border-slate-600/40 bg-slate-800/30 text-slate-500',
};

type FeatureCard = {
  icon: React.ElementType;
  title: string;
  posture: PostureLevel;
  summary: string;
  details: string[];
  notImplemented?: string[];
};

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: Lock,
    title: 'Message encryption',
    posture: 'partial',
    summary:
      'Messages are encrypted in transit (TLS) and at rest using per-squad AES-256-GCM keys. The operator holds the squad encryption key, so this is not end-to-end encryption.',
    details: [
      'TLS encrypts every request to Supabase.',
      'Each squad has a unique AES-256-GCM key stored server-side.',
      'Messages are encrypted before storage; ciphertext is what appears in the database.',
      'Moderators can decrypt for review via an audited RPC — every decrypt is logged with a mandatory justification.',
    ],
    notImplemented: [
      'Client-held keys (true E2E): the server holds the squad key.',
      'Forward secrecy per message.',
      'Signal-grade encryption is not claimed.',
    ],
  },
  {
    icon: Eye,
    title: 'Operator visibility',
    posture: 'partial',
    summary:
      'Moderators can read message content for safety review. All decrypt events require a written justification and are recorded in an append-only audit log.',
    details: [
      'Moderators must enter a justification (≥ 8 chars) before decrypting.',
      'Every decrypt writes a `message_plaintext_decrypt_review` row to `moderation_audit_log`.',
      'Rate limits apply per moderator to prevent bulk extraction.',
      'The audit log is append-only and cannot be deleted via normal API.',
    ],
    notImplemented: [
      'Server-blind (zero-knowledge) server: operator can read plaintext.',
      'Participant notification when their message is reviewed.',
    ],
  },
  {
    icon: Users,
    title: 'Identity & verification',
    posture: 'partial',
    summary:
      'Participants verify one or more attributes (role, affiliation) before joining. Verification uses a zero-knowledge proof stub in staging; Semaphore integration is the production path.',
    details: [
      'Verified attributes are stored in `verified_attributes`, scoped to the user.',
      'The ZK proof submission flow records `nullifier_hash` to prevent double-verification.',
      'Matchmaking uses pool keys derived from verified attributes.',
    ],
    notImplemented: [
      'Production Semaphore integration (deployed as stub in staging).',
      'Revocation of verified attributes after issuance.',
      'Cross-operator attribute portability.',
    ],
  },
  {
    icon: Server,
    title: 'Data retention & deletion',
    posture: 'partial',
    summary:
      'Messages and match queue entries expire after 7 days (TTL). Squad data persists until operator-initiated archive. A full GDPR deletion workflow is not yet implemented.',
    details: [
      'Messages have a normalized 7-day `expires_at` TTL enforced by a background job.',
      'Match queue entries expire on the same 7-day schedule.',
      'Archived squads are flagged, not deleted; key snapshots are preserved for audit.',
    ],
    notImplemented: [
      'Automated right-to-erasure / GDPR deletion workflow.',
      'Participant-triggered data export.',
      'Cross-table cascade delete for all user data.',
    ],
  },
  {
    icon: Shield,
    title: 'Access control & moderation',
    posture: 'strong',
    summary:
      'Row-Level Security is enabled on all tables. Moderators are provisioned in a separate `moderators` table — not self-service. Sensitive RPCs are gated by server-side moderator checks.',
    details: [
      'Every Supabase table has RLS enabled with explicit `REVOKE ALL … FROM PUBLIC`.',
      'Moderator-only operations (decrypt, flag, archive) verify `EXISTS (SELECT 1 FROM moderators WHERE user_id = auth.uid())` server-side.',
      'Rate limits block per-moderator action spikes (Edge function layer).',
      'Direct client INSERTs to `crisis_alerts` are forbidden; the Edge function uses service_role.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Crisis alerts & incident response',
    posture: 'strong',
    summary:
      'Participants can raise out-of-band crisis alerts (danger, pause, facilitator) that bypass the normal message stream. Moderators acknowledge via the incident console and all events are logged.',
    details: [
      'Crisis alerts cannot be inserted directly by clients (service_role bypass only).',
      'Three reason codes: `immediate_danger`, `request_pause`, `request_facilitator`.',
      'Moderator incident console shows open alerts with SLA timers and acknowledge workflow.',
      'All acknowledgement events are queryable for partner reporting.',
    ],
  },
];

function PostureBadge({ posture }: { posture: PostureLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide ${POSTURE_CLASSES[posture]}`}
    >
      {POSTURE_LABELS[posture]}
    </span>
  );
}

/**
 * Trust Transparency Center — plain-language security posture per feature.
 *
 * Complements the technical `SecurityDisclosurePage` (`/security`). This page
 * is written for participants, partners, and institutional reviewers who need
 * an honest, scannable overview — not a deep technical reference.
 *
 * IMPORTANT: Claims here must stay in sync with `docs/security/threat-model.md`
 * and `SecurityDisclosurePage`. Never strengthen claims here ahead of the
 * implementation.
 */
export function TrustCenterPage() {
  return (
    <div className="mx-auto w-full max-w-[64rem] pb-20 pt-6 md:pt-8">
      <div className="mx-auto max-w-copy px-gutter">
        {/* Header */}
        <header className="border-b border-white/[0.08] pb-8">
          <p className="mb-4 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-teal-light/90">
            Trust &amp; transparency
          </p>
          <h1 className="font-heading text-fluid-h1-inner font-extrabold tracking-tight text-gray-light">
            What SquadRidge protects — and what it doesn't
          </h1>
          <p className="mt-4 max-w-[52ch] font-sans text-[1rem] leading-relaxed text-slate-400">
            We believe you have the right to know exactly how your data is handled. This page is an
            honest, plain-language account of our current security posture — including the gaps.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 font-sans text-[0.82rem]">
            <span
              className={`flex items-center gap-1.5 ${POSTURE_CLASSES['strong']} rounded border px-2 py-1`}
            >
              <span className="size-2 rounded-full bg-teal" aria-hidden />
              Active control
            </span>
            <span
              className={`flex items-center gap-1.5 ${POSTURE_CLASSES['partial']} rounded border px-2 py-1`}
            >
              <span className="size-2 rounded-full bg-amber" aria-hidden />
              Partial / in-progress
            </span>
            <span
              className={`flex items-center gap-1.5 ${POSTURE_CLASSES['not-implemented']} rounded border px-2 py-1`}
            >
              <span className="size-2 rounded-full bg-slate-600" aria-hidden />
              Not yet implemented
            </span>
          </div>
        </header>

        {/* What we are */}
        <section className="mt-10 rounded-lg border border-white/[0.08] bg-[#070b12]/60 px-5 py-5">
          <h2 className="font-heading text-[1rem] font-bold text-gray-light">What SquadRidge is</h2>
          <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-slate-400">
            SquadRidge is{' '}
            <strong className="font-semibold text-slate-300">
              high-trust dialogue infrastructure for institutions
            </strong>
            , not a consumer chat app. Sessions are{' '}
            <strong className="font-semibold text-slate-300">facilitator-led</strong>, participants
            are <strong className="font-semibold text-slate-300">attribute-verified</strong>, and
            outcomes are{' '}
            <strong className="font-semibold text-slate-300">citable via a public ledger</strong>.
            We compete on <em>operational safety, auditability, and evidence discipline</em> — not
            on feature breadth.
          </p>
        </section>

        {/* Feature cards */}
        <div className="mt-10 space-y-5">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="rounded-lg border border-white/[0.08] bg-[#080c14]/70 p-5"
                aria-label={card.title}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-[#0c1219]">
                    <Icon className="size-4 text-slate-400" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-2">
                    <h2 className="font-heading text-[1rem] font-semibold text-gray-light">
                      {card.title}
                    </h2>
                    <PostureBadge posture={card.posture} />
                  </div>
                </div>

                <p className="mt-3 font-sans text-[0.88rem] leading-relaxed text-slate-400">
                  {card.summary}
                </p>

                <ul className="mt-3 space-y-1 pl-0 font-sans text-[0.82rem] leading-relaxed text-slate-500">
                  {card.details.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span className="mt-0.5 select-none text-teal/60" aria-hidden>
                        ✓
                      </span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>

                {card.notImplemented && card.notImplemented.length > 0 ? (
                  <div className="mt-4 rounded border border-amber/20 bg-amber/5 px-3 py-3">
                    <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber/80">
                      Not yet implemented
                    </p>
                    <ul className="mt-1.5 space-y-0.5 font-sans text-[0.8rem] text-slate-500">
                      {card.notImplemented.map((n) => (
                        <li key={n} className="flex gap-2">
                          <span className="select-none text-slate-600" aria-hidden>
                            ×
                          </span>
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {/* Disclosure principle */}
        <section className="mt-12 rounded-lg border border-white/[0.07] bg-[#060910]/80 px-5 py-5">
          <h2 className="font-heading text-[0.95rem] font-semibold text-gray-light">
            Our disclosure principle
          </h2>
          <p className="mt-2 font-sans text-[0.88rem] leading-relaxed text-slate-400">
            We will never claim a security control is active before it ships. This page is reviewed
            every time a security-relevant feature changes. If you find a discrepancy between this
            page and the actual implementation, please report it to{' '}
            <a
              href="mailto:security@squadridge.com"
              className="text-teal-light underline decoration-teal/30 underline-offset-2 hover:decoration-teal"
            >
              security@squadridge.com
            </a>
            .
          </p>
        </section>

        {/* Footer nav */}
        <nav
          className="mt-10 flex flex-wrap gap-4 border-t border-white/[0.06] pt-8"
          aria-label="Related pages"
        >
          <Link
            to="/security"
            className="font-sans text-[0.875rem] font-medium text-slate-400 underline-offset-4 transition-colors hover:text-slate-200 hover:underline"
          >
            Technical security disclosure →
          </Link>
          <Link
            to="/ledger"
            className="font-sans text-[0.875rem] text-slate-600 underline-offset-4 transition-colors hover:text-slate-400 hover:underline"
          >
            Public outcome ledger
          </Link>
          <Link
            to="/"
            className="font-sans text-[0.875rem] text-slate-600 underline-offset-4 transition-colors hover:text-slate-400 hover:underline"
          >
            Return home
          </Link>
        </nav>
      </div>
    </div>
  );
}
