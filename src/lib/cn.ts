/**
 * cn — class name utility.
 *
 * Merges Tailwind classes safely using clsx + tailwind-merge.
 * Eliminates conflicting utility class duplicates.
 *
 * @example
 * cn('px-4 py-2', condition && 'bg-primary', 'px-6') // 'py-2 bg-primary px-6'
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
