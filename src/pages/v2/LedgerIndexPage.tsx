import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';

const records = [
  {
    id: 'rec-001',
    title: 'Community Land Use — Joint Statement',
    org: 'Regional Mediation Centre',
    region: 'Sub-Saharan Africa',
    date: 'Mar 14, 2024',
    outcomeType: 'Joint Statement',
    verified: true,
  },
  {
    id: 'rec-002',
    title: 'Urban Housing Policy — Consensus Principles',
    org: 'City Planning Consortium',
    region: 'Western Europe',
    date: 'Feb 3, 2024',
    outcomeType: 'Consensus Summary',
    verified: true,
  },
  {
    id: 'rec-003',
    title: 'Coastal Zone Dialogue — Working Principles',
    org: 'Coastal Authority',
    region: 'East Asia',
    date: 'Jan 18, 2024',
    outcomeType: 'Working Principles',
    verified: true,
  },
  {
    id: 'rec-004',
    title: 'Regional Trade Framework — Recommendation',
    org: 'Trade Facilitation Office',
    region: 'South-East Asia',
    date: 'Dec 9, 2023',
    outcomeType: 'Formal Recommendation',
    verified: true,
  },
];

export function LedgerIndexPage() {
  const [query, setQuery] = useState('');

  const filtered = records.filter(
    (r) =>
      !query ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.org.toLowerCase().includes(query.toLowerCase()) ||
      r.region.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Public Record
        </p>
        <h1
          className="mb-3 text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Outcome Ledger
        </h1>
        <p
          className="mx-auto max-w-xl text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The following records represent outcomes from facilitated dialogue sessions conducted on the SquadRidge platform. Each record is published only after explicit approval by all designated parties. Session room content remains permanently private.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <label htmlFor="ledger-search" className="sr-only">Search records</label>
        <input
          id="ledger-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, organisation, or region…"
          className="w-full rounded border px-5 py-3 text-sm outline-none transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No records found matching &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((rec) => (
            <Link
              key={rec.id}
              to={`/ledger/${rec.id}`}
              className="block rounded-lg border p-6 transition-shadow hover:shadow-md"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p
                    className="mb-1 text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {rec.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {rec.org} &middot; {rec.region} &middot; {rec.date}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusBadge variant="released">{rec.outcomeType}</StatusBadge>
                  {rec.verified && (
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-success)' }}
                    >
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Disclosure */}
      <p
        className="mt-12 text-center text-xs leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Records are published with the consent of all session parties. Facilitating organisations are responsible for the accuracy of submitted outcomes. SquadRidge does not verify the substance of published records — only the release process.
      </p>
    </div>
  );
}
