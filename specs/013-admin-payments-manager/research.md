# Research: Admin Payments Manager

## 1. Payment List Filtering

**Decision**: Add optional query params `status`, `dateFrom`, `dateTo`, `search` to `GET /api/admin/payments`.

**Rationale**: Current `findAllPayments` only paginates. Admin needs to filter by status, date range, and search by user email or ticket type name. The `search` param queries both `user.email` and `ticket_type.name` through the payment → tickets → ticketType relation.

**Alternatives considered**:
- Dedicated filter endpoint — unnecessary, same data source.
- Client-side filter — doesn't scale beyond current page.

## 2. Refund Model

**Decision**: New `Refund` Prisma model + `partially_refunded` enum value in `PaymentStatus`.

**Rationale**: Refunds need their own table to track amount, reason, processed-by admin, and timestamp. Multiple refunds per payment require the `partially_refunded` status (current `refunded` status used for full refunds).

**Refund model fields**: `id`, `paymentId`, `amountCents`, `reason`, `processedById` (admin), `status` (pending/processed/failed), `gatewayRefundId`, `createdAt`.

**Alternatives considered**:
- JSON metadata on Payment — loses queryability and referential integrity.
- Status-only tracking — loses audit trail and partial refund support.

## 3. Mercado Pago Refund API

**Decision**: Add `processRefund` method to `MercadoPagoProvider` using `mercadopago` SDK's `Payment.refund()`.

**Rationale**: The `mercadopago` SDK `Payment` class (already imported in `mercadopago.provider.ts`) provides `refund({ id: providerTxId })` for full refunds and `refund({ id: providerTxId, amount: number })` for partial refunds. This matches the spec's FR-004 (full/partial refund).

**Alternatives considered**:
- Manual API call to `https://api.mercadopago.com/v1/payments/:id/refunds` — SDK call is cleaner and already used for webhook processing.

## 4. Frontend Test Patterns

**Decision**: Follow `admin-users` test patterns exactly.

**Rationale**: The project has established patterns:
- `vi.mock` for hook/query mocking with factory functions
- `TestWrapper` from `@/test/test-utils` for Chakra provider
- `QueryClientProvider` wrapping for mutation tests
- `userEvent.setup()` for interactions
- `vi.spyOn(await import(...))` for dynamic mock overrides
- Short, focused components in separate files (not one big file)

## 5. Backend Existing Endpoints

**Decision**: Enhance existing handlers rather than creating new route files.

**Current**:
- `GET /api/admin/payments` → `listPaymentsHandler` → `paymentsService.listAllPayments(page, limit)` → `paymentsRepo.findAllPayments(page, limit)` — no filters
- `GET /api/admin/payments/:id` → `getPaymentDetailHandler` → `paymentsService.getPaymentDetail(id)` → `paymentsRepo.findPaymentByIdWithUser(id)` — includes user + tickets + ticketType

**Changes needed**:
- Add `paymentFiltersSchema` with optional `status`, `dateFrom`, `dateTo`, `search`, `page`, `limit`
- Add `refundSchema` with `amount`, `reason`
- Add `POST /api/admin/payments/:id/refund` route + handler + service + repo methods
- Extend `paymentsService.listAllPayments` to accept filter params
- Extend `paymentsRepo.findAllPayments` to build dynamic WHERE clause

## 6. Route Structure

**Decision**: `/admin/pagos/` for list, `/admin/pagos/[id]` for detail.

**Rationale**: Matches existing admin route convention (`/admin/usuarios/`, `/admin/ticket-types/`). "Pagos" is Spanish for "payments".
