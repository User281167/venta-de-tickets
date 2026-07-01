-- Idempotente: no falla si ya existe
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('super_admin', 'organizer', 'staff', 'checker');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Idempotente: IF NOT EXISTS
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "UserRole";

-- Cast correcto entre enums
UPDATE "users" u
SET "role" = a."role"::text::"UserRole"
FROM "admins" a
WHERE a."id" = u."id";

ALTER TABLE "tickets" DROP CONSTRAINT IF EXISTS "tickets_checked_in_by_fkey";
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_checked_in_by_fkey"
  FOREIGN KEY ("checked_in_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE IF EXISTS "admins";
DROP TYPE IF EXISTS "AdminRole";
