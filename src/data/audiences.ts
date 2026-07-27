export interface AudienceCard {
  tag: string;
  label: string;
  body: string;
}

/** Homepage "Built for" — three audience types; full scenarios live on /use-cases. */
export const audiences: AudienceCard[] = [
  {
    tag: 'Primary',
    label: 'Mediators & facilitators',
    body: 'Run contentious sessions where parties speak freely, knowing nothing said in the room is published. Release a single citable joint statement with the line between conversation and record under your control.',
  },
  {
    tag: 'Secondary',
    label: 'NGOs & peacebuilding teams',
    body: 'Document deliberations without exposing individuals who took part. Give funders and partners a verifiable record of what was agreed — evidence of impact without a transcript that could be turned against the room.',
  },
  {
    tag: 'Also',
    label: 'Government, ombuds & governance',
    body: 'Convene sensitive negotiations, inquiries, or board deliberations that need an audit-grade record — without leaking who said what inside the room.',
  },
];
