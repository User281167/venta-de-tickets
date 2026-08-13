-- =========================================================================
-- PolicyVersion table + PrivacyAcceptance FK migration
--
-- Order of operations (preserves existing data):
--   1. Create policy_versions + indexes
--   2. Seed baseline PolicyVersion rows (1.0.0 for both types, empty content)
--      Content is backfilled by app seed at boot via policies.config.ts
--   3. Dedupe privacy_acceptances (keep only the most recent per user_id+policy_type)
--   4. Add nullable policy_version_id column
--   5. Populate policy_version_id from existing policy_type + policy_version mapping
--   6. Drop legacy columns (policy_type, policy_version, content)
--   7. Enforce NOT NULL on policy_version_id
--   8. Add FK + unique constraint
-- =========================================================================

-- 1. CreateTable policy_versions
CREATE TABLE "policy_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "policy_type" "PolicyType" NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "published_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_versions_pkey" PRIMARY KEY ("id")
);

-- 2. Indexes + seed baseline versions
CREATE UNIQUE INDEX "policy_versions_policy_type_version_key" ON "policy_versions"("policy_type", "version");
CREATE INDEX "policy_versions_policy_type_published_at_idx" ON "policy_versions"("policy_type", "published_at");

INSERT INTO "policy_versions" ("id", "policy_type", "version", "content", "content_hash")
VALUES
    (gen_random_uuid(), 'privacy_policy', '1.0.0', '', ''),
    (gen_random_uuid(), 'terms_of_service', '1.0.0', '', '');

-- 3. Dedupe privacy_acceptances: keep only the most recent per (user_id, policy_type)
DELETE FROM "privacy_acceptances" pa
USING "privacy_acceptances" pa2
WHERE pa.user_id = pa2.user_id
  AND pa.policy_type = pa2.policy_type
  AND pa.accepted_at < pa2.accepted_at;

-- 4. Add nullable FK column
ALTER TABLE "privacy_acceptances" ADD COLUMN "policy_version_id" UUID;

-- 5. Populate FK from legacy columns
UPDATE "privacy_acceptances" pa
SET "policy_version_id" = pv.id
FROM "policy_versions" pv
WHERE pv.policy_type = pa.policy_type
  AND pv.version = pa.policy_version;

-- Safety: abort if any row could not be mapped (orphan rows would violate FK)
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count FROM "privacy_acceptances" WHERE "policy_version_id" IS NULL;
    IF orphan_count > 0 THEN
        RAISE EXCEPTION 'Cannot migrate: % privacy_acceptances rows have no matching PolicyVersion', orphan_count;
    END IF;
END $$;

-- 6. Drop legacy columns
ALTER TABLE "privacy_acceptances" DROP COLUMN "policy_type";
ALTER TABLE "privacy_acceptances" DROP COLUMN "policy_version";
ALTER TABLE "privacy_acceptances" DROP COLUMN "content";

-- 7. Enforce NOT NULL on FK
ALTER TABLE "privacy_acceptances" ALTER COLUMN "policy_version_id" SET NOT NULL;

-- 8. Add FK constraint + unique index
ALTER TABLE "privacy_acceptances"
    ADD CONSTRAINT "privacy_acceptances_policy_version_id_fkey"
    FOREIGN KEY ("policy_version_id") REFERENCES "policy_versions"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "privacy_acceptances_user_id_policy_version_id_key"
    ON "privacy_acceptances"("user_id", "policy_version_id");