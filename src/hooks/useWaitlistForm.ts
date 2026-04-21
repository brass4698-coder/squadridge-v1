import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { getSupabase, getWaitlistFormUrl, isSupabaseConfigured } from '../lib';
import { WAITLIST_CHANGED_EVENT } from '../components/HeroWaitlistCounter';

export type WaitlistFormStatus = 'idle' | 'loading' | 'success' | 'error';

export function useWaitlistForm() {
  const externalUrl = getWaitlistFormUrl();
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState('');
  const [roleHint, setRoleHint] = useState('');
  const [status, setStatus] = useState<WaitlistFormStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await getSupabase().rpc('waitlist_signup_count');
      if (cancelled || error || data == null) return;
      const count = typeof data === 'number' ? data : Number.parseInt(String(data), 10);
      if (Number.isFinite(count)) setWaitlistCount(Math.max(0, count));
    })();
    return () => {
      cancelled = true;
    };
  }, [configured]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trap = (
        e.currentTarget.elements.namedItem('website') as HTMLInputElement | null
      )?.value?.trim();
      if (trap) return;

      const trimmed = email.trim();
      if (!trimmed) return;

      const role = roleHint.trim();
      if (!role) {
        setFeedback('Choose your role so we can match outreach to your background.');
        setStatus('error');
        return;
      }

      if (!configured) {
        setFeedback('Waitlist capture needs Supabase env vars or an external form URL.');
        setStatus('error');
        return;
      }

      setStatus('loading');
      setFeedback(null);

      try {
        const { error } = await getSupabase()
          .from('waitlist_signups')
          .insert({ email: trimmed, role_hint: role });
        if (error) {
          if (error.code === '23505') {
            setFeedback("You're already on the list. We'll be in touch.");
            setStatus('success');
          } else {
            setFeedback(error.message);
            setStatus('error');
          }
          return;
        }

        setStatus('success');
        setFeedback("Thanks - you're on the list.");
        setEmail('');
        setRoleHint('');
        window.dispatchEvent(new Event(WAITLIST_CHANGED_EVENT));

        const { data } = await getSupabase().rpc('waitlist_signup_count');
        if (data != null) {
          const count = typeof data === 'number' ? data : Number.parseInt(String(data), 10);
          if (Number.isFinite(count)) setWaitlistCount(Math.max(0, count));
        }
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : 'Something went wrong.');
        setStatus('error');
      }
    },
    [configured, email, roleHint],
  );

  return {
    email,
    setEmail,
    roleHint,
    setRoleHint,
    status,
    feedback,
    handleSubmit,
    waitlistCount,
    configured,
    externalUrl,
  };
}
