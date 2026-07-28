-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "DonationAccount" AS ENUM ('LA_CONVENCION', 'BARRANQUEROS_UTP');

-- CreateTable
CREATE TABLE "donations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(150),
    "email" VARCHAR(255),
    "amount_cents" DECIMAL(12,2) NOT NULL,
    "state" "DonationStatus" NOT NULL DEFAULT 'pending',
    "account" "DonationAccount" NOT NULL,
    "external_reference" VARCHAR(100) NOT NULL,
    "payment_id" VARCHAR(255),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donations_external_reference_key" ON "donations"("external_reference");

-- CreateIndex
CREATE INDEX "donations_state_account_idx" ON "donations"("state", "account");
