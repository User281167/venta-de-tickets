/*
  Warnings:

  - You are about to drop the column `is_active` on the `ticket_types` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketTypeStatus" AS ENUM ('enabled', 'disabled', 'blocked');

-- AlterTable
ALTER TABLE "ticket_types" DROP COLUMN "is_active",
ADD COLUMN     "status" "TicketTypeStatus" NOT NULL DEFAULT 'enabled';
