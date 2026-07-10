/*
  Warnings:

  - The values [active] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('reserved', 'paid', 'pending_confirmation', 'confirmed', 'used', 'cancelled', 'expired');
ALTER TABLE "tickets" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "confirmation_requested_at" TIMESTAMPTZ;
