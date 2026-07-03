import { useParams, Link } from 'react-router-dom';

const record = {
  id: 'rec-003',
  title: 'Community Land Use — Joint Statement',
  org: 'Regional Mediation Centre',
  region: 'Sub-Saharan Africa',
  sessionDate: 'March 14, 2024',
  releasedDate: 'March 18, 2024',
  outcomeType: 'Joint Statement',
  facilitators: ['Regional Mediation Centre — Lead Facilitator'],
  participants: 12,
  verificationAnchor: 'a3f9c1e8b2d47f0e56ac12309de1f783c8ab4521d7e63f901234bcde5678ef90',
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
        <ol
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <li>
            <Link to="/ledger" className="hover:underline">
              Ledger
            </Link>
          </li>
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
          className="mb-2 text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {record.title}
        </h1>
        <p className="mb-6 text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>
          Outcome record from a facilitated dialogue convened under the SquadRidge platform.
        </p>
        <div
          className="flex flex-wrap items-center gap-x-2 rounded border px-3 py-2 text-xs"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span className="font-semibold uppercase tracking-wider opacity-70">Context:</span>
          <span>{record.org}</span>
          <span className="opacity-40">·</span>
          <span>{record.region}</span>
          <span className="opacity-40">·</span>
          <span>Session: {record.sessionDate}</span>
          <span className="opacity-40">·</span>
          <span>Released: {record.releasedDate}</span>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Outcome type', value: record.outcomeType },
          { label: 'Participants (verified)', value: String(record.participants) },
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
            <div className="flex items-center gap-2">
              {item.label === 'Release status' && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      item.value === 'Released' ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                />
              )}
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {item.value}
              </p>
            </div>
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
        <h2
          className="mb-6 text-xs font-bold uppercase tracking-widest opacity-60"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Agreed principles
        </h2>
        <pre
          className="whitespace-pre-wrap text-sm leading-relaxed"
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
          className="mb-2 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          This record was released through SquadRidge's controlled release process. A cryptographic
          anchor is generated at the moment of approval and cannot be retroactively modified.
        </p>
        <p className="mb-4 text-xs italic" style={{ color: 'var(--color-text-secondary)' }}>
          This hash allows third parties to verify that this record has not been altered after
          release.
        </p>
        <div className="relative">
          <code
            className="block break-all rounded border px-4 py-3 font-mono text-xs pr-20"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {record.verificationAnchor}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(record.verificationAnchor)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-surface px-2 py-1 text-[10px] font-medium border transition-colors hover:bg-bg"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            Copy Hash
          </button>
        </div>
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
            'The session room dialogue remains permanently private to participants and is never published.',
            'This record does not identify individual participants.',
            'This record was approved by all designated parties before release.',
            'The substantive content of this record is the responsibility of the facilitating organisation.',
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
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
          {`Regional Mediation Centre. (2024). Community Land Use — Joint Statement. SquadRidge Outcome Ledger. https://squadridge.app/ledger/${proposalId ?? record.id}. Accessed: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
        </code>
      </section>
    </div>
  );
}
