# Tasks: Donaciones

**Input**: Design documents from `/specs/019-donaciones/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: Tests are OPTIONAL - not explicitly requested in spec, so not included. Can be added later if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Note**: All paths are relative to repository root (monorepo: backend/ and frontend/).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for donations feature.

- [ ] T001 [P] Add Donation model and enums to backend/prisma/schema.prisma
- [ ] T002 [P] Run `npx prisma migrate dev --name add_donations` to create migration

**Checkpoint**: Database schema ready for donation data.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 [P] Modify MercadoPagoProvider constructor in backend/src/modules/payments/providers/mercadopago.provider.ts to accept config object
- [ ] T004 [P] Add new environment variables to backend/src/shared/config/env.ts (MERCADOPAGO_BARRANQUEROS_UTP_ACCESS_TOKEN, MERCADOPAGO_BARRANQUEROS_UTP_WEBHOOK_SECRET)
- [ ] T005 [P] Register 2 MercadoPagoProvider instances in backend/src/modules/payments/providers/provider.registry.ts (mercadopago-la-convencion, mercadopago-barranqueros-utp)
- [ ] T006 [P] Create donation Zod schema in backend/src/modules/donaciones/donaciones.schema.ts (fullName optional nullable, email optional nullable .email(), amountCents number int min 2000, account nativeEnum)
- [ ] T007 [P] Create donation repository in backend/src/modules/donaciones/donaciones.repository.ts (create, updateStateByExternalReference, findByExternalReference)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Donar a La Convención (Priority: P1) 🎯 MVP

**Goal**: Users can donate to La Convención account via Mercado Pago, complete payment, and see confirmation.

**Independent Test**: Can be fully tested by creating a donation to La Convención account, completing MP payment, and verifying status updates via webhook and polling.

### Implementation for User Story 1

- [ ] T008 [US1] Implement createDonation service method in backend/src/modules/donaciones/donaciones.service.ts (generates externalReference DON-LA_CONVENCION-{uuid}, creates preference via provider, returns init_point)
- [ ] T009 [US1] Implement handleWebhook service method in backend/src/modules/donaciones/donaciones.service.ts (verifies signature, parses payload, updates donation state with idempotency)
- [ ] T010 [US1] Implement getStatus service method in backend/src/modules/donaciones/donaciones.service.ts (returns donation state by externalReference)
- [ ] T011 [US1] Implement donation controller in backend/src/modules/donaciones/donaciones.controller.ts (createDonation, handleLaConvencionWebhook, getStatus)
- [ ] T012 [US1] Implement donation routes in backend/src/modules/donaciones/donaciones.routes.ts (POST /api/donaciones, POST /api/donaciones/webhook/mercadopago-la-convencion, GET /api/donaciones/:externalReference/status)
- [ ] T013 [US1] Register donation routes in backend/src/app.ts or backend/src/routes/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can donate to La Convención, payment goes through MP, webhook updates status, and polling works.

---

## Phase 4: User Story 2 - Donar a Barranqueros UTP (Priority: P1)

**Goal**: Users can donate to Barranqueros UTP account via Mercado Pago, complete payment, and see confirmation.

**Independent Test**: Can be fully tested by creating a donation to Barranqueros UTP account, completing MP payment, and verifying status updates. Uses separate webhook endpoint.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Add handleBarranquerosWebhook service method in backend/src/modules/donaciones/donaciones.service.ts (reuses handleWebhook logic with different provider)
- [ ] T015 [US2] Add Barranqueros UTP webhook route in backend/src/modules/donaciones/donaciones.routes.ts (POST /api/donaciones/webhook/mercadopago-barranqueros-utp)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can donate to either account.

---

## Phase 5: User Story 3 - Webhook Processing (Priority: P1)

**Goal**: Mercado Pago webhooks for both accounts are processed correctly with idempotency and metadata storage.

**Independent Test**: Can be tested by sending webhook payloads directly to both endpoints and verifying donation state updates and metadata storage.

### Implementation for User Story 3

- [ ] T016 [US3] Verify idempotency in handleWebhook in backend/src/modules/donaciones/donaciones.service.ts (UPDATE where state = pending, check affected rows)
- [ ] T017 [US3] Ensure metadata field stores raw webhook payload in backend/src/modules/donaciones/donaciones.service.ts
- [ ] T018 [US3] Verify Ley 1581 compliance: no logging of webhook payload outside metadata in backend/src/modules/donaciones/

**Checkpoint**: Webhook processing is robust, idempotent, and compliant. All donation state transitions work correctly.

---

## Phase 6: User Story 4 - Polling de Estado (Priority: P2)

**Goal**: Users see real-time donation status updates on return page via short polling.

**Independent Test**: Can be tested by creating a donation, completing payment, and verifying the return page updates from pending to confirmed within seconds.

### Implementation for User Story 4

- [ ] T019 [P] [US4] Create DonationButton component in frontend/src/features/donaciones/components/DonationButton.tsx (props: account, label)
- [ ] T020 [P] [US4] Create DonationForm component in frontend/src/features/donaciones/components/DonationForm.tsx (Zod validation, form fields)
- [ ] T021 [US4] Create donation API client in frontend/src/features/donaciones/api/donaciones.ts (POST /api/donaciones mutation with TanStack Query)
- [ ] T022 [US4] Create return page in frontend/src/app/donaciones/retorno/page.tsx (polling GET /api/donaciones/:ref/status every 3 seconds)
- [ ] T023 [US4] Add DonationButton instances to landing page in frontend/src/app/page.tsx (2 buttons: La Convención and Barranqueros UTP)

**Checkpoint**: Frontend donation flow is complete. Users can donate via UI, get redirected to MP, and see status updates on return.

---

## Phase 7: Polish & Cross-Cutting Concerns


**Purpose**: Improvements that affect multiple user stories.

- [ ] T024 [P] Add error handling and user-friendly messages in frontend donation flow
- [ ] T025 [P] Add loading states to DonationButton and DonationForm
- [ ] T026 [P] Add success/error feedback on return page
- [ ] T027 [P] Verify CORS configuration for donation endpoints
- [ ] T028 [P] Add rate limiting to POST /api/donaciones endpoint
- [ ] T029 Run manual tests: create donation to La Convención, create donation to Barranqueros UTP, simulate webhook for each

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Shares service with US1 but uses different webhook
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Depends on US1/US2 service methods existing
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) + US1/US2/US3 backend complete - Frontend needs working endpoints

### Within Each User Story

- Service methods before controller
- Controller before routes
- Routes before frontend integration
- Core implementation before polish

### Parallel Opportunities

- All Setup tasks (T001, T002) can run in parallel
- All Foundational tasks (T003-T007) can run in parallel (different files)
- Once Foundational phase completes, US1 and US2 can start in parallel
- US3 can start once service methods exist (after US1/US2 core)
- US4 (frontend) can start once backend endpoints are defined
- All US4 tasks (T019-T023) can run in parallel (different files)
- All Polish tasks (T024-T028) can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all foundational tasks together:
Task: "Modify MercadoPagoProvider constructor in backend/src/modules/payments/providers/mercadopago.provider.ts"
Task: "Add new environment variables to backend/src/shared/config/env.ts"
Task: "Register 2 MercadoPagoProvider instances in backend/src/modules/payments/providers/provider.registry.ts"
Task: "Create donation Zod schema in backend/src/modules/donaciones/donaciones.schema.ts"
Task: "Create donation repository in backend/src/modules/donaciones/donaciones.repository.ts"
```

---

## Parallel Example: User Story 4 (Frontend)

```bash
# Launch all frontend tasks together:
Task: "Create DonationButton component in frontend/src/features/donaciones/components/DonationButton.tsx"
Task: "Create DonationForm component in frontend/src/features/donaciones/components/DonationForm.tsx"
Task: "Create donation API client in frontend/src/features/donaciones/api/donaciones.ts"
Task: "Create return page in frontend/src/app/donaciones/retorno/page.tsx"
Task: "Add DonationButton instances to landing page in frontend/src/app/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T007) - CRITICAL
3. Complete Phase 3: User Story 1 (T008-T013)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Create donation to La Convención
   - Complete MP payment (sandbox)
   - Verify webhook updates status
   - Verify polling shows confirmed state
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (both accounts)
4. Add User Story 3 → Verify webhook robustness → Deploy/Demo
5. Add User Story 4 → Complete frontend → Deploy/Demo (full feature)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T007)
2. Once Foundational is done:
   - Developer A: User Story 1 backend (T008-T013)
   - Developer B: User Story 2 + 3 backend (T014-T018)
   - Developer C: User Story 4 frontend (T019-T023)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Backend tasks use `backend/` prefix, frontend tasks use `frontend/` prefix
