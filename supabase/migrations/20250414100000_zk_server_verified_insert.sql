-- ZK proofs: server-verified inserts only (Edge Function + service role).
-- Adds Semaphore-style nullifier for double-spend prevention; backfills legacy rows.

ALTER TABLE public.zk_proof_submissions
    ADD COLUMN IF NOT EXISTS nullifier_hash TEXT;

UPDATE public.zk_proof_submissions
SET
    nullifier_hash = encode(digest(proof_commitment || id::text, 'sha256'), 'hex')
WHERE
    nullifier_hash IS NULL;

ALTER TABLE public.zk_proof_submissions
    ALTER COLUMN nullifier_hash SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS zk_proof_submissions_nullifier_hash_uidx ON public.zk_proof_submissions (nullifier_hash);

-- Inserts go through Edge Function (service role); clients retain read access to own rows.
DROP POLICY IF EXISTS "Zk_insert_own" ON public.zk_proof_submissions;

DROP POLICY IF EXISTS "Attrs_insert_own" ON public.verified_attributes;

DROP POLICY IF EXISTS "Attrs_update_own" ON public.verified_attributes;
