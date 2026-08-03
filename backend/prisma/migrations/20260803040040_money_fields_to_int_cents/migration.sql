/*
  Warnings:

  - You are about to alter the column `amount_cents` on the `donations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to drop the column `price` on the `ticket_types` table. All the data in the column will be lost.
  - Added the required column `price_cents` to the `ticket_types` table without a default value. This is not possible if the table is not empty.

*/
-- ticket_types: rename + conversión de tipo (mismo valor, 1000 = 1 mil)
ALTER TABLE "ticket_types" RENAME COLUMN "price" TO "price_cents";
ALTER TABLE "ticket_types"
  ALTER COLUMN "price_cents" TYPE INTEGER
  USING ROUND("price_cents")::INTEGER;

-- donations: mismo nombre de columna, solo cambia tipo (mismo valor)
ALTER TABLE "donations"
  ALTER COLUMN "amount_cents" TYPE INTEGER
  USING ROUND("amount_cents")::INTEGER;
