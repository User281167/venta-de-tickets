-- Create unified UserRole enum (admin roles only, regular users have NULL)
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'organizer', 'staff', 'checker');

-- Add role column to users (nullable — NULL = regular user/buyer)
ALTER TABLE "users" ADD COLUMN "role" "UserRole";

-- Migrate existing admins into users table
UPDATE "users" u
SET "role" = a."role"
FROM "admins" a
WHERE a."id" = u."id";

-- Update FK: tickets.checked_in_by → admins → tickets.checked_in_by → users
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_checked_in_by_fkey";
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_checked_in_by_fkey"
  FOREIGN KEY ("checked_in_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop admins table and its old enum
DROP TABLE "admins";
DROP TYPE IF EXISTS "AdminRole";
