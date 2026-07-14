# Feature Specification: Client-Side Ticket Cart

**Feature Branch**: `001-client-ticket-cart`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "Build client side cart shop for tickets type, no login requirement"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse ticket types and add to cart (Priority: P1)

Visitor lands on event page, sees available ticket types with name, description, price, and remaining stock. Visitor clicks "Add to cart" for desired ticket type with chosen quantity. Cart badge updates to show item count.

**Why this priority**: Core conversion flow — without browsing and adding, no purchase happens.

**Independent Test**: Can be tested by loading an event page and adding one ticket type to cart. Cart badge confirms addition.

**Acceptance Scenarios**:

1. **Given** an event page with available ticket types, **When** a visitor clicks "Add to cart" on a ticket type, **Then** that ticket type is added to the cart with quantity 1 and a visual confirmation appears
2. **Given** a ticket type already in the cart, **When** the visitor clicks "Add to cart" again, **Then** the quantity increments by 1
3. **Given** a ticket type with 0 remaining stock, **When** the visitor views the event page, **Then** the "Add to cart" button is disabled and "Sold out" is displayed

---

### User Story 2 - View and manage cart (Priority: P1)

Visitor opens cart view (drawer, dropdown, or page) showing all selected items with quantities, unit prices, and running total. Visitor can increase quantity, decrease quantity, or remove items entirely.

**Why this priority**: Users need to review and adjust selections before committing to purchase.

**Independent Test**: Can be tested by adding multiple ticket types, then adjusting quantities and removing items — totals update in real time.

**Acceptance Scenarios**:

1. **Given** items in the cart, **When** the visitor opens the cart view, **Then** each item shows ticket type name, unit price, quantity, line total, and an overall cart total
2. **Given** an item with quantity 2 in the cart, **When** the visitor clicks the decrease button, **Then** quantity updates to 1 and totals recalculate
3. **Given** an item with quantity 1 in the cart, **When** the visitor clicks the remove button, **Then** the item is removed from the cart and totals recalculate
4. **Given** an empty cart, **When** the visitor opens the cart view, **Then** an empty-state message is shown with a link back to the event

---

### User Story 3 - Cart persists across navigation (Priority: P2)

Visitor adds items to cart, browses to other pages (event details, FAQ, etc.), returns, and cart contents are intact. Cart state survives accidental page refresh.

**Why this priority**: Users may explore the site before committing. Losing cart on navigation causes frustration and drop-off.

**Independent Test**: Can be tested by adding items, navigating away, and verifying cart contents remain on return.

**Acceptance Scenarios**:

1. **Given** items in the cart, **When** the visitor navigates to a different page and returns, **Then** cart contents are unchanged
2. **Given** items in the cart, **When** the visitor refreshes the page (F5 / Cmd+R), **Then** cart contents are restored

---

### User Story 4 - Proceed to checkout (Priority: P2)

Visitor clicks "Checkout" or "Proceed to payment" from cart. System validates all items are still available. If valid, visitor enters contact information (name + email) and proceeds to the existing Mercado Pago payment flow.

**Why this priority**: Cart is the entry point to the existing purchase pipeline. The bridge between anonymous selection and paid ticket must work.

**Independent Test**: Can be tested by filling cart, clicking checkout, entering contact info, and verifying the user reaches the Mercado Pago payment page with correct total and items listed.

**Acceptance Scenarios**:

1. **Given** a cart with valid items, **When** the visitor clicks "Proceed to checkout", **Then** a contact information form (name + email) is displayed
2. **Given** the visitor submits valid contact info, **When** the system confirms all ticket types still have sufficient stock, **Then** the visitor is redirected to the existing Mercado Pago checkout flow
3. **Given** a ticket type that sold out while the visitor was browsing, **When** the system checks stock at checkout, **Then** the visitor is informed which items are no longer available and prompted to update their cart

### Edge Cases

- **Sold-out ticket type in cart**: Ticket type stock reaches zero while item is in cart; on checkout attempt, user is notified and item is removed from cart
- **Quantity exceeds available stock**: User cannot increase quantity beyond what the system reports as available
- **Event expired**: Cart associated with an expired event is cleared on next site visit with a clear message
- **Browser storage unavailable**: Cart falls back to in-memory state for the current session only; user is informed that cart won't persist after closing the tab
- **Empty cart checkout attempt**: "Proceed to checkout" button is disabled when cart is empty

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display available ticket types for each event, showing name, description, unit price, and remaining stock
- **FR-002**: Visitors MUST be able to add ticket types to a cart without logging in or creating an account
- **FR-003**: Visitors MUST be able to view cart contents at any time showing item details, quantities, line totals, and overall total
- **FR-004**: Visitors MUST be able to adjust item quantities (increase, decrease, remove) in the cart
- **FR-005**: Cart MUST persist across page navigation and page refreshes within the same browser
- **FR-006**: System MUST show a cart item count badge visible from all pages
- **FR-007**: "Add to cart" MUST be disabled for sold-out ticket types with clear visual feedback
- **FR-008**: System MUST prevent adding more tickets of a type than available stock
- **FR-009**: On checkout, System MUST validate stock availability for all cart items before proceeding
- **FR-010**: System MUST collect visitor's name and email before redirecting to payment
- **FR-011**: System MUST display total amount (sum of all line totals) prominently in the cart view
- **FR-012**: System MUST provide visual feedback when items are added to or removed from the cart
- **FR-013**: Cart MUST be cleared after successful payment completion
- **FR-014**: If browser persistence is unavailable, System MUST fall back to session-only cart with a one-time notice

### Key Entities *(include if feature involves data)*

- **CartItem**: Represents a visitor's selection — references a ticket type ID, quantity, unit price (snapshot), and line total. Stored client-side only.
- **Cart**: Collection of cart items scoped to a single browser session. Stores subtotal, total, and last-updated timestamp. Held in localStorage or memory.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can add a ticket type to cart in 2 clicks or fewer from the event page
- **SC-002**: Cart contents survive full page refresh in 100% of cases where client-side storage is available
- **SC-003**: Cart total recalculates instantly (< 100ms perceived delay) on any quantity change
- **SC-004**: Visitor can go from empty cart to checkout in under 60 seconds
- **SC-005**: All cart interactions (add, remove, update quantity) succeed without server round-trips (purely client-side)

## Assumptions

- **Cart storage**: Client-side browser storage is the primary persistence mechanism, with session-only fallback when unavailable
- **Checkout integration**: After cart, the user enters their name + email inline (no separate auth step) and is sent to the existing Mercado Pago checkout flow
- **Single event scope**: Cart is scoped to a single event per session (not multi-event). Adding tickets from a different event clears the existing cart with a warning
- **Stock data source**: Ticket type availability is fetched from the existing `/events/:id` endpoint; stock is refreshed on page load and on checkout
- **Currency**: All prices displayed in Colombian Pesos (COP), consistent with the existing platform
- **Mobile responsiveness**: Cart UI follows existing Chakra UI responsive patterns used in the rest of the platform
