-- CreateIndex
CREATE INDEX "idx_tickets_reserved_expiry" ON "tickets"("status", "reserve_expires_at");
