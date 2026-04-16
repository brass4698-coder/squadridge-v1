import type { ImgHTMLAttributes } from 'react';

const WORDMARK_SRC = '/assets/squadridge.svg';

export type SquadRidgeWordmarkProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  alt?: string;
};

/** Horizontal wordmark from `public/assets/squadridge.svg`. Size with `className` (e.g. `h-8 w-auto`). */
export function SquadRidgeWordmark({
  alt = 'SquadRidge',
  className,
  width = 442,
  height = 67,
  ...rest
}: SquadRidgeWordmarkProps) {
  return (
    <img
      src={WORDMARK_SRC}
      alt={alt}
      width={width}
      height={height}
      className={className}
      decoding="async"
      {...rest}
    />
  );
}
