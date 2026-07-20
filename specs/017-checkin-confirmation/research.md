# Research - Check-in and Remote Confirmation

**Date**: 2026-07-20

## Resolved Unknowns

### 1. Messaging module interface

- **Decision**: Define `messaging.client.ts` in the checkin module — a thin abstraction (function contract) for sending confirmation links. No dependency on a non-existent module.
- **Interface shape**: `sendConfirmationLink(params: { buyerContact: string; channel: 'email' | 'whatsapp'; confirmationUrl: string; ticketId: string; buyerName: string }): Promise<void>`
- **Rationale**: Messaging module doesn't exist yet and is out of scope. The client interface decouples checkin from the eventual implementation. When messaging is built, it implements this contract.
- **Alternatives**: Embed Infobip call directly in checkin (couples to non-existent dependency, violates constitution principle I). Create a shared interface in `shared/` (violates principle V — domain-agnostic shared dir).

### 2. Prior checkin implementation

- **Decision**: Delete `src/modules/checkin/` entirely before implementing. This was a single-endpoint attempt (`POST /internal/checkin`) that doesn't match the new CQS design.
- **Rationale**: Clean slate avoids confusion. Old code had different state logic and no remote confirmation flow. Document as replaced in commit message.
- **Alternatives**: Refactor in place (riskier — old patterns may leak).

### 3. Confirmation link format

- **Decision**: Link = `{CONFIRMATION_LINK_BASE_URL}/confirmaciones?token={JWT}` (Spanish path matches Colombian market). Token passed as query param for frontend routing convenience; the frontend confirmation page strips it from URL and sends in POST body.
- **Rationale**: Token in body (not URL) for confirm/reject POST, so it doesn't appear in server access logs.
- **Token payload**: `{ tid: string, purpose: 'confirm' }` — no buyer PII in the JWT.
- **TTL**: 30 minutes (configurable via `CONFIRMATION_TOKEN_TTL`).

### 4. Race condition pattern

- **Decision**: Each state transition endpoint follows: `SELECT ... FOR UPDATE` → verify current status → `UPDATE tickets SET status = X WHERE id = Y AND status = Z` → check `affectedRows === 0` → return `TICKET_NOT_AVAILABLE` (409).
- **Rationale**: PostgreSQL row-level lock prevents concurrent modifications. `WHERE status = Z` provides idempotency — if another checker already transitioned the ticket, the UPDATE affects 0 rows and the controller returns 409. No application-level mutex needed.
- **Pattern source**: Already used elsewhere in the project (see `tickets` module).

## Technology Best Practices

### JWT handling
- Use `jsonwebtoken` library (already in project dependencies)
- Two separate secrets: `QR_JWT_SECRET` (checkin scan) and `CONFIRMATION_JWT_SECRET` (confirmations)
- Verify token expiry using `jwt.verify()` — it throws on expired tokens automatically
- Distinguish error types: `TokenExpiredError` → message with "link expired" guidance; `JsonWebTokenError` → "invalid link"

### Prisma transactions
- Use `prisma.$transaction` with interactive API for `SELECT ... FOR UPDATE`:
  ```ts
  prisma.$transaction(async (tx) => {
    const ticket = await tx.tickets.findUniqueOrThrow({
      where: { id: ticketId },
      select: { status: true },
    });
    // Verify status...
    const result = await tx.tickets.updateMany({
      where: { id: ticketId, status: expectedStatus },
      data: { status: newStatus, checkedInAt: new Date() },
    });
    // Check result.count === 0 → 409
  });
  ```
- `findUniqueOrThrow` throws `NotFoundError` on missing ticket (maps to 404).
- `updateMany` returns `{ count }` — use `count` to detect idempotent conflict.

## Existing Patterns to Follow

| Concern | Pattern | Location |
|---------|---------|----------|
| Route registration | `Router()` + export + mount in app | `src/modules/tickets/tickets.routes.ts` |
| Controller | Validate body → call service → map response | `src/modules/tickets/tickets.controller.ts` |
| Service | Business logic, calls repository, throws domain errors | `src/modules/tickets/tickets.service.ts` |
| Repository | Prisma queries, no Express/Supabase imports | `src/modules/tickets/tickets.repository.ts` |
| Validator | Zod schema for body, exported type | `src/modules/tickets/tickets.validators.ts` |
| Error classes | `AppError` with code + status + message | `src/shared/errors/AppError.ts` |
