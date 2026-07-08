import type { UseCaseCardProps } from '../components/shared/UseCaseCard';

export const useCases: UseCaseCardProps[] = [
  {
    sector: 'Civil mediators & conflict-resolution',
    title: 'Community land-use mediation',
    context:
      'Parties to a contested land-use question — residents, authorities, and community organisations — need a structured process where positions can be stated without exposure. Ordinary tools leave a discoverable trail.',
    inTheRoom:
      'Structured written dialogue across facilitator-led rounds. Each party sets out its position and responds at its own pace. No faces, voices, or transcripts — the exchange stays private to verified participants.',
    releasedRecord:
      'A Joint Statement of Principles, approved by every party, published to the ledger with a verification anchor.',
    whySquadridge:
      'Community members can participate without fear of public exposure; government gets a verifiable record; the process is transparent without being a transcript.',
    recordSampleId: 'SQR-2024-0147',
    ctaLabel: 'Request access as a facilitator',
    ctaHref: '/request-access',
  },
  {
    sector: 'NGOs & peacebuilding teams',
    title: 'Sensitive internal deliberation',
    context:
      'A contested advocacy position must be worked through without putting staff or community members at risk. Contributors need to argue freely; the organisation still needs a record funders can trust.',
    inTheRoom:
      'A structured written deliberation among verified staff and partners. Contributions are visible only inside the room; identities are never disclosed publicly.',
    releasedRecord:
      'A verifiable record of the agreed position — evidence of a rigorous process for funders and partners, with no transcript that could be turned against the room.',
    whySquadridge:
      'Staff are never put at risk by their own participation; the funder gets evidence of process without a transcript that could be weaponized.',
    ctaLabel: 'Talk to us',
    ctaHref: '/request-access',
  },
  {
    sector: 'Cross-border & Track II dialogue',
    title: 'Civil-society dialogue across a conflict line',
    context:
      'Civil-society groups from parties in conflict need a facilitated exchange where meeting in person or on camera is unsafe or impossible. Distance and time zones add complexity; exposure adds risk.',
    inTheRoom:
      'Facilitator-led written exchange between verified representatives. All dialogue happens in the protected messaging room — structured rounds, facilitator control, no calls.',
    releasedRecord:
      'A shareable communiqué or statement of common ground, released only on facilitator sign-off and anchored so any reader can confirm it is unaltered.',
    whySquadridge:
      'Parties speak freely knowing nothing is recorded; the communiqué is verifiable without revealing who said what.',
    ctaLabel: 'Request pilot access',
    ctaHref: '/request-access',
  },
  {
    sector: 'Implementation & monitoring',
    title: 'Post-agreement implementation monitoring',
    context:
      'After an agreement is reached, parties need accountability without exposing internal reporting. Periodic check-ins must produce a credible public checkpoint.',
    inTheRoom:
      'Periodic written progress reports from verified parties, organised into a protected thread the facilitator moderates.',
    releasedRecord:
      "A verified implementation-status update on the ledger — a credible, tamper-evident checkpoint — without exposing the parties' internal reporting.",
    whySquadridge:
      'Creates a tamper-evident record of implementation without exposing which party reported what.',
    ctaLabel: 'See how it works',
    ctaHref: '/how-it-works',
  },
  {
    sector: 'Ombuds, HR & internal investigations',
    title: 'Sensitive workplace or institutional inquiry',
    context:
      'A workplace complaint or institutional inquiry requires structured fact-finding. The investigator needs a defensible, anonymized record of what was gathered — without exposing individual contributors or creating a discoverable transcript.',
    inTheRoom:
      'Verified contributors submit written accounts in structured rounds. The ombuds or investigator facilitates; contributors are verified by role, not exposed by name.',
    releasedRecord:
      "A verified findings summary — the ombuds' approved conclusions, anchored and tamper-evident — without any individual's account attached. Defensible to HR, legal, and external reviewers.",
    whySquadridge:
      'Contributors speak without creating a discoverable transcript; investigators release only approved conclusions.',
    ctaLabel: 'Request pilot access',
    ctaHref: '/request-access',
  },
  {
    sector: 'Corporate ESG & board governance',
    title: 'Deliberations requiring an audit-grade record',
    context:
      'A board committee or ESG working group must deliberate on a contested issue and produce a decision record that satisfies auditors, regulators, or ESG raters — without leaking the deliberation itself.',
    inTheRoom:
      'Committee members deliberate in structured written rounds. Sensitive commercial or strategic reasoning stays inside the room.',
    releasedRecord:
      "A verified decision record — the committee's approved resolution, with metadata (date, participant count, scope) — anchored and independently verifiable. Satisfies audit-grade requirements without exposing deliberation content.",
    whySquadridge:
      'Deliberation stays private; auditors and regulators get a verifiable decision record without the room.',
    ctaLabel: 'Request pilot access',
    ctaHref: '/request-access',
  },
];
