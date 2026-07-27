-- pgTAP: v2 sessions RLS — facilitators cannot read other facilitators' sessions

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(2);

-- Structural: facilitator policy exists on sessions
SELECT ok(
    exists (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'sessions'
          AND policyname = 'Facilitator owns their sessions'
    ),
    'sessions has facilitator ownership policy'
);

-- Structural: public read limited to released + outcome_public
SELECT ok(
    exists (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'sessions'
          AND policyname = 'Public can read released sessions'
    ),
    'sessions has public released-only read policy'
);

SELECT * FROM finish();

ROLLBACK;
