-- Public ledger proposals: published rows are readable by anon/authenticated clients (RLS).
-- Inserts are restricted to moderators or service role until automated publishing exists.

CREATE TABLE public.ledger_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    consensus_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    squad_id UUID REFERENCES public.squads (id) ON DELETE SET NULL,
    ledger_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT ledger_proposals_status_check CHECK (
        status IN ('draft', 'published', 'archived')
    )
);

COMMENT ON TABLE public.ledger_proposals IS
'Public-facing consensus summaries. Operator can read all; clients read published rows only.';

COMMENT ON COLUMN public.ledger_proposals.consensus_items IS
'JSON array of strings: ordered consensus bullets for display (not raw transcripts).';

COMMENT ON COLUMN public.ledger_proposals.ledger_ref IS
'Optional opaque anchor line for citations (demo or future Merkle root).';

CREATE INDEX ledger_proposals_published_at_idx ON public.ledger_proposals (published_at DESC NULLS LAST)
WHERE
    status = 'published';

CREATE INDEX ledger_proposals_squad_id_idx ON public.ledger_proposals (squad_id)
WHERE
    squad_id IS NOT NULL;

ALTER TABLE public.ledger_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ledger_proposals_select_published" ON public.ledger_proposals FOR
SELECT USING (status = 'published');

CREATE POLICY "ledger_proposals_moderator_insert" ON public.ledger_proposals FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ()));

CREATE POLICY "ledger_proposals_moderator_update" ON public.ledger_proposals FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ()))
    WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ()));

GRANT SELECT ON TABLE public.ledger_proposals TO anon, authenticated;

GRANT INSERT, UPDATE ON TABLE public.ledger_proposals TO authenticated;

INSERT INTO public.ledger_proposals (
    slug,
    title,
    summary,
    consensus_items,
    tags,
    status,
    published_at,
    ledger_ref
)
VALUES (
    'demo-proposal-001',
    'Civilian protection protocols — displacement corridor',
    'Reduce civilian harm and miscoordination during corridor movements in a mixed-control zone.',
    '[
    "Corridor coordinators establish a neutral coordination frequency and a single written chain of custody for corridor access before any movement windows open.",
    "Corridor stewards post visible de-escalation markers at agreed intervals; if any marker is contested, all crossings pause for 15 minutes while the channel resolves the incident.",
    "Displaced civilians are routed through three pre-cleared nodes only; no ad-hoc detours occur without unanimous squad sign-off on the shared channel."
  ]'::jsonb,
    ARRAY['Climate', 'Displacement'],
    'published',
    '2026-03-18 12:00:00+00',
    'ledger:root=0x7f3a…c91d · session_ref=demo-session-001 · anon_set=Semaphore:v3-demo'
);
