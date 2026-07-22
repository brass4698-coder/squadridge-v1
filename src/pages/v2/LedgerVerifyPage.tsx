import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MarketingSection, ShellWidth, VerificationAnchorBadge } from '../../components/shared';
import { supabase } from '../../lib/supabase';

type VerifyResult = {
  ok: boolean;
  match?: boolean;
  ledger_sha?: string;
  recomputed_sha?: string;
  algorithm?: string;
  error?: string;
};

export function LedgerVerifyPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    if (!recordId) return;
    setLoading(true);
    const { data, error } = await supabase.rpc('verify_outcome_anchor', {
      p_outcome_id: recordId,
    });
    if (error) {
      setResult({ ok: false, error: error.message });
    } else {
      setResult(data as VerifyResult);
    }
    setLoading(false);
  }, [recordId]);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <div className="sr-mode-ledger min-h-[60vh]">
      <MarketingSection tone="plain" density="comfortable">
        <ShellWidth>
          <nav aria-label="Breadcrumb" className="mb-6 font-mono text-xs text-ink-secondary">
            <Link to="/ledger" className="hover:underline">
              Ledger
            </Link>
            <span aria-hidden="true"> › </span>
            {recordId ? (
              <Link to={`/ledger/${recordId}`} className="hover:underline">
                Record
              </Link>
            ) : null}
            <span aria-hidden="true"> › </span>
            <span className="text-ink">Verify</span>
          </nav>

          <p className="mb-2 font-mono text-[length:var(--text-label)] uppercase tracking-[0.14em] text-ink-faint">
            Integrity check
          </p>
          <h1 className="mb-3 font-display text-h1 text-ink">Verify outcome anchor</h1>
          <p className="mb-8 max-w-prose text-base text-ink-secondary">
            Recomputes the SHA-256 of the approved outcome text and compares it to the stored
            verification anchor. This confirms the released instrument has not been altered — not
            that the substance is true, legally binding, or endorsed by SquadRidge. Private records
            are not publicly verifiable.
          </p>

          <div className="sr-evidence-frame max-w-measure p-6 md:p-8">
            {loading ? (
              <p className="text-sm text-ink-secondary" role="status">
                Recomputing…
              </p>
            ) : result?.ok && result.match ? (
              <div>
                <p className="mb-4 text-sm font-medium text-sem-success">Anchor matches</p>
                <VerificationAnchorBadge
                  anchorId={
                    result.ledger_sha ? `SQR-${result.ledger_sha.slice(0, 8).toUpperCase()}` : '—'
                  }
                  status="verified"
                />
                <p className="mt-4 break-all font-mono text-xs text-ink-secondary">
                  {result.ledger_sha}
                </p>
                <p className="mt-2 font-mono text-xs text-ink-secondary">
                  Algorithm: {result.algorithm ?? 'SHA-256'} · canonical v1 (content fields only)
                </p>
              </div>
            ) : result?.ok && result.match === false ? (
              <div role="alert">
                <p className="mb-2 text-sm font-medium text-sem-danger">Anchor does not match</p>
                <p className="text-sm text-ink-secondary">
                  Stored and recomputed digests differ. Do not treat this record as unverified
                  integrity until reviewed by an operator.
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-secondary" role="alert">
                {result?.error === 'FORBIDDEN'
                  ? 'This record is not publicly verifiable, or you lack access.'
                  : (result?.error ?? 'Verification unavailable.')}
              </p>
            )}

            <button
              type="button"
              onClick={() => void run()}
              className="mt-6 text-sm font-medium text-brand hover:underline"
            >
              Recompute again
            </button>
          </div>
        </ShellWidth>
      </MarketingSection>
    </div>
  );
}
