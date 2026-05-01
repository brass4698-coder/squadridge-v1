import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Join class names; falsy values are omitted and Tailwind conflicts are merged. */
export function cn(...parts: ClassValue[]): string {
  return twMerge(clsx(parts));
}
