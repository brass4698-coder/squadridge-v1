import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, type Database } from '../lib';

type PrefsRow = Database['public']['Tables']['user_notification_prefs']['Row'];

const DEFAULT_PREFS: Omit<PrefsRow, 'user_id' | 'updated_at'> = {
  in_app_session_alerts: true,
  in_app_publish_alerts: true,
  email_pilot_updates: false,
};

interface NotificationToggle {
  key: keyof typeof DEFAULT_PREFS;
  title: string;
  description: string;
  honesty?: string;
}

const TOGGLES: ReadonlyArray<NotificationToggle> = [
  {
    key: 'in_app_session_alerts',
    title: 'In-app session alerts',
    description:
      'Show a banner inside the app when a squad you are matched to needs attention (new draft, facilitator pause, archive).',
  },
  {
    key: 'in_app_publish_alerts',
    title: 'In-app publish alerts',
    description: 'Surface a small toast when a ledger proposal you voted on is published.',
  },
  {
    key: 'email_pilot_updates',
    title: 'Email — pilot updates',
    description: 'Occasional email about the pilot you are part of. Off by default.',
    honesty:
      'No delivery pipeline is wired in this build; the preference is recorded for future use.',
  },
];

/**
 * Notification preferences. Preferences-only in v1: no delivery system is
 * wired today. The in-app surfaces gate on these flags so toggling them off
 * silences the corresponding banners/toasts immediately.
 */
export function NotificationsSettingsPage() {
  const { supabase, session } = useAuth();
  const userId = session?.user?.id;
  const configured = isSupabaseConfigured();
  const queryClient = useQueryClient();

  const prefsQ = useQuery({
    queryKey: ['notification-prefs', userId],
    queryFn: async (): Promise<PrefsRow | null> => {
      if (!supabase || !userId) return null;
      const { data, error } = await supabase
        .from('user_notification_prefs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as PrefsRow | null;
    },
    enabled: configured && !!supabase && !!userId,
  });

  const [draft, setDraft] = useState(DEFAULT_PREFS);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (prefsQ.data) {
      setDraft({
        in_app_session_alerts: prefsQ.data.in_app_session_alerts,
        in_app_publish_alerts: prefsQ.data.in_app_publish_alerts,
        email_pilot_updates: prefsQ.data.email_pilot_updates,
      });
      setTouched(false);
    }
  }, [prefsQ.data]);

  const save = useMutation({
    mutationFn: async (values: typeof DEFAULT_PREFS): Promise<PrefsRow> => {
      if (!supabase || !userId) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('user_notification_prefs')
        .upsert({ user_id: userId, ...values }, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as PrefsRow;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notification-prefs', userId] });
      setTouched(false);
      toast.success('Notification preferences saved.');
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Could not save preferences.');
    },
  });

  if (!configured) {
    return (
      <p className="font-sans text-[0.9rem] text-slate-400">
        Notification preferences require a Supabase connection. Connect your project to enable these
        toggles.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="font-sans text-[0.9rem] leading-relaxed text-slate-400">
        Choose how SquadRidge notifies you about session activity. These toggles apply immediately
        to in-app surfaces. Email delivery is preferences-only in this build — see the per-toggle
        notes below.
      </p>

      {prefsQ.isError ? (
        <p
          className="rounded-lg border border-amber/30 bg-amber/5 px-4 py-3 font-sans text-[0.85rem] text-amber"
          role="alert"
        >
          Could not load your current preferences (
          {prefsQ.error instanceof Error ? prefsQ.error.message : 'error'}). Editing is disabled.
        </p>
      ) : null}

      <ul className="space-y-3">
        {TOGGLES.map((t) => (
          <li
            key={t.key}
            className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#0c121c] p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[0.95rem] font-semibold text-slate-100">{t.title}</p>
              <p className="mt-1 font-sans text-[0.85rem] leading-relaxed text-slate-400">
                {t.description}
              </p>
              {t.honesty ? (
                <p className="mt-1 font-mono text-[0.72rem] text-slate-500">{t.honesty}</p>
              ) : null}
            </div>
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-2">
              <span className="font-sans text-[0.78rem] text-slate-400">
                {draft[t.key] ? 'On' : 'Off'}
              </span>
              <input
                type="checkbox"
                checked={draft[t.key]}
                disabled={prefsQ.isLoading || prefsQ.isError || save.isPending}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, [t.key]: e.target.checked }));
                  setTouched(true);
                }}
                className="h-4 w-4 cursor-pointer accent-teal"
              />
            </label>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => save.mutate(draft)}
          disabled={!touched || save.isPending}
          className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-teal/45 bg-teal/15 px-4 font-heading text-[0.85rem] font-semibold text-teal-light transition-colors hover:border-teal/65 hover:bg-teal/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {save.isPending ? 'Saving…' : 'Save preferences'}
        </button>
        {touched ? (
          <span className="font-sans text-[0.78rem] text-amber">Unsaved changes.</span>
        ) : null}
      </div>
    </div>
  );
}
