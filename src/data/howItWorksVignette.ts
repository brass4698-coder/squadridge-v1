export interface HowItWorksVignetteStep {
  label: string;
  title: string;
  body: string;
  stage: 'Configure' | 'Verify' | 'Facilitate' | 'Release';
}

/**
 * End-to-end operational vignette — facilitator path from setup to verification.
 * Keep honest: release is deliberate; room dialogue never auto-publishes.
 */
export const howItWorksVignette = {
  eyebrow: 'Day in the life',
  heading: 'One mediation, start to finish',
  lede: 'You are mediating a contested land-use matter. Here is the operational path SquadRidge holds — from facilitator setup through an anchored outcome outsiders can verify.',
  outcome:
    'A Joint Statement of Principles on the public ledger, with a verification anchor anyone can check — without naming who said what in the room.',
  steps: [
    {
      label: '1',
      stage: 'Configure',
      title: 'Facilitator onboarding and session creation',
      body: 'Your organisation receives role-scoped access. You create a session: scope, eligibility notes, invite rules, and whether the approved outcome may later appear on the public ledger (private anchored memo is the pilot default).',
    },
    {
      label: '2',
      stage: 'Configure',
      title: 'Participant invitation',
      body: 'You issue unique invite credentials for each party (codenames, not public identities). Invite links are bearer secrets with a time bound — handed off through channels the parties already trust.',
    },
    {
      label: '3',
      stage: 'Verify',
      title: 'Verification before the room opens',
      body: 'Parties complete facilitator-defined verification materials. You review and approve entry. The live room stays closed until required participants are verified.',
    },
    {
      label: '4',
      stage: 'Facilitate',
      title: 'Facilitated written dialogue',
      body: 'You open structured text rounds under process control — pacing tools, facilitator prompts, and private signals. Dialogue stays inside the room. Nothing becomes a transcript or auto-exports.',
    },
    {
      label: '5',
      stage: 'Facilitate',
      title: 'Outcome drafting (separate from the room)',
      body: 'When the matter is ready, you author the outcome in a dedicated workspace: summary, agreed terms, and pending items. There is no “import from chat” path — the record must not contain verbatim room dialogue.',
    },
    {
      label: '6',
      stage: 'Release',
      title: 'Facilitator approval gate',
      body: 'Designated approvals are recorded as process metadata. Release is an explicit facilitator action after those confirmations — never timed, webhooked, or defaulted.',
    },
    {
      label: '7',
      stage: 'Release',
      title: 'Ledger publication (when consented)',
      body: 'If the session was configured for public release and partners consent, the approved instrument appears on the integrity registry. Private NGO pilots can keep the anchored memo internal-only.',
    },
    {
      label: '8',
      stage: 'Release',
      title: 'Verification anchor generation',
      body: 'At release, the platform records a SHA-256 integrity hash of the canonicalised approved text (ledger_sha). Outside parties can recompute the hash against the published instrument — they cannot recover room dialogue or participant identities from it.',
    },
  ] satisfies HowItWorksVignetteStep[],
};

/** Facilitator workspace answers — honest product surface, not marketing gloss. */
export const FACILITATOR_WORKSPACE = [
  {
    title: 'Capturing emerging consensus',
    body: 'Consensus is captured by facilitator-authored outcome fields after the dialogue, not by highlighting chat lines. You draft the releasable instrument in your own words; parties confirm the text through the approval gate.',
  },
  {
    title: 'Private notes vs. draft outcomes',
    body: 'Facilitator notes stay on the outcome record as internal process metadata and are not published. Summary, agreed terms, and pending items are the only fields that can leave the room — and only after deliberate release.',
  },
  {
    title: 'What the live room is for',
    body: 'The control surface is for structured written rounds, pacing (Slow down / Pull back), and process oversight. It is not a public feed and not an export pipeline into the ledger.',
  },
] as const;
