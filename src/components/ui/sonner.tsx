import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--sr-glass-toast-bg)',
          '--normal-text': 'var(--sr-ink)',
          '--normal-border': 'var(--sr-glass-border)',
          '--border-radius': 'var(--sr-radius-lg)',
        } as CSSProperties
      }
      {...props}
    />
  );
}
