import { useState } from 'react';

const faqs = [
  {
    q: 'Who can use SquadRidge?',
    a: 'SquadRidge is currently available to facilitators, mediators, and institutions on a pilot basis. Participants join by invitation from a facilitator. We do not currently offer open self-registration.',
  },
  {
    q: 'What happens to what is said in the room?',
    a: 'Session room content is private. It is not published, shared, or attributed publicly under any circumstances. Only an approved outcome document — produced separately by the facilitator and signed off by designated parties — can be released to the public ledger.',
  },
  {
    q: 'Can participants be identified from a public outcome record?',
    a: 'No. Public outcome records do not identify individual participants. They identify the facilitating organisation and the outcome document itself.',
  },
  {
    q: 'What is the public ledger?',
    a: "The public ledger is a read-only index of approved outcome records from completed sessions. Each record was produced and approved through SquadRidge's release process. The ledger is browseable and citable. It does not contain any session room content.",
  },
  {
    q: 'Can a facilitator release an outcome without participant approval?',
    a: 'No. The release process requires positive approval from every designated approver configured by the facilitator. The platform cannot bypass this. If any approver declines, the document is not released.',
  },
  {
    q: 'Is SquadRidge a legal instrument?',
    a: 'No. SquadRidge is a process platform. It provides structure, documentation, and verification for facilitated dialogue. It does not produce legally binding agreements unless the parties separately formalise the outcome through appropriate legal channels.',
  },
  {
    q: 'How do I get access?',
    a: 'Submit a pilot access application using the Request Access form. We review applications manually and respond within five working days.',
  },
  {
    q: 'What does verification mean for participants?',
    a: 'Verification is the process of confirming that a participant is eligible to join a session, as configured by the facilitator. This may include email confirmation, identity document review, or manual approval. Verification data is seen only by the facilitator, not other participants.',
  },
];

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  function toggle(i: number) {
    setOpen((prev) => (prev === i ? null : i));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">Questions</p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-ink">Frequently asked</h1>
      </div>

      <dl className="flex flex-col">
        {faqs.map((faq, i) => (
          <div key={faq.q} className="border-b border-line">
            <dt>
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between py-5 text-left text-sm font-medium text-ink"
                aria-expanded={open === i}
              >
                {faq.q}
                <span
                  className="ml-4 shrink-0 text-base transition-transform text-ink-secondary"
                  style={{
                    transform: open === i ? 'rotate(45deg)' : 'none',
                  }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
            </dt>
            {open === i && (
              <dd className="pb-5 text-sm leading-relaxed text-ink-secondary">{faq.a}</dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
