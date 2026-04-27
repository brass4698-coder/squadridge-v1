-- Conflict Severity Index (CSI): regional snapshots + squad-level escalation rows.
-- Writes: service_role (Edge, cron, batch). Reads: public.moderators (RLS) + service_role.

CREATE TABLE public.conflict_severity_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    region_key text NOT NULL,
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    snapshot_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    csi_score smallint NOT NULL,
    severity_band text NOT NULL,
    sentiment_signal smallint NOT NULL,
    grievance_signal smallint NOT NULL,
    resource_signal smallint NOT NULL,
    ingroup_outgroup_signal smallint NOT NULL,
    escalation_velocity_signal smallint NOT NULL,
    violence_normalization_signal smallint NOT NULL,
    component_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
    top_grievances jsonb NOT NULL DEFAULT '[]'::jsonb,
    squad_count integer NOT NULL DEFAULT 0,
    message_count integer NOT NULL DEFAULT 0,
    detected_escalation boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT conflict_severity_snapshots_csi_score_check CHECK (
        csi_score >= 0
        AND csi_score <= 100
    ),
    CONSTRAINT conflict_severity_snapshots_severity_band_check CHECK (
        severity_band IN ('green', 'yellow', 'red')
    ),
    CONSTRAINT conflict_severity_snapshots_component_0_100_check CHECK (
        sentiment_signal >= 0
        AND sentiment_signal <= 100
        AND grievance_signal >= 0
        AND grievance_signal <= 100
        AND resource_signal >= 0
        AND resource_signal <= 100
        AND ingroup_outgroup_signal >= 0
        AND ingroup_outgroup_signal <= 100
        AND escalation_velocity_signal >= 0
        AND escalation_velocity_signal <= 100
        AND violence_normalization_signal >= 0
        AND violence_normalization_signal <= 100
    ),
    CONSTRAINT conflict_severity_snapshots_period_check CHECK (period_start < period_end)
);

CREATE INDEX conflict_severity_snapshots_region_time_idx ON public.conflict_severity_snapshots (region_key, snapshot_at DESC);

CREATE INDEX conflict_severity_snapshots_period_idx ON public.conflict_severity_snapshots (region_key, period_start, period_end);

COMMENT ON TABLE public.conflict_severity_snapshots IS 'CSI regional rollups; see docs/product/conflict-severity-index.md. Ingested by trusted workers.';

COMMENT ON COLUMN public.conflict_severity_snapshots.component_scores IS 'Full component breakdown + optional trace (JSON), aligned with src/lib/conflictSeverityIndex.ts.';

COMMENT ON COLUMN public.conflict_severity_snapshots.top_grievances IS 'Top grievance themes for the window, e.g. [{ "theme", "weight" }].';

CREATE TABLE public.escalation_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    squad_id uuid NOT NULL REFERENCES public.squads (id) ON DELETE CASCADE,
    region_key text,
    csi_score smallint,
    severity_level text NOT NULL,
    triggered_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    recommended_action text NOT NULL DEFAULT '',
    source_snapshot_id uuid REFERENCES public.conflict_severity_snapshots (id) ON DELETE SET NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT escalation_alerts_csi_check CHECK (
        csi_score IS NULL
        OR (
            csi_score >= 0
            AND csi_score <= 100
        )
    ),
    CONSTRAINT escalation_alerts_severity_check CHECK (severity_level IN ('green', 'yellow', 'red'))
);

CREATE INDEX escalation_alerts_squad_triggered_idx ON public.escalation_alerts (squad_id, triggered_at DESC);

CREATE INDEX escalation_alerts_region_triggered_idx ON public.escalation_alerts (region_key, triggered_at DESC)
WHERE
    region_key IS NOT NULL;

COMMENT ON TABLE public.escalation_alerts IS 'Squad-scoped triage for mediators; not public alerts. RLS: moderators read.';

ALTER TABLE public.conflict_severity_snapshots ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.escalation_alerts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.conflict_severity_snapshots FROM PUBLIC;

REVOKE ALL ON public.escalation_alerts FROM PUBLIC;

-- Mediators: same roster as moderation (read-only on CSI tables; inserts are service_role).
CREATE POLICY "Csi_snapshots_select_moderator" ON public.conflict_severity_snapshots FOR
SELECT TO authenticated
    USING (EXISTS (
        SELECT
            1
        FROM
            public.moderators m
        WHERE
            m.user_id = auth.uid ()));

CREATE POLICY "Escalation_alerts_select_moderator" ON public.escalation_alerts FOR
SELECT TO authenticated
    USING (EXISTS (
        SELECT
            1
        FROM
            public.moderators m
        WHERE
            m.user_id = auth.uid ()));

GRANT
SELECT ON public.conflict_severity_snapshots TO authenticated;

GRANT
SELECT ON public.escalation_alerts TO authenticated;

GRANT ALL ON public.conflict_severity_snapshots TO service_role;

GRANT ALL ON public.escalation_alerts TO service_role;
