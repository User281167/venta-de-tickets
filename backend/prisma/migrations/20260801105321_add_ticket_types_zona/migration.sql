-- Add nullable zona column to ticket_types for binding entries to venue zones.
-- Idempotent: safe to re-run if deploy partially applied.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticket_types' AND column_name = 'zona'
  ) THEN
    ALTER TABLE "ticket_types" ADD COLUMN "zona" VARCHAR(20);
  END IF;
END $$;

-- Add index only if missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'ticket_types' AND indexname = 'ticket_types_zona_idx'
  ) THEN
    CREATE INDEX "ticket_types_zona_idx" ON "ticket_types" ("zona");
  END IF;
END $$;
