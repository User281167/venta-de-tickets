---
description: "Add Mis Entradas tab to sidebar, create tickets page with API, tests, dead code cleanup"
---

# Tasks: User Tickets Page

## Format: `[ID] [P?] [Story] Description`

- [X] T001 [US1] Add "Mis Entradas" link to `frontend/features/users/components/UserSidebar.tsx` — `/mi-cuenta/entradas` with IconTicket icon
- [X] T002 [US1] Create `frontend/app/(protected)/mi-cuenta/entradas/page.tsx` — route page rendering TicketList
- [X] T003 [US1] Create ticket types in `frontend/features/users/types/ticket.types.ts` — `TicketItem`, `TicketListResponse` matching backend `selectTicketForOwner` shape
- [X] T004 [US1] Create ticket schema in `frontend/features/users/schemas/ticket.schema.ts` — Zod `ticketItemSchema`, `ticketListResponseSchema`
- [X] T005 [US1] Create `frontend/features/users/api/tickets.client.ts` — `fetchMyTickets(page, limit)` calling `GET /api/me/tickets?page=X&limit=Y`
- [X] T006 [US1] Create `frontend/features/users/hooks/useMyTickets.ts` — TanStack Query `useMyTickets(page, limit)` hook
- [X] T007 [US1] Create `frontend/features/users/components/TicketCard.tsx` — single ticket: ticket type name, code, status badge (color-coded), purchase date
- [X] T008 [US1] Create `frontend/features/users/components/TicketList.tsx` — fetches via `useMyTickets`, renders list of TicketCard. Loading skeleton, empty "No tienes entradas registradas", error toast. Pagination.
- [X] T009 [P] [US2] Create schema tests in `frontend/features/users/schemas/__tests__/ticket.schema.test.ts`
- [X] T010 [P] [US2] Create mock data factory in `frontend/features/users/components/__tests__/mock-tickets.ts`
- [X] T011 [P] [US2] Create TicketList render test in `frontend/features/users/components/__tests__/TicketList.test.tsx`
- [X] T012 [US3] Remove dead `/admin/encuestas` link from `frontend/shared/components/AdminSidebar.tsx`
- [X] T013 [US3] Delete `frontend/features/surveys/` and `frontend/features/admin-surveys/` if they exist — already deleted in previous session
- [X] T014 [US3] Verify TS typecheck passes — no new errors

## Dependencies

- T001-T002 (sidebar + route) independent of T003-T008 (tickets implementation)
- T003-T008 sequential: types → schema → api → hook → TicketCard → TicketList
- T009-T011 (tests) depend on T003-T008 (need schemas + components)
- T012-T013 (dead code) independent — can run in parallel
