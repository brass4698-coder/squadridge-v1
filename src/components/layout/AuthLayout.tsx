import { type ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
      <div className="sr-glass-strong w-full max-w-md rounded-xl p-8">{children}</div>
    </div>
  );
}
