# Tasks: Admin Manual Payment

**Input**: Design documents from `/specs/014-admin-manual-payment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-create-admin-payment.md

**Organization**: Tasks grouped by layer — Schema → Backend → Frontend. Single user story (P1).

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 1: Schema (Shared Infrastructure)

**Purpose**: Add `createdBy` to Payment model in Prisma schema. NO migration execution — user runs manually.

- [x] T001 Add `createdBy` field (nullable String, FK → User) and `creator` relation to Payment model in `backend/prisma/schema.prisma`
- [x] T002 Add `createdBy` to `selectPaymentAdmin` and `selectPaymentHistory` constants in `backend/src/modules/payments/payments.repository.ts`

---

## Phase 2: Backend — API Endpoint

**Purpose**: New `POST /api/admin/payments/manual` endpoint. Creates payment + tickets in single transaction.

### Types & Validators

- [x] T003 [P] Add `TicketQuantityInput` and `AdminPaymentInput` types to `backend/src/modules/payments/payments.types.ts`
- [x] T004 [P] Add `createAdminPaymentSchema` Zod validator (userId, provider enum, tickets array) to `backend/src/modules/admins/admins.validators.ts`

### Repository (single transaction)

- [x] T005 Add `createAdminPaymentTransaction` to `backend/src/modules/payments/payments.repository.ts`:
  - Receives `{ userId, provider, amountCents, createdBy, tickets: Array<{ ticketTypeId, quantity }>, generateTicketCode }`
  - Single `prisma.$transaction` with:
    - FOR UPDATE lock on each ticket_type
    - Validate `sold + quantity <= total` per type (throw `SOLD_OUT` with details)
    - `UPDATE ticket_types SET quantity_sold += quantity` per type
    - `INSERT INTO payments` with `status=completed`, `createdBy`
    - `INSERT INTO tickets` (paid, linked to payment) for each type×quantity
    - Return `{ paymentId, ticketIds }`

### Service Layer

- [x] T006 Add `createAdminPayment` to `backend/src/modules/payments/payments.service.ts`:
  - Fetch each ticket type, validate existence (404 if missing)
  - Skip maxPerUser check (admin bypass)
  - Calculate total amountCents = sum(price × quantity)
  - Call `paymentsRepository.createAdminPaymentTransaction`
  - After tx: generate QR for each ticket via `ticketsService.generateQrForTicket`

- [x] T007 Add `createAdminPayment` to `backend/src/modules/admins/admins.service.ts`:
  - Validate user exists via `adminsRepo.findById` (404 if missing)
  - Call `paymentsService.createAdminPayment` with admin ID

### Controller & Routes

- [x] T008 Add `createAdminPaymentHandler` to `backend/src/modules/admins/admins.controller.ts`:
  - Parse body with Zod schema
  - Call `adminsService.createAdminPayment`
  - Return 201 with paymentId, ticketIds

- [x] T009 Add `POST /payments/manual` route with `requireRole('admin')` to `backend/src/modules/admins/admins.routes.ts`

---

## Phase 3: Frontend — Payment Dialog on Usuarios Page

**Purpose**: Admin clicks "Add payment" on user row, selects ticket type quantities, submits. Payment + tickets created.

### Data Layer

- [ ] T010 Add `useCreateAdminPayment` mutation to `frontend/features/admin-payments/api/admin-payments.queries.ts`:
  - POST to `/api/admin/payments/manual`
  - On success: invalidate `['admin', 'payments']` queries
  - Return paymentId + ticketIds

- [ ] T011 Add `CreateAdminPaymentInput` TypeScript type to `frontend/features/admin-payments/schemas/admin-payments.schema.ts`

- [ ] T012 Add `useTicketTypes` query (if not already present) calling `/api/ticket-types` in `frontend/features/admin-payments/api/admin-payments.queries.ts`

### UI Components

- [ ] T013 Create `AddPaymentDialog` component at `frontend/features/admin-users/components/AddPaymentDialog.tsx`:
  - Chakra Modal with user name header
  - Provider select (Manual / Gift)
  - Ticket type list with quantity number inputs (default 0)
  - Auto-calculated total display
  - Submit button with loading state
  - Success/error toast
  - Uses `useCreateAdminPayment` mutation
  - Uses `useCallback` + `React.memo` for perf

- [ ] T014 Add `onAddPayment` callback prop to `UserTableItem` in `frontend/features/admin-users/components/UserTableItem.tsx`:
  - New "Pago manual" button with dollar icon in actions cell
  - Calls `onAddPayment(user)` onClick

- [ ] T015 Update `UserTable` in `frontend/features/admin-users/components/UserTable.tsx`:
  - Add `paymentUser` state
  - Pass `onAddPayment={setPaymentUser}` to `UserTableItem`
  - Render `<AddPaymentDialog user={paymentUser} onClose={() => setPaymentUser(null)} />`

---

## Phase 4: Polish & Validation

**Purpose**: Verify all layers work together, documentation updated.

- [ ] T016 Verify `selectPaymentAdmin` in `backend/src/modules/payments/payments.repository.ts` includes `createdBy` for admin payment list view
- [ ] T017 Update `listAllPayments` mapper in `backend/src/modules/payments/payments.service.ts` to include `createdBy` in response
- [ ] T018 Run `npx prisma generate` to update Prisma client types after schema change

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Schema)**: No dependencies — start immediately
- **Phase 2 (Backend)**: Depends on Phase 1 — BLOCKS Phase 3
- **Phase 3 (Frontend)**: Depends on Phase 2 (needs endpoint working)
- **Phase 4 (Polish)**: Depends on Phase 2 + 3

### Within Each Phase

- Types/Validators (P-marked) can run in parallel
- Repository → Service → Controller/Routes (sequential within module)

### Parallel Opportunities

- T003 + T004 (types + validators) in parallel
- T010 + T011 + T012 (frontend data layer) in parallel
- T013 + T014 (dialog + button update) in parallel, depend on T010

---

## Implementation Strategy

### Minimal Viable Path

1. Phase 1: Schema change (blocking)
2. Phase 2: Backend endpoint (can be tested via curl/Postman)
3. Phase 3: Frontend dialog (end-to-end flow)
4. Phase 4: Polish

Each step is independently testable:
- Phase 2 can be tested with curl: `POST /api/admin/payments/manual` with sample data
- Phase 3 adds the UI layer on top of the working endpoint
