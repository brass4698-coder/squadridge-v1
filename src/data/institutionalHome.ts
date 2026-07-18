/** Copy and structured content for the mediator-focused marketing homepage. */

export const TRUST_INDICATORS = [
  'Facilitator-led process control',
  'Room and record architecturally separated',
  'Tamper-evident release anchoring',
  'Invite-only participant access',
  'Metadata audit trail (no message bodies)',
  'Honest security boundaries documented',
] as const;

export const CONFIDENTIALITY_POINTS = [
  {
    title: 'What enters the room',
    body: 'Verified parties join a structured written session under your oversight — written rounds, facilitator prompts, and private signals to you.',
  },
  {
    title: 'Who can participate',
    body: 'Invite-only tokens, facilitator review, and role-bound access. Identity is verified privately — not disclosed on the public record.',
  },
  {
    title: 'What stays private',
    body: 'Session room content is never auto-published. Raw dialogue does not appear on the ledger, in exports, or in public metadata.',
  },
] as const;

export const VERIFICATION_POINTS = [
  {
    title: 'What is released',
    body: 'Only facilitator-approved outcome text and limited metadata (organisation, date, participant count) become public.',
  },
  {
    title: 'What can be verified',
    body: 'Released records carry a verification anchor that lets outside parties confirm publication integrity.',
  },
  {
    title: 'Who authorises release',
    body: 'Release is a deliberate facilitator action after recorded approvals — never timed, automated, or condition-triggered.',
  },
] as const;

export const PRODUCT_MECHANICS = [
  {
    step: '01',
    title: 'Configure',
    body: 'You set session scope, participant invites, and verification requirements before dialogue begins.',
  },
  {
    step: '02',
    title: 'Verify',
    body: 'Parties complete facilitator-defined verification. Approval is explicit before room access.',
  },
  {
    step: '03',
    title: 'Facilitate',
    body: 'Structured written dialogue under your control — pause, end, and oversight built into the workflow.',
  },
  {
    step: '04',
    title: 'Release',
    body: 'Approvals recorded, outcome drafted without room import, then published with a tamper-evident anchor.',
  },
] as const;

export const WHY_IT_MATTERS = [
  'Formal mediation where parties need a protected room and institutions need a credible outcome',
  'Multi-party or multi-institution matters where process control and auditability are critical',
  'City community safety offices coordinating community-led violence prevention partners',
  'Cross-border dialogue where attribution sensitivity is high',
  'NGO and institutional pilots needing defensible records without publishing dialogue',
] as const;

export const OPERATIONAL_CONTEXTS = [
  {
    label: 'Mediation & dispute resolution',
    body: 'Professional mediators run structured written rounds with verified parties, then release only an approved agreement or statement of principles — without a transcript.',
  },
  {
    label: 'Restorative & de-escalation processes',
    body: 'Facilitation teams keep high-tension dialogue inside a governed room and produce a releasable summary of next steps when the process calls for it.',
  },
  {
    label: 'City community safety',
    body: 'Municipal offices convene verified community partners for structured coordination — intervention proposals, ranked shortlists, and action commitment records funders can verify.',
  },
  {
    label: 'Ombuds & institutional inquiry',
    body: 'Structured fact-finding with role-verified contributors and a defensible findings summary — without exposing individual accounts on the public record.',
  },
] as const;

export const FLAGSHIP_WORKFLOW = {
  label: 'Core architecture',
  title: 'Private session → approval gate → public record',
  body: 'You keep dialogue inside a protected mediation room. When the process is ready, you approve an outcome and release it with verifiable provenance — never a raw transcript.',
  steps: [
    { name: 'Access', detail: 'Invite-only parties; you verify standing before room entry.' },
    {
      name: 'Facilitate',
      detail: 'Structured written rounds under your control — not open chat or calls.',
    },
    { name: 'Approve', detail: 'Designated approvers sign off before anything leaves the room.' },
    {
      name: 'Release',
      detail: 'Approved outcome published with a verification anchor — no room transcript.',
    },
  ],
} as const;

export const SECURITY_POSTURE = [
  'Access-controlled rooms with role-bound RLS',
  'Release blocked without required approvals',
  'Verbatim room-content guard on outcome publish',
  'Documented operator-readable boundaries (not overclaimed E2E)',
  'Threat model and readiness materials available for diligence',
] as const;
