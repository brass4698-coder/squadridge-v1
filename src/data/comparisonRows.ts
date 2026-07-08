export interface ComparisonRow {
  aspect: string;
  squadridge: string;
  others: string;
}

export const comparisonRows: ComparisonRow[] = [
  {
    aspect: 'Session content',
    squadridge: 'Protected. Never published.',
    others: 'Exposed and retained by default',
  },
  {
    aspect: 'Participant identity',
    squadridge: 'Verified privately',
    others: 'Often visible to others',
  },
  {
    aspect: 'Public surface',
    squadridge: 'Approved outcome only',
    others: 'Full thread or transcript leaks',
  },
  {
    aspect: 'Release authority',
    squadridge: 'Facilitator-controlled',
    others: 'Informal, hard to govern',
  },
  {
    aspect: 'Auditability',
    squadridge: 'Anchor on each record',
    others: 'Little or no verification',
  },
];
