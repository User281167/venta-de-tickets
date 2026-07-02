-- Drop old Payment table
DROP TABLE IF EXISTS "payments" CASCADE;

-- Create new Payment table
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "provider_tx_id" VARCHAR(255),
    "amount_cents" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Add payment_id to tickets
ALTER TABLE "tickets" ADD COLUMN "payment_id" UUID;

-- Add foreign keys
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");
CREATE INDEX "payments_event_id_idx" ON "payments"("event_id");
CREATE INDEX "tickets_payment_id_idx" ON "tickets"("payment_id");
