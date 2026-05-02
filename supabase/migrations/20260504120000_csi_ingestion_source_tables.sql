-- Track C (CSI ingestion): source-data tables for the automated ingestion cron.
--
-- Today the CSI calculator (src/lib/csi/conflictSeverityIndex.ts) and the
-- snapshot/alert tables (20260427120000) exist in isolation: there is no
-- writer. This migration adds the two ingestion inputs that the writer cron
-- consumes:
--
--   1. facilitator_signal_codes — moderator/facilitator-coded signals per
--      squad-window. Avoids bootstrapping NLP for the first ship; gives the
--      grievance / in-out-group / violence-normalization sub-scores a
--      governable, human-validated input. Aligns with csi-spec.md design
--      principle: "human in the loop" + "false positives" UI must surface
--      uncertainty.
--   2. csi_band_thresholds — region-scoped calibration of the green / yellow
--      / red boundaries. Aligns with conflict-severity-index.md "Bands" being
--      configurable per program.
--
-- Writes are RLS-gated (moderators write the codes; thresholds are service-
-- role-managed by ops). The aggregator + ingestion Edge function in
-- 20260504120100 reads via service role.

CREATE TABLE public.facilitator_signal_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    squad_id uuid REFERENCES public.squads (id) ON DELETE CASCADE,
    region_key text NOT NULL,
    coded_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    code text NOT NULL,
    intensity smallint NOT NULL,
    notes text,
    coder_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT DEFAULT auth.uid (),
    CONSTRAINT facilitator_signal_codes_intensity_check CHECK (intensity BETWEEN 0 AND 100),
    CONSTRAINT facilitator_signal_codes_code_check CHECK (
        code IN (
            'grievance_repeat',
            'ingroup_outgroup',
            'violence_justifying',
            'resource_scarcity',
            'sentiment_negative'
        )
    )
);

COMMENT ON TABLE public.facilitator_signal_codes IS
'Moderator/facilitator-coded CSI inputs per squad-window. Consumed by the csi-ingest-snapshot Edge cron via the SQL aggregator. See docs/product/csi-spec.md and conflict-severity-index.md.';

COMMENT ON COLUMN public.facilitator_signal_codes.code IS
'CHECK-bounded enum of CSI signal categories (grievance/ingroup_outgroup/violence/resource/sentiment). Adding new codes requires a migration + spec update.';

COMMENT ON COLUMN public.facilitator_signal_codes.intensity IS
'0–100 severity for this coding event. Aggregator averages within window; thresholds in csi_band_thresholds.';

CREATE INDEX facilitator_signal_codes_region_time_idx
    ON public.facilitator_signal_codes (region_key, coded_at DESC);

CREATE INDEX facilitator_signal_codes_squad_time_idx
    ON public.facilitator_signal_codes (squad_id, coded_at DESC)
    WHERE squad_id IS NOT NULL;

ALTER TABLE public.facilitator_signal_codes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.facilitator_signal_codes FROM PUBLIC;

-- Read: moderators only (mirrors CSI snapshot RLS).
CREATE POLICY "Facilitator_codes_select_moderator" ON public.facilitator_signal_codes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
    );

-- Write: moderators only; coder_id pinned to auth.uid() to prevent spoofing.
CREATE POLICY "Facilitator_codes_insert_moderator" ON public.facilitator_signal_codes
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
        AND coder_id = auth.uid ()
    );

GRANT SELECT, INSERT ON public.facilitator_signal_codes TO authenticated;
GRANT ALL ON public.facilitator_signal_codes TO service_role;

-- Region-scoped band thresholds.
CREATE TABLE public.csi_band_thresholds (
    region_key text PRIMARY KEY,
    green_max smallint NOT NULL DEFAULT 30,
    yellow_max smallint NOT NULL DEFAULT 60,
    sentiment_negative_ref numeric NOT NULL DEFAULT 0.15,
    grievance_ref numeric NOT NULL DEFAULT 0.4,
    resource_ref_per_1k numeric NOT NULL DEFAULT 8,
    ingroup_ref numeric NOT NULL DEFAULT 0.12,
    sentiment_delta_ref numeric NOT NULL DEFAULT 0.25,
    violence_ref_per_session numeric NOT NULL DEFAULT 2.5,
    notes text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT csi_band_thresholds_band_order_check CHECK (
        green_max >= 0
        AND yellow_max > green_max
        AND yellow_max <= 100
    )
);

COMMENT ON TABLE public.csi_band_thresholds IS
'Per-region CSI band cutoffs and reference normalization constants. Service-role-managed by ops; the ingestion cron reads these to tune the green/yellow/red bands per pilot.';

ALTER TABLE public.csi_band_thresholds ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.csi_band_thresholds FROM PUBLIC;

CREATE POLICY "Csi_bands_select_moderator" ON public.csi_band_thresholds
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
    );

GRANT SELECT ON public.csi_band_thresholds TO authenticated;
GRANT ALL ON public.csi_band_thresholds TO service_role;

-- Aggregator: returns the inputs the calculator wants. Service-role only so
-- the Edge cron and ops can call it; not exposed to authenticated clients.
CREATE OR REPLACE FUNCTION public.csi_aggregate_signals (
    p_region_key text,
    p_period_start timestamptz,
    p_period_end timestamptz
)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    v_squad_count int;
    v_message_count int;
    v_negative_ratio numeric;
    v_grievance_index numeric;
    v_ingroup_rate numeric;
    v_resource_per_1k numeric;
    v_sentiment_delta numeric;
    v_violence_per_session numeric;
    v_top_grievances jsonb;
BEGIN
    -- Count squads + messages active in the window for the region. We treat
    -- region_key as a tag carried on facilitator codes (and on a future
    -- squad.region_key column once added); for now squads are counted via
    -- the codes table to avoid touching squads schema.
    SELECT count(DISTINCT squad_id) INTO v_squad_count
    FROM public.facilitator_signal_codes
    WHERE region_key = p_region_key
      AND coded_at >= p_period_start
      AND coded_at < p_period_end;

    SELECT count(*) INTO v_message_count
    FROM public.messages m
    JOIN public.facilitator_signal_codes f ON f.squad_id = m.squad_id
    WHERE f.region_key = p_region_key
      AND m.sent_at >= p_period_start
      AND m.sent_at < p_period_end;

    -- Ratios and rates derived from facilitator codes for the first ship.
    -- Each code's intensity is normalised to 0..1 and averaged to produce a
    -- representative ratio for the matching CSI sub-score input.
    SELECT
        coalesce(avg(intensity)::numeric / 100, 0)
    INTO v_negative_ratio
    FROM public.facilitator_signal_codes
    WHERE region_key = p_region_key
      AND code = 'sentiment_negative'
      AND coded_at >= p_period_start
      AND coded_at < p_period_end;

    SELECT
        coalesce(avg(intensity)::numeric / 100, 0)
    INTO v_grievance_index
    FROM public.facilitator_signal_codes
    WHERE region_key = p_region_key
      AND code = 'grievance_repeat'
      AND coded_at >= p_period_start
      AND coded_at < p_period_end;

    SELECT
        coalesce(avg(intensity)::numeric / 100, 0)
    INTO v_ingroup_rate
    FROM public.facilitator_signal_codes
    WHERE region_key = p_region_key
      AND code = 'ingroup_outgroup'
      AND coded_at >= p_period_start
      AND coded_at < p_period_end;

    -- Resource hits as count per 1000 messages; fall back to 0 when no
    -- messages were sent in window.
    SELECT
        CASE
            WHEN v_message_count = 0 THEN 0
            ELSE (count(*) * 1000.0) / v_message_count
        END
    INTO v_resource_per_1k
    FROM public.facilitator_signal_codes
    WHERE region_key = p_region_key
      AND code = 'resource_scarcity'
      AND coded_at >= p_period_start
      AND coded_at < p_period_end;

    -- Sentiment delta day-over-day from sentiment_metrics if present;
    -- otherwise zero.
    SELECT
        coalesce(
            (
                SELECT avg(tension_level)
                FROM public.sentiment_metrics sm
                WHERE sm.recorded_at >= p_period_start
                  AND sm.recorded_at < p_period_end
            ) - (
                SELECT avg(tension_level)
                FROM public.sentiment_metrics sm
                WHERE sm.recorded_at >= p_period_start - (p_period_end - p_period_start)
                  AND sm.recorded_at < p_period_start
            ),
            0
        )::numeric
    INTO v_sentiment_delta;

    -- Violence per session: count of violence_justifying codes / squad_count.
    SELECT
        CASE
            WHEN v_squad_count = 0 THEN 0
            ELSE count(*)::numeric / v_squad_count
        END
    INTO v_violence_per_session
    FROM public.facilitator_signal_codes
    WHERE region_key = p_region_key
      AND code = 'violence_justifying'
      AND coded_at >= p_period_start
      AND coded_at < p_period_end;

    -- Top grievances: most-frequent notes within grievance_repeat codes
    -- (capped at 3, weight = relative share). Notes are facilitator-entered
    -- so they're already minimal-PII by convention.
    SELECT
        coalesce(jsonb_agg(jsonb_build_object('theme', theme, 'weight', weight) ORDER BY weight DESC), '[]'::jsonb)
    INTO v_top_grievances
    FROM (
        SELECT
            substring(coalesce(notes, '(uncoded)'), 1, 80) AS theme,
            count(*)::numeric / nullif((SELECT count(*) FROM public.facilitator_signal_codes
                                        WHERE region_key = p_region_key
                                          AND code = 'grievance_repeat'
                                          AND coded_at >= p_period_start
                                          AND coded_at < p_period_end), 0) AS weight
        FROM public.facilitator_signal_codes
        WHERE region_key = p_region_key
          AND code = 'grievance_repeat'
          AND coded_at >= p_period_start
          AND coded_at < p_period_end
        GROUP BY substring(coalesce(notes, '(uncoded)'), 1, 80)
        ORDER BY count(*) DESC
        LIMIT 3
    ) t;

    RETURN jsonb_build_object(
        'squadCount', v_squad_count,
        'messageCount', v_message_count,
        'inputs', jsonb_build_object(
            'negativeMessageRatio24h', v_negative_ratio,
            'grievanceClusterIndex', v_grievance_index,
            'ingroupOutgroupRate', v_ingroup_rate,
            'resourceKeywordsPer1k', v_resource_per_1k,
            'sentimentDeltaDayOverDay', v_sentiment_delta,
            'violenceJustifyingPerSession', v_violence_per_session
        ),
        'topGrievances', v_top_grievances
    );
END;
$$;

REVOKE ALL ON FUNCTION public.csi_aggregate_signals (text, timestamptz, timestamptz) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.csi_aggregate_signals (text, timestamptz, timestamptz) TO service_role;

COMMENT ON FUNCTION public.csi_aggregate_signals (text, timestamptz, timestamptz) IS
'Aggregates facilitator_signal_codes + sentiment_metrics for one region+window into a JSON payload matching CsiSignalInputs (src/lib/csi/conflictSeverityIndex.ts). Service-role only. Returns {squadCount, messageCount, inputs, topGrievances}.';
