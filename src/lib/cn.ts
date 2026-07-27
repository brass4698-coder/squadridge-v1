import { twMerge } from 'tailwind-merge';

/** Join class names; falsy values are omitted. Tailwind conflicts resolve left-to-right. */
export function cn(...parts: Array<string | undefined | false | null>): string {
  return twMerge(parts.filter(Boolean).join(' '));
}
