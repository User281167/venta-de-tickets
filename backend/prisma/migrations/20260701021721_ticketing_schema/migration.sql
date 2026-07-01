-- AlterEnum: add confirmed to TicketStatus
ALTER TYPE "TicketStatus" ADD VALUE 'confirmed';

-- AlterTable: add fields to Event
ALTER TABLE "events"
ADD COLUMN "description" TEXT,
ADD COLUMN "location" VARCHAR(255),
ADD COLUMN "prefix" VARCHAR(10);

-- AlterTable: add qr_token to Ticket
ALTER TABLE "tickets" ADD COLUMN "qr_token" TEXT UNIQUE;

-- CreateSequence for ticket_code generation
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1;
