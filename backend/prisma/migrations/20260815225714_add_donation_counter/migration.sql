-- CreateTable
CREATE TABLE "donation_counter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "current_value" INTEGER NOT NULL DEFAULT 0,
    "meta_value" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "donation_counter_pkey" PRIMARY KEY ("id")
);
