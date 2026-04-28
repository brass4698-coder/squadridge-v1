-- Phase 2.1 (audit remediation): issuer_groups registry per
-- docs/technical/rfc-issuer-managed-anonymity-group.md.
--
-- The Edge ZK verifier looks up the enrolled issuer for a given group_id, refetches
-- the issuer's signed Merkle root manifest if expired, and rejects any proof whose
-- merkleTreeRoot does not match the current published root. Without this row, no
-- proofs scoped to the issuer succeed — fail-closed.

CREATE TABLE IF NOT EXISTS public.issuer_groups (
    group_id            TEXT PRIMARY KEY,
    manifest_url        TEXT NOT NULL,
    -- Ed25519 public key (32 bytes, base64url) used to verify the manifest signature.
    signing_key_ed25519 TEXT NOT NULL,
    -- Latest cached Merkle root + when it expires (refreshed proactively by edge).
    current_root        TEXT NOT NULL,
    current_root_expires_at TIMESTAMPTZ NOT NULL,
    tree_depth          INT NOT NULL CHECK (tree_depth BETWEEN 1 AND 32),
    enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_refreshed_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.issuer_groups IS
    'Enrolled issuers for Semaphore anonymity groups (RFC: rfc-issuer-managed-anonymity-group). Read by Edge service role only.';
COMMENT ON COLUMN public.issuer_groups.signing_key_ed25519 IS
    'Pinned issuer Ed25519 public key, base64url, 32 raw bytes. Verifies manifest signature.';
COMMENT ON COLUMN public.issuer_groups.current_root IS
    'Latest Merkle root from the signed issuer manifest. Edge rejects proofs with a different root.';

-- Add issuer_group_id to zk_proof_submissions so successful verifications record the
-- declared anonymity set. Nullable for backwards compat with existing demo proofs.
ALTER TABLE public.zk_proof_submissions
    ADD COLUMN IF NOT EXISTS issuer_group_id TEXT REFERENCES public.issuer_groups (group_id) ON DELETE SET NULL;

COMMENT ON COLUMN public.zk_proof_submissions.issuer_group_id IS
    'Issuer group whose Merkle root the proof was verified against. NULL for legacy / demo-decoy proofs.';

CREATE INDEX IF NOT EXISTS zk_proof_submissions_issuer_group_idx
    ON public.zk_proof_submissions (issuer_group_id)
    WHERE issuer_group_id IS NOT NULL;

ALTER TABLE public.issuer_groups ENABLE ROW LEVEL SECURITY;

-- The table contains pinned signing keys + cached roots. Operationally readable by
-- the Edge service role only; the authenticated/anon roles never need direct access
-- because the Edge function (which owns the verification policy) reads via service_role.
CREATE POLICY "Issuer_groups_no_client_access" ON public.issuer_groups FOR ALL TO authenticated, anon
    USING (FALSE)
    WITH CHECK (FALSE);

COMMENT ON POLICY "Issuer_groups_no_client_access" ON public.issuer_groups IS
    'Issuer registry is read/written via Edge service_role only — no direct client access.';
