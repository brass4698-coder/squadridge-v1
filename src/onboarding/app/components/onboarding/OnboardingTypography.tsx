/**
 * Shared onboarding type + spacing rhythm. Use with `className={cn(...)}`.
 */

/**
 * Descriptor line under the orientation header — same tier as step 1 “Three principles”
 * (below badge, above manifesto H1). Use `uppercase` in addition for short labels only.
 */
export const obEyebrowUnderBadge =
  'mt-2 font-sans text-[9px] font-medium tracking-[0.1em] text-white/30';

/** Step 1 “Three principles” (uppercase micro-label). */
export const obLabelQuiet = `${obEyebrowUnderBadge} uppercase tracking-[0.11em]`;

/** @deprecated Use obEyebrowUnderBadge — kept for any stray imports. */
export const obSubtitle =
  'mt-2 mb-0 font-sans text-[9px] font-medium tracking-[0.1em] text-white/30';

/** Primary page title — same scale on every step (matches step 1 manifesto). */
export const obH1Hero =
  'font-heading text-[1.85rem] font-bold leading-[1.12] tracking-[-0.02em] text-white sm:text-4xl md:text-5xl md:leading-[1.08] lg:text-[3.15rem]';

/** Vertical gap after H1 before body. */
export const obAfterH1 = 'mb-10 md:mb-11';

/** Body column: comfortable measure + spacing between paragraphs. */
export const obBody = 'font-sans max-w-prose text-[15px] leading-relaxed sm:text-[17px]';

export const obBodyMuted = 'text-white/70';
export const obBodyStandard = 'text-white/68';

/** Body paragraphs under H1 — same treatment as step 1 on all steps. */
export const obBodyStack = `space-y-5 mb-10 ${obBody} ${obBodyMuted}`;

/** @deprecated Alias of obBodyStack (single body style site-wide). */
export const obBodyStackStep1 = obBodyStack;

/** Comfort / footnote line (step 1). */
export const obFootnote =
  'mt-1 mb-10 font-sans text-[13px] leading-relaxed text-white/42 md:text-sm';
