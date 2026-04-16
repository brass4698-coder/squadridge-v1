import { cloneElement, isValidElement, type ReactElement } from 'react';
import { cn } from '../ui/utils';
import { ACCENT_AMBER, PRINCIPLE_ICON_SIZE, PRINCIPLE_ICON_STROKE_WIDTH } from './tokens';

export type PrincipleIconProps = {
  size?: number;
  color?: string;
  className?: string;
};

const frameGradientClass =
  'inline-flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,rgba(237,180,90,0.22)_0%,rgba(0,0,0,0)_70%)]';

export interface IconFrameProps {
  /** Box size in px; cloned icon receives the same `size` prop. */
  size?: number;
  /** Principle icon — receives `size`, `color: ACCENT_AMBER`, and merged `className`. */
  children: ReactElement<PrincipleIconProps>;
  className?: string;
  iconClassName?: string;
}

/**
 * Shell for principle-row icons: `ACCENT_AMBER`, radial glow, and consistent `size`.
 * Stroke width stays in each SVG via `PRINCIPLE_ICON_STROKE_WIDTH` from `./tokens`.
 * Row enter animation lives on `PrincipleTimeline`’s `motion.li`.
 */
export function IconFrame({ size = PRINCIPLE_ICON_SIZE, children, className, iconClassName }: IconFrameProps) {
  if (!isValidElement(children)) {
    return children;
  }

  const child = children as ReactElement<PrincipleIconProps>;
  const merged = cloneElement(child, {
    size,
    color: ACCENT_AMBER,
    className: cn(child.props.className, iconClassName),
  });

  return (
    <div className={cn(frameGradientClass, className)} style={{ width: size, height: size }}>
      {merged}
    </div>
  );
}

/** @see IconFrame */
export const BaseIcon = IconFrame;

export { ACCENT_AMBER, PRINCIPLE_ICON_SIZE, PRINCIPLE_ICON_STROKE_WIDTH };
