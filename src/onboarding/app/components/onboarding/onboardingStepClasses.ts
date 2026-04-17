/**
 * Shared visual rhythm for onboarding steps — copy is unchanged; classes tighten hierarchy and density.
 */
export const obH1 =
  'text-[1.25rem] sm:text-[1.375rem] font-semibold tracking-[-0.02em] leading-snug text-ink';
export const obBody = 'text-[0.8125rem] text-ink-secondary leading-[1.5]';
export const obLabel = 'text-[0.625rem] sm:text-[0.6875rem] font-semibold tracking-[0.14em] uppercase text-ink-muted';
export const obHelper = 'text-[0.6875rem] text-ink-muted leading-snug';
export const obQuote = 'border-l-2 border-teal/30 pl-2.5';
export const obStack = 'flex flex-col gap-3 sm:gap-3.5';

/** Vertical gap between step h1 and first body line — each step’s prior value × 0.8 */
export const obH1ToFirstLine = 'gap-[0.2rem] sm:gap-[0.3rem]'; // Mission (was gap-1 / gap-1.5)
export const obH1ToLead = 'gap-[0.3rem]'; // Identity & Placement title + lead (was gap-1.5)
export const obH1ToBlock = 'gap-[0.6rem]'; // Verification h1 → first block (was gap-3)
/** Rules: title → lead line — a little tighter than obH1ToBlock (0.6rem) */
export const obH1ToRulesLead = 'gap-[0.5rem]';
export const obH1ToDryRunLeads = 'gap-2'; // Dry run h1 → lead lines (was gap-2.5)
