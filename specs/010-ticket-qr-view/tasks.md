---
description: "Add expandable QR code view and download to ticket cards in /mi-cuenta/entradas"
---

# Tasks: Ticket QR View

**Input**: User description — "Add QR code view with download for each user ticket in /mi-cuenta/entradas using qrcode.react, expandable dropdown with extra info"

**Prerequisites**: Feature 009 (User Tickets Page) — TicketList, TicketCard, mock data factory already exist.

## Phase 1: Dependency Setup

- [X] T001 Install `html-to-image` in `frontend/package.json` — already present (1.11.13)

---

## Phase 2: User Story 1 — QR View & Download (P1)

**Goal**: Each TicketCard is clickable to reveal QR code, extra ticket info, and download button.

**Independent Test**: Click a ticket card → expandable section shows QR code from `qrToken`, ticket code, status badge, purchase date, type name, price, and a "Descargar QR" button that downloads PNG.

### Implementation

- [X] T002 [US1] Create `frontend/features/users/components/TicketQrExpand.tsx` — QRCodeCanvas from `ticket.qrToken`, download via `html-to-image` `toPng()`, "QR no disponible" when null.
- [X] T003 [US1] Modify `frontend/features/users/components/TicketCard.tsx` — click-to-toggle expand state, CSS max-height transition (Chakra v3 no Collapse), cursor pointer + hover.
- [X] T004 [US1] Create `frontend/features/users/components/__tests__/TicketCard.test.tsx` — 5 tests: renders name, renders status badge, renders price COP, toggles QR expand, QR no disponible for null qrToken.

**Checkpoint**: Navigate to `/mi-cuenta/entradas` → click a ticket → QR and info expand → download QR as image.

---

## Dependencies & Execution Order

- T001 (install dep) must complete before T002 (component uses html-to-image)
- T002 (TicketQrExpand) must complete before T003 (TicketCard imports it)
- T004 (test) depends on T002 + T003

### User Story Dependencies

- **US1**: No dependencies on other stories — single story feature

### Within US1

- T001 → T002 → T003 → T004 (sequential within story)

### Parallel Opportunities

- None for this feature — only one story, sequential deps

---

## Implementation Strategy

### MVP (US1 only — full feature)

1. T001: Install html-to-image
2. T002: Create TicketQrExpand component
3. T003: Wire expand/collapse into TicketCard
4. T004: Add tests
5. **STOP and VALIDATE**: Manual test in browser + `npm run test`

---

## Parallel Example: User Story 1

```bash
# Sequential only — each task depends on previous:
Task: "T001 Install html-to-image"
Task: "T002 Create TicketQrExpand"
Task: "T003 Wire expand into TicketCard"
Task: "T004 Create TicketCard tests"
```
