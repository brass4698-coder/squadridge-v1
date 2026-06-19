import { useParams, Link } from 'react-router-dom';

const record = {
  id: 'rec-001',
  title: 'Community Land Use — Joint Statement',
  org: 'Regional Mediation Centre',
  region: 'Sub-Saharan Africa',
  sessionDate: 'March 14, 2024',
  releasedDate: 'March 18, 2024',
  outcomeType: 'Joint Statement',
  facilitators: ['Regional Mediation Centre — Lead Facilitator'],
  participants: 12,
  verificationAnchor: 'SHA-256: a3f9c1e8b2d47f0e56ac12309de1f783c8ab4521d7e63f901234bcde5678ef90',
  body: `JOINT STATEMENT OF PRINCIPLES
Community Land Use Consultation — March 14, 2024

The following principles were agreed by representatives participating in a facilitated dialogue convened under the SquadRidge platform and certified by Regional Mediation Centre.

1. All future land-use decisions affecting the designated consultation area will require structured stakeholder consultation prior to any planning authority submission.

2. An independent environmental monitoring body will be established within 120 days, with representation drawn from participating community organisations.

3. The parties commit to a formal review of implementation progress at six months, to be facilitated by a mutually agreed mediator.

4. This statement constitutes a record of agreed principles and does not carry the force of a legally binding contract unless formalised separately by the relevant parties.

This record was produced through a structured, facilitated process. The dialogue that produced this text remains permanently confidential to the participating parties.`,
};

export function LedgerRecordPage() {
  const { proposalId } = useParams<{ proposalId: string }>();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <li><Link to="/ledger" className="hover:underline">Ledger</Link></li>
          <li aria-hidden="true">›</li>
          <li style={{ color: 'var(--color-text-primary)' }}>{record.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-success)' }}
        >
          ✓ Released Outcome Record
        </p>
        <h1
          className="mb-3 text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {record.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <span>{record.org}</span>
          <span>·</span>
          <span>{record.region}</span>
          <span>·</span>
          <span>Session: {record.sessionDate}</span>
          <span>·</span>
          <span>Released: {record.releasedDate}</span>
        </div>
      </div>

      {/* Metadata strip */}
      <div
        className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          { label: 'Outcome type', value: record.outcomeType },
          { label: 'Participants', value: String(record.participants) },
          { label: 'Facilitated by', value: record.org },
          { label: 'Release status', value: 'Released' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border p-4"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {item.label}
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Outcome body */}
      <div
        className="mb-10 rounded-lg border p-8"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <pre
          className="whitespace-pre-wrap text-sm leading-loose"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {record.body}
        </pre>
      </div>

      {/* Verification block */}
      <section
        className="mb-10 rounded-lg border p-6"
        aria-labelledby="verification-heading"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <h2
          id="verification-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Verification
        </h2>
        <p
          className="mb-4 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          This record was released through SquadRidge's controlled release process. A cryptographic anchor is generated at the moment of approval and cannot be retroactively modified.
        </p>
        <code
          className="block break-all rounded border px-4 py-3 text-xs"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {record.verificationAnchor}
        </code>
      </section>

      {/* Disclosure */}
      <section
        className="mb-10 rounded-lg border p-6"
        aria-labelledby="disclosure-heading"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <h2
          id="disclosure-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Disclosure constraints
        </h2>
        <ul className="flex flex-col gap-2">
          {[
            'The session room dialogue remains permanently private to participants.',
            'This record does not identify individual participants.',
            'This record was approved by all designated parties before release.',
            'The substantive content of this record is the responsibility of the facilitating organisation.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="mt-0.5 shrink-0">·</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Citation */}
      <section aria-labelledby="citation-heading">
        <h2
          id="citation-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cite this record
        </h2>
        <code
          className="block rounded border px-4 py-3 text-xs leading-relaxed"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {`Regional Mediation Centre. (2024). Community Land Use — Joint Statement. SquadRidge Outcome Ledger. https://squadridge.app/ledger/${proposalId ?? record.id}`}
        </code>
      </section>
    </div>
  );
}
