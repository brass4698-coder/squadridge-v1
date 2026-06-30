// ============================================================
// SessionLoader — full-page loading state
// ============================================================
import React from 'react';

export function SessionLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sq-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-sq-primary border-t-transparent animate-spin" />
        <p className="text-sq-muted text-sm">Loading…</p>
      </div>
    </div>
  );
}
