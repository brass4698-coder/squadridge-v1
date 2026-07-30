import type { ImgHTMLAttributes } from 'react';

const WORDMARK_SRC = '/assets/mendguild.svg';

export type MENDguildWordmarkProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  alt?: string;
};

/** Horizontal wordmark from `public/assets/mendguild.svg`. Size with `className` (e.g. `h-8 w-auto`). */
export function MENDguildWordmark({
  alt = 'MENDguild',
  className,
  width = 442,
  height = 67,
  ...rest
}: MENDguildWordmarkProps) {
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
