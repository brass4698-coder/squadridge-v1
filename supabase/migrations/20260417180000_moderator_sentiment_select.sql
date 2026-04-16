-- Moderators: read sentiment_metrics for triage / early-warning review (aligned with messages moderator read).

CREATE POLICY "Sentiment_select_moderator" ON public.sentiment_metrics
    FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                public.moderators mo
            WHERE
                mo.user_id = auth.uid ()));
