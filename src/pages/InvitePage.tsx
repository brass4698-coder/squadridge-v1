import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AccountPageShell, AccountPanel } from '../components/auth/AccountPageShell';

/**
 * Access gate for invite-based entry: code in URL or typed here; then sign in to continue.
 */
export function InvitePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fromQuery = searchParams.get('code') ?? '';
  const [code, setCode] = useState(fromQuery);
  const trimmed = code.trim();
  const findSquadWithInvite = trimmed
    ? `/find-squad?${new URLSearchParams({ code: trimmed }).toString()}`
    : null;
  const signInTo = findSquadWithInvite
    ? `/sign-in?next=${encodeURIComponent(findSquadWithInvite)}`
    : '/sign-in';

  return (
    <AccountPageShell>
      <AccountPanel>
        <h1 className="font-heading text-xl font-semibold text-slate-100">You&apos;re invited</h1>
        <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-slate-400">
          Enter the invite or access code you were given. This gate exists so sensitive flows are
          not open to the whole web before you sign in.
        </p>
        <label className="mt-4 block font-sans text-[0.75rem] font-medium uppercase tracking-wide text-slate-500">
          Invite code
          <input
            type="text"
            name="inviteCode"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set('code', e.target.value);
              else next.delete('code');
              setSearchParams(next, { replace: true });
            }}
            className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#0a1018] px-3 py-2.5 font-sans text-[0.95rem] text-slate-100 placeholder:text-slate-600"
            placeholder="e.g. cohort-pilot-2026"
            autoComplete="one-time-code"
          />
        </label>
        <Link
          to={signInTo}
          className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-teal font-heading text-[0.95rem] font-semibold text-[#0b0f1a]"
        >
          Continue to sign in
        </Link>
        <p className="mt-4 text-center font-sans text-[0.8rem] text-slate-500">
          <Link to="/" className="text-teal-light underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </AccountPanel>
    </AccountPageShell>
  );
}
