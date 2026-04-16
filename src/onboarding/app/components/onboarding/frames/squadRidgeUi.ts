import { cn } from '../../ui/utils';

/** Primary text CTA — matches onboarding finalize / ghost nav ink. */
export const srPrimaryCta = cn(
  'inline-flex w-full items-center justify-center rounded-md border-0 bg-transparent px-6 py-3 font-sans text-[12px] font-semibold tracking-[0.02em] text-white shadow-none transition-[color,transform] duration-200 ease-out hover:scale-[1.02] hover:text-[color-mix(in_srgb,var(--color-onboarding-accent)_68%,#78716c)] active:text-[color-mix(in_srgb,var(--color-onboarding-accent)_78%,#78716c)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onboarding-accent/45 motion-reduce:transition-colors sm:w-auto sm:min-w-[min(100%,280px)] sm:text-[13px]',
);

export const srSecondaryLink = cn(
  'font-sans text-[11px] font-medium text-white/45 transition-colors hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onboarding-accent/40',
);

/** Inputs / textareas — visible edge + fill on dark glass (WCAG-friendly focus ring). */
export const srInputClass = cn(
  'min-h-[44px] rounded-md border border-solid border-white/32 bg-white/[0.09]',
  'text-white placeholder:text-white/45',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  'focus-visible:border-onboarding-accent/60 focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-onboarding-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-onboarding-bg',
);

export const srSelectTrigger = cn(
  srInputClass,
  'h-11 w-full justify-between gap-2 rounded-md border px-3 py-2 text-sm shadow-none',
);

export const srSelectContent = cn(
  'border-white/15 bg-[#0f1622] text-white shadow-onboarding-card',
);

/** Primary action in training / dry-run console (visible, bordered, glow). */
export const srConsolePrimary = cn(
  'inline-flex w-full items-center justify-center rounded-md border border-onboarding-accent/50 bg-onboarding-accent/[0.14] px-7 py-3 font-sans text-[12px] font-semibold tracking-[0.04em] text-white shadow-[0_0_24px_-8px_rgba(201,166,107,0.38)] transition-[color,transform,box-shadow,border-color] duration-200 ease-out hover:scale-[1.02] hover:border-onboarding-accent/70 hover:shadow-[0_0_32px_-6px_rgba(201,166,107,0.48)] active:scale-[1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onboarding-accent/55 motion-reduce:hover:scale-100 sm:w-auto sm:min-w-[min(100%,280px)] sm:text-[13px]',
);
