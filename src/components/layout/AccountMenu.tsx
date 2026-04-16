import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { isSupabaseConfigured } from '../../lib/env';

export function AccountMenu() {
  const { session, loading: authLoading, signOut } = useAuth();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (authLoading) {
    return (
      <span className="inline-flex min-h-[36px] min-w-[5rem] items-center justify-end font-sans text-[0.8rem] text-[#4b5563]">
        …
      </span>
    );
  }

  if (!session) {
    return (
      <Link
        to="/sign-in"
        className="inline-flex min-h-[36px] items-center justify-center rounded-[8px] border border-[#2d3f55] bg-transparent px-3 py-1.5 font-sans text-[0.85rem] font-medium text-[#a8b2c1] transition-colors hover:border-[#3d4f63] hover:text-[#e2e8f0]"
      >
        Sign in
      </Link>
    );
  }

  const label = profile?.callsign?.trim() || session.user?.email?.split('@')[0] || 'Operator';

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        className="inline-flex max-w-[14rem] items-center gap-2 rounded-[8px] border border-[#2d3f55] bg-[#0f1623]/80 px-3 py-1.5 font-sans text-[0.85rem] font-medium text-[#e2e8f0] transition-colors hover:border-[#3d4f63]"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{label}</span>
        <span className="text-[#6b7280]" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-[100] min-w-[12rem] rounded-[8px] border border-[#1a2236] bg-[#0c101c] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <Link
            role="menuitem"
            to="/settings/profile"
            className="block px-4 py-2.5 font-sans text-[0.85rem] text-[#c4cdd9] transition-colors hover:bg-[#141c2e] hover:text-[#f1f5f9]"
            onClick={() => setOpen(false)}
          >
            Profile &amp; keys
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-2.5 text-left font-sans text-[0.85rem] text-[#c4cdd9] transition-colors hover:bg-[#141c2e] hover:text-[#f1f5f9]"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
