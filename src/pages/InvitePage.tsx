import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AccountPageShell, AccountPanel } from '../components/auth/AccountPageShell';
import { useAuth } from '../contexts/AuthContext';
import {
  buildInviteContinuationPath,
  claimInviteCode,
  clearPendingInviteCode,
  getPendingInviteCode,
  normalizeInviteCode,
  queryKeys,
  setPendingInviteCode,
} from '../lib';
import { useInviteClaim } from '../hooks';

function safeContinuePath(raw: string | null): string {
  if (!raw) return '/find-squad';
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith('/') && !decoded.startsWith('//') && decoded !== '/invite')
      return decoded;
  } catch {
    /* ignore */
  }
  return '/find-squad';
}

/**
 * Invite access now redeems a real server-side invite claim before matchmaking.
 */
export function InvitePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { supabase, session, loading: authLoading } = useAuth();
  const inviteClaimQuery = useInviteClaim();
  const [searchParams, setSearchParams] = useSearchParams();
  const continuePath = safeContinuePath(searchParams.get('continue'));
  const initialCode = normalizeInviteCode(searchParams.get('code') ?? getPendingInviteCode() ?? '');
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const autoClaimAttempted = useRef(false);

  useEffect(() => {
    const nextCode = normalizeInviteCode(searchParams.get('code') ?? getPendingInviteCode() ?? '');
    setCode(nextCode);
  }, [searchParams]);

  useEffect(() => {
    if (code) setPendingInviteCode(code);
  }, [code]);

  const trimmed = normalizeInviteCode(code);
  const signInTo = useMemo(() => {
    const nextPath = trimmed
      ? buildInviteContinuationPath(trimmed, continuePath)
      : buildInviteContinuationPath('', continuePath);
    return `/sign-in?next=${encodeURIComponent(nextPath)}`;
  }, [trimmed, continuePath]);

  const claimMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      return claimInviteCode(supabase, inviteCode);
    },
    onSuccess: async (claim) => {
      clearPendingInviteCode();
      setError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.inviteClaim(session?.user?.id) });
      toast.success(`Invite accepted for ${claim.cohort_label}.`);
      navigate(continuePath, { replace: true });
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
    },
  });

  useEffect(() => {
    if (
      !session ||
      !trimmed ||
      authLoading ||
      claimMutation.isPending ||
      autoClaimAttempted.current
    ) {
      return;
    }
    autoClaimAttempted.current = true;
    claimMutation.mutate(trimmed);
  }, [authLoading, claimMutation, session, trimmed]);

  const activeClaim = inviteClaimQuery.data;
  const busy = claimMutation.isPending || inviteClaimQuery.isLoading;

  return (
    <AccountPageShell>
      <AccountPanel>
        <h1 className="font-heading text-xl font-semibold text-slate-100">You&apos;re invited</h1>
        <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-slate-400">
          Pilot access is cohort-scoped now: sign in, redeem the invite record, and we&apos;ll bind
          matchmaking to that cohort before you continue.
        </p>

        {activeClaim ? (
          <div className="mt-4 rounded-lg border border-teal/25 bg-teal/[0.06] px-4 py-3 font-sans text-[0.85rem] text-[#b9f4ec]">
            Active cohort: <span className="font-semibold">{activeClaim.cohort_label}</span>
            {activeClaim.invite_expires_at ? (
              <span className="block pt-1 text-[0.78rem] text-[#8fdcd0]">
                Invite expires {new Date(activeClaim.invite_expires_at).toLocaleString()}.
              </span>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p
            className="mt-4 rounded-lg border border-amber/30 bg-amber/[0.06] px-4 py-3 font-sans text-[0.85rem] text-[#fcd9a8]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <label className="mt-4 block font-sans text-[0.75rem] font-medium uppercase tracking-wide text-slate-500">
          Invite code
          <input
            type="text"
            name="inviteCode"
            value={code}
            onChange={(e) => {
              const nextValue = normalizeInviteCode(e.target.value);
              setCode(nextValue);
              const next = new URLSearchParams(searchParams);
              if (nextValue) next.set('code', nextValue);
              else next.delete('code');
              if (continuePath !== '/find-squad') next.set('continue', continuePath);
              setSearchParams(next, { replace: true });
              autoClaimAttempted.current = false;
            }}
            className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#0a1018] px-3 py-2.5 font-sans text-[0.95rem] text-slate-100 placeholder:text-slate-600"
            placeholder="e.g. cohort-pilot-2026"
            autoComplete="one-time-code"
          />
        </label>

        {session ? (
          <button
            type="button"
            disabled={!trimmed || busy}
            onClick={() => {
              setError(null);
              autoClaimAttempted.current = true;
              claimMutation.mutate(trimmed);
            }}
            className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-teal font-heading text-[0.95rem] font-semibold text-[#0b0f1a] disabled:opacity-50"
          >
            {busy ? 'Validating invite…' : 'Validate invite'}
          </button>
        ) : (
          <Link
            to={signInTo}
            className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-teal font-heading text-[0.95rem] font-semibold text-[#0b0f1a]"
          >
            Continue to sign in
          </Link>
        )}

        <p className="mt-4 text-center font-sans text-[0.8rem] text-slate-500">
          <Link to="/" className="text-teal-light underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </AccountPanel>
    </AccountPageShell>
  );
}
