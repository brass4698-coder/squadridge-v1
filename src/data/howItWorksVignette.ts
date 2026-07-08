export interface HowItWorksVignetteStep {
  label: string;
  title: string;
  body: string;
  stage: 'Configure' | 'Verify' | 'Facilitate' | 'Release';
}

export const howItWorksVignette = {
  eyebrow: 'Day in the life',
  heading: 'One mediation, start to finish',
  lede: 'A regional facilitator runs a contested land-use dialogue. Here is what SquadRidge holds apart — and what becomes verifiable when the session ends.',
  outcome:
    'A Joint Statement of Principles on the public ledger, with a verification anchor anyone can check — without naming who said what in the room.',
  steps: [
    {
      label: '1',
      stage: 'Configure',
      title: 'Set the rules before anyone enters',
      body: 'The facilitator defines eligibility, verification requirements, and what kind of outcome may be released. Invite links go out through channels the parties already trust.',
    },
    {
      label: '2',
      stage: 'Verify',
      title: 'Parties verify privately; the room stays closed',
      body: 'Residents, authorities, and community organisations complete verification on their own. Identities are confirmed to the facilitator — not published, not attributed in any future record.',
    },
    {
      label: '3',
      stage: 'Facilitate',
      title: 'Structured written dialogue in a protected room',
      body: 'The facilitator opens text-based rounds. Each party responds in writing at its own pace. Nothing said in the room becomes a transcript — dialogue stays private to verified participants.',
    },
    {
      label: '4',
      stage: 'Release',
      title: 'Approved outcome only — anchored and public',
      body: 'Parties co-write a Joint Statement of Principles, approve the text, and the facilitator releases it. The ledger shows the outcome and a cryptographic anchor — not who contributed which line.',
    },
  ] satisfies HowItWorksVignetteStep[],
};
