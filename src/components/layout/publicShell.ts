/**
 * Shared horizontal bounds for the public marketing shell (header, context bar, footer).
 * Align with max-width 1200px and padding 16px / 24px / 32px at mobile / tablet / desktop.
 */
export const PUBLIC_SHELL_MAX_CLASS = 'max-w-[1200px]';

/** Horizontal padding only — pair with {@link PUBLIC_SHELL_MAX_CLASS} + centering. */
export const PUBLIC_SHELL_PAD_X_CLASS = 'px-4 md:px-6 lg:px-8';

/** `mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8` */
export const publicShellInnerClass = `mx-auto w-full ${PUBLIC_SHELL_MAX_CLASS} ${PUBLIC_SHELL_PAD_X_CLASS}`;

/** Reset semantic lists used for nav/footer columns — no markers or stray indentation. */
export const shellListResetClass = 'm-0 list-none p-0';
