# Feature Specification: Prisma Schema & Database Setup

**Feature Branch**: `001-prisma-schema-setup`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "Define complete Prisma schema covering all business entities (users, admins, events, ticket_types, tickets, payments, venues, event_images, discount_codes, privacy_acceptances, event_guests, survey_responses) and set up Prisma Client connection to Supabase PostgreSQL"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Schema Validation and Migration (Priority: P1)

Developers need a validated database schema that can be deployed to create all application tables. The schema must compile without errors and generate runnable migrations.

**Why this priority**: The database is the foundation of the entire platform. Nothing else works without a valid schema.

**Independent Test**: Can be fully tested by running schema validation (prisma validate) and generating a migration (prisma migrate dev). If the schema compiles and migration runs without errors, the story is complete.

**Acceptance Scenarios**:

1. **Given** the schema.prisma file with all 12 entities defined, **When** prisma validate is executed, **Then** no errors are reported
2. **Given** a valid schema, **When** prisma migrate dev is executed against the Supabase PostgreSQL database, **Then** all tables are created with correct columns, types, and constraints

---

### User Story 2 - Prisma Client Singleton (Priority: P1)

Application code needs a single, reusable Prisma Client instance to query the database without creating redundant connections per request.

**Why this priority**: Without the client singleton, the application cannot interact with the database. This is a prerequisite for all repository, service, and controller layers.

**Independent Test**: Can be fully tested by importing the client singleton and executing `prisma.user.findMany()`. If the query runs without error, the story is complete.

**Acceptance Scenarios**:

1. **Given** the Prisma Client singleton is exported from `src/shared/database/prisma.client.ts`, **When** the client is imported in another module, **Then** the same instance is reused across all imports
2. **Given** the client singleton is initialized, **When** a basic query (`prisma.user.findMany()`) is executed, **Then** it returns successfully without connection errors

---

### User Story 3 - Enum Definitions for Status Fields (Priority: P2)

Status fields (ticket status, payment status, event status, event guest status, discount code type, privacy policy type, admin role) must be defined as enums, not free-text strings, to ensure data integrity and type safety.

**Why this priority**: Enums prevent invalid states and make the schema self-documenting. This protects data integrity from day one.

**Independent Test**: Can be fully tested by inspecting the generated Prisma schema — all status/type fields must reference enum types, not `String`.

**Acceptance Scenarios**:

1. **Given** the schema defines status fields (ticket, payment, event), **When** the Prisma schema is inspected, **Then** all status fields use enum types
2. **Given** the schema defines role and type fields (admin role, discount type, policy type), **When** the Prisma schema is inspected, **Then** all such fields use enum types

---

### User Story 4 - Relation Integrity (Priority: P2)

All foreign keys and relations between entities must be correctly defined to maintain referential integrity across the data model.

**Why this priority**: Correct relations ensure data consistency and enable efficient queries across related entities (e.g., find all tickets for an event).

**Independent Test**: Can be fully tested by running prisma validate and checking that no relation errors exist, plus verifying the migration SQL includes correct foreign key constraints.

**Acceptance Scenarios**:

1. **Given** the schema defines relations between all entities, **When** prisma validate is executed, **Then** no relation errors are reported
2. **Given** the migration is generated, **When** the SQL is inspected for foreign key constraints, **Then** all defined relations include proper foreign key references

---

### Edge Cases

- Multiple entities reference the same target (users and admins are separate; tickets references both users and admins via checked_in_by)
- Timestamp precision: all timestamp fields use TIMESTAMPTZ for timezone-aware storage
- Nullable foreign keys: discount_code_id on tickets, checked_in_by on tickets, user_id on survey_responses

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a validated Prisma schema containing all 12 entities: users, admins, privacy_acceptances, venues, events, event_images, ticket_types, discount_codes, tickets, payments, event_guests, survey_responses
- **FR-002**: Every model MUST use a UUID primary key (`@id @default(uuid())`)
- **FR-003**: All column names MUST use snake_case via `@map`, with camelCase field names in Prisma models
- **FR-004**: Every timestamp field MUST use `TIMESTAMPTZ` (`@db.Timestamptz`)
- **FR-005**: users and admins MUST be fully separate models — no shared base table or shared foreign key target
- **FR-006**: ticket_types MUST have a required relation to events (one event → many ticket types)
- **FR-007**: tickets MUST relate to both ticket_types and users, and optionally to payments
- **FR-008**: payments MUST relate to tickets and users
- **FR-009**: privacy_acceptances MUST relate to users, storing policy version (string/semver), accepted timestamp, IP address, and user agent
- **FR-010**: Status fields (ticket status, payment status, event status, guest status) MUST use Prisma enum types, not free-text strings
- **FR-011**: Role fields (admin role) and type fields (discount type, policy type) MUST use Prisma enum types
- **FR-012**: Prisma Client MUST connect to Supabase using DATABASE_URL (pooled) for app queries and DIRECT_URL (direct connection) for migrations
- **FR-013**: Prisma Client MUST be instantiated as a singleton and reused across the application
- **FR-014**: discount_codes MUST have an optional relation to events (FK to events.id)
- **FR-015**: tickets may optionally have a relation to discount_codes (nullable FK)
- **FR-016**: tickets may optionally have a relation to admins for check-in tracking (checked_in_by, nullable FK)
- **FR-017**: survey_responses MUST relate to events and optionally to users (nullable user_id FK)
- **FR-018**: email fields on both users and admins MUST be unique
- **FR-019**: ticket_code on tickets MUST be unique
- **FR-020**: discount code on discount_codes MUST be unique

### Key Entities *(include if feature involves data)*

- **Users**: Registered buyers and ticket purchasers. Contains identity fields (name, email, phone, password hash), status flag, timestamps.
- **Admins**: Platform staff with different roles (super_admin, organizer, staff, checker). Separate from users with its own identity fields and role enum.
- **Privacy Acceptances**: Tracks user consent for privacy policy and terms of service (Ley 1581 compliance). Links to users, stores policy version, acceptance timestamp, IP, user agent.
- **Venues**: Physical locations where events take place.
- **Events**: Core event entity with title, date, door opening, sale end, status (draft/published/finished/cancelled).
- **Event Images**: Media assets associated with events.
- **Ticket Types**: Pricing tiers per event (name, description, price, quantity, max per user). Child of events.
- **Discount Codes**: Promotional codes per event (percentage or fixed amount). Optional relation to events.
- **Tickets**: Issued tickets linking ticket type to user. Tracks status (reserved/active/used/cancelled/expired), check-in data, discount applied.
- **Payments**: Payment transactions linked to tickets and users. Tracks amount, currency, method, gateway reference, status (pending/completed/failed/refunded).
- **Event Guests**: Guest list or invite-only attendees.
- **Survey Responses**: Post-event survey answers linked to events and optionally to users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Schema compiles without errors when validated (prisma validate returns zero errors)
- **SC-002**: A migration runs successfully against Supabase PostgreSQL target database, creating all 12 tables with correct columns, types, and constraints
- **SC-003**: The Prisma Client singleton can be imported and execute a basic query (e.g., `prisma.user.findMany()`) without connection errors
- **SC-004**: No status, role, or type field uses a free-text String — all use Prisma enums
- **SC-005**: All foreign key relations are validated by Prisma's relation engine — zero relation errors reported

## Assumptions

- SUPABASE: The Supabase PostgreSQL database is provisioned and connection strings (DATABASE_URL for pooled, DIRECT_URL for direct) are configured in .env
- ENUMS: Free-text status fields from the input description are converted to Prisma enums for data integrity (FR-010, FR-011)
- EVENT GUESTS: Included as a basic model with relation to events and users; detailed field specification assumed consistent with other entities
- VENUES AND EVENT IMAGES: Included as basic models with expected standard fields; detailed specification assumed consistent with the platform's needs
- NAMING: All models use camelCase for Prisma field names and snake_case via @map for column names
- MIGRATION: prisma migrate dev is used in development; prisma migrate deploy for production/staging
