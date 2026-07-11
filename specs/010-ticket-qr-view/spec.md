# Feature Specification: Ticket QR View

**Feature Branch**: `010-ticket-qr-view`

**Created**: 2026-07-11

**Status**: Draft

**Input**: "Add QR code view with download for each user ticket in /mi-cuenta/entradas using qrcode.react, expandable dropdown with extra info"

## User Stories

### User Story 1 - User views QR code and ticket details (Priority: P1)

As a client, I want to expand each ticket in my tickets list to see a QR code and extra information, and download the QR as an image.

**Independent Test**: Click a ticket card in `/mi-cuenta/entradas` → expandable section shows QR code, ticket code, status, purchase date, and a download button.

**Acceptance Scenarios**:
1. **Given** a ticket card, **When** user clicks it, **Then** an expandable section slides open with QR code rendered from `qrToken`.
2. **Given** the expanded section, **When** rendered, **Then** it shows: QR code image, ticket code, status (color-coded), purchase date, ticket type name, and price.
3. **Given** the expanded QR code, **When** user clicks "Descargar QR", **Then** the QR code is downloaded as a PNG image.
4. **Given** a ticket without `qrToken`, **When** expanded, **Then** a placeholder "QR no disponible" is shown instead.

## Requirements

- **FR-001**: `qrcode.react` QRCodeSVG MUST be used to render the QR code from `ticket.qrToken`.
- **FR-002**: Expand/collapse MUST be toggled by clicking the entire TicketCard — no separate button.
- **FR-003**: Expanded section MUST show QR code (256px), ticket code (monospace), status badge, purchase date, ticket type name, price.
- **FR-004**: Download button MUST save the QR code region as a PNG using `html-to-image` library.
- **FR-005**: If `ticket.qrToken` is null, show muted "QR no disponible" text instead of QR code.
- **FR-006**: Transition animation MUST be smooth (collapse/expand).
