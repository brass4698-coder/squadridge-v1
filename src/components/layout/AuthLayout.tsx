import { type ReactNode } from 'react';
import { FormPanel } from '../ui/FormPanel';

/**
 * Compact auth card — thin wrapper around FormPanel for centered magic-link / invite flows.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="sr-form-atmosphere flex min-h-[70vh] items-center justify-center px-6 py-12">
      <FormPanel className="w-full max-w-md">{children}</FormPanel>
    </div>
  );
}
