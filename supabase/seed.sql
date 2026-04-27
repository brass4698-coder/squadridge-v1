-- Optional seed data for local `supabase db reset`.
-- CI deploys schema via `supabase db push` only (migrations; seed is not applied remotely by default).
-- Demo rows so `/admin/csi` and CSI queries are non-empty after local reset.
-- RLS: seed runs with elevated privileges; the app still requires an authenticated session and a row in
-- `public.moderators` (your `auth.users` id) to SELECT CSI tables—add that via SQL Editor or dashboard if the UI is empty.

-- Fixed IDs keep escalation rows joinable to snapshots across resets.
INSERT INTO public.squads (id, topic, status, expires_at)
VALUES (
        'c0000000-0000-4000-8000-000000000001'::uuid,
        'Dev CSI demo squad (seed)',
        'active',
        (timezone('utc'::text, now()) + interval '1 year')
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.conflict_severity_snapshots (
    id,
    region_key,
    period_start,
    period_end,
    snapshot_at,
    csi_score,
    severity_band,
    sentiment_signal,
    grievance_signal,
    resource_signal,
    ingroup_outgroup_signal,
    escalation_velocity_signal,
    violence_normalization_signal,
    component_scores,
    top_grievances,
    squad_count,
    message_count,
    detected_escalation
)
VALUES
    (
        'b0000000-0000-4000-8000-000000000001'::uuid,
        'demo-na',
        timezone('utc'::text, now()) - interval '7 days',
        timezone('utc'::text, now()),
        timezone('utc'::text, now()) - interval '1 hour',
        42,
        'green',
        35,
        40,
        30,
        25,
        20,
        15,
        '{"version":1,"rollups":{}}'::jsonb,
        '[{"theme": "coordination", "weight": 0.4}, {"theme": "resource_fairness", "weight": 0.3}]'::jsonb,
        2,
        120,
        false
    ),
    (
        'b0000000-0000-4000-8000-000000000002'::uuid,
        'demo-eu',
        timezone('utc'::text, now()) - interval '7 days',
        timezone('utc'::text, now()),
        timezone('utc'::text, now()) - interval '30 minutes',
        78,
        'yellow',
        72,
        80,
        65,
        70,
        75,
        68,
        '{"version":1,"rollups":{}}'::jsonb,
        '[{"theme": "ingroup_outgroup", "weight": 0.55}]'::jsonb,
        1,
        45,
        true
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.escalation_alerts (
    id,
    squad_id,
    region_key,
    csi_score,
    severity_level,
    triggered_at,
    recommended_action,
    source_snapshot_id,
    metadata
)
VALUES (
        'd0000000-0000-4000-8000-000000000001'::uuid,
        'c0000000-0000-4000-8000-000000000001'::uuid,
        'demo-eu',
        78,
        'yellow',
        timezone('utc'::text, now()) - interval '20 minutes',
        'Route to on-call mediator; offer de-escalation prompt in squad.',
        'b0000000-0000-4000-8000-000000000002'::uuid,
        '{"seed": true}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;
