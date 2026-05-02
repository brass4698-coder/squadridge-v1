-- Track D (CSI partner export): partner registry + grants + audit log.
--
-- Background: 20260427120000 + 20260504120000 ship internal-only CSI to
-- moderators. Track D opens a *narrow* read surface for vetted partners:
-- one Edge Function with API-key auth, region scoping, dimension scoping,
-- per-call audit, and rate limiting. Strictly NOT a public feed — the
-- governance gate from docs/business/strategic-positioning-early-warning.md
-- ("vetted-partner read access, not a public dashboard") is the line.
--
-- This migration adds:
--   * csi_partners — manually populated by ops; one row per partner with a
--     hashed API key, contact metadata, and a scope window.
--   * csi_partner_grants — fine-grained allow-list of (partner, region,
--     allowed signal dimensions). One partner can have multiple grants.
--   * csi_export_audit_log — append-only record of every partner export
--     call (what was returned, when, from where).
--
-- Trust posture:
--   * API keys are stored as SHA-256 hashes; the raw key is shown to the
--     partner ONCE at provisioning time and never persisted.
--   * The Edge function runs as service role and verifies the hashed key
--     before returning any data; the partner client never has DB access.
--   * RLS denies all `authenticated` and `anon` reads on these tables;
--     ops manages them via the dashboard / SQL editor with service role.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.csi_partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    name text NOT NULL,
    contact_email text NOT NULL,
    api_key_hash text NOT NULL UNIQUE,
    /** ISO 3166-1 region code or program slug; partners are not joined to a single region. */
    notes text,
    scope_started_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    scope_ended_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT csi_partners_email_check CHECK (contact_email LIKE '%@%')
);

COMMENT ON TABLE public.csi_partners IS
'Vetted partners with read access to scoped CSI snapshots. Service-role-managed; no client RLS read. api_key_hash is the SHA-256 of the raw key shown at provisioning.';

CREATE INDEX csi_partners_active_idx
    ON public.csi_partners (id)
    WHERE scope_ended_at IS NULL;

CREATE TABLE public.csi_partner_grants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    partner_id uuid NOT NULL REFERENCES public.csi_partners (id) ON DELETE CASCADE,
    region_key text NOT NULL,
    allowed_signal_dimensions text[] NOT NULL DEFAULT ARRAY[
        'sentiment_signal',
        'grievance_signal',
        'resource_signal',
        'ingroup_outgroup_signal',
        'escalation_velocity_signal',
        'violence_normalization_signal'
    ],
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT csi_partner_grants_unique_pair UNIQUE (partner_id, region_key)
);

COMMENT ON TABLE public.csi_partner_grants IS
'Per-(partner, region) allow-list for CSI export. allowed_signal_dimensions enumerates which signal columns the partner may read; csi_score and severity_band are always included.';

CREATE INDEX csi_partner_grants_partner_idx ON public.csi_partner_grants (partner_id);

CREATE INDEX csi_partner_grants_region_idx ON public.csi_partner_grants (region_key);

CREATE TABLE public.csi_export_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    partner_id uuid REFERENCES public.csi_partners (id) ON DELETE SET NULL,
    requested_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    region_keys text[] NOT NULL,
    snapshots_returned integer NOT NULL DEFAULT 0,
    response_status smallint NOT NULL,
    request_meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.csi_export_audit_log IS
'Append-only audit of every csi-partner-export Edge call: who, when, what regions, how many rows, response status. Service-role write only.';

CREATE INDEX csi_export_audit_log_partner_time_idx
    ON public.csi_export_audit_log (partner_id, requested_at DESC);

ALTER TABLE public.csi_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csi_partner_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csi_export_audit_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.csi_partners FROM PUBLIC;
REVOKE ALL ON public.csi_partner_grants FROM PUBLIC;
REVOKE ALL ON public.csi_export_audit_log FROM PUBLIC;

GRANT ALL ON public.csi_partners TO service_role;
GRANT ALL ON public.csi_partner_grants TO service_role;
GRANT ALL ON public.csi_export_audit_log TO service_role;

-- Moderators: read-only access for diligence (who do we have export grants
-- with, when did they last call). No partner_id-keyed write surface for
-- mods — provisioning stays in ops hands.
CREATE POLICY "Csi_partners_select_moderator" ON public.csi_partners
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.moderators m WHERE m.user_id = auth.uid ()
        )
    );

CREATE POLICY "Csi_partner_grants_select_moderator" ON public.csi_partner_grants
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.moderators m WHERE m.user_id = auth.uid ()
        )
    );

CREATE POLICY "Csi_export_audit_log_select_moderator" ON public.csi_export_audit_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.moderators m WHERE m.user_id = auth.uid ()
        )
    );

-- Crucially: NO INSERT/UPDATE/DELETE policies for `authenticated` on any of
-- these tables. Even moderators cannot edit partner records via the API.
-- Provisioning runs through ops with service_role.

-- Helper: hash an API key the same way the Edge function will.
CREATE OR REPLACE FUNCTION public.hash_partner_api_key (p_key text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE
    AS $$
    SELECT encode(extensions.digest(p_key, 'sha256'), 'hex');
$$;

REVOKE ALL ON FUNCTION public.hash_partner_api_key (text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.hash_partner_api_key (text) TO service_role;

COMMENT ON FUNCTION public.hash_partner_api_key (text) IS
'SHA-256 hex of a partner API key. Used by ops at provisioning time and by the csi-partner-export Edge function for constant-time-ish lookup against csi_partners.api_key_hash.';
