/*
  Warnings:

  - You are about to drop the column `discount_cents` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `discount_code_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `discount_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "discount_codes" DROP CONSTRAINT "discount_codes_created_by_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_discount_code_id_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "discount_cents",
DROP COLUMN "discount_code_id";

-- DropTable
DROP TABLE "discount_codes";

-- DropEnum
DROP TYPE "DiscountType";

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "tickets_created_at_idx" ON "tickets"("created_at");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");
