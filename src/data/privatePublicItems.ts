/** Canonical lines for the room ↔ record signature split. */
export const privatePublicItems = {
  private: [
    'Verified participants — invite-only, facilitator-approved entry',
    'Structured written rounds, pacing tools, and process oversight',
    'Facilitator notes and private signals stay internal',
    'Consensus drafted after dialogue — not imported from chat',
    'No public transcript is generated',
  ],
  public: [
    'Facilitator-authored outcome text only (summary, terms, pending items)',
    'Designated approvals recorded before release',
    'Limited metadata — never who said what',
    'SHA-256 integrity anchor anyone can recompute',
  ],
};
