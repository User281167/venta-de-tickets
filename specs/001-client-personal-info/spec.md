# Feature Specification: Client Personal Information Endpoints

**Feature Branch**: `001-client-personal-info`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "Create/modify client role personal information endpoints. get info dto, all info. set info, cedula cannot be set after init, when user was created cedula is null so if he enter I new one should no set again, so for schema validator cedula from 8 to 15 number max, check when is setting information. only client role can call this, no admin no other role in jwt"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Client views own personal information (Priority: P1)

An authenticated client accesses their profile to view all stored personal information including cedula, name, phone, address, and date of birth.

**Why this priority**: Read access is the foundation — clients need to verify their data before or after updating it.

**Independent Test**: A client authenticates, calls the personal info GET endpoint, and receives a complete DTO with all personal fields populated (or empty/null if never set).

**Acceptance Scenarios**:

1. **Given** an authenticated client with personal information stored, **When** they request their personal info, **Then** the system returns a complete DTO with all fields (cedula, first name, last name, phone, address, date of birth).
2. **Given** an authenticated client with no personal information set, **When** they request their personal info, **Then** the system returns a DTO with all fields as null or empty.
3. **Given** a request from an admin or unauthenticated user, **When** they call the endpoint, **Then** the system returns 403 Forbidden.

---

### User Story 2 - Client sets personal information for the first time (Priority: P1)

A newly registered client provides their personal information including cedula, establishing their profile for the first time.

**Why this priority**: Setting initial info is the entry point for all subsequent operations — without it the personal info feature has no value.

**Independent Test**: A client with no personal info on record submits complete personal data including cedula. The system stores it and subsequent GET calls return the submitted values.

**Acceptance Scenarios**:

1. **Given** a client with no existing personal information, **When** they submit their personal data including a valid cedula (8-15 digits), **Then** the system stores all fields and returns success.
2. **Given** a client with no existing personal information, **When** they submit with an invalid cedula (less than 8 digits, more than 15 digits, or non-numeric characters), **Then** the system returns a validation error.

---

### User Story 3 - Client updates personal information (Priority: P2)

An existing client updates their personal details such as phone, address, or other mutable fields while the cedula remains unchanged.

**Why this priority**: Updates are important but the core value (view + initial set) comes first. This is a natural follow-up.

**Independent Test**: A client with existing personal info updates their phone and address. The system applies changes and preserves the previously set cedula unchanged.

**Acceptance Scenarios**:

1. **Given** a client with existing personal information including a previously set cedula, **When** they submit an update with new phone and address, **Then** the system updates the mutable fields and the cedula remains unchanged.
2. **Given** a client with existing personal information including a previously set cedula, **When** they submit an update with a different cedula value, **Then** the system rejects the request and returns an error indicating cedula is immutable.
3. **Given** a client with existing personal information including a previously set cedula, **When** they submit an update omitting cedula from the payload, **Then** the system updates only the provided fields and preserves the existing cedula.

---

### Edge Cases

- What happens when a client with no personal info submits an update (not initial set) with only partial fields?
- How does the system handle a client who has never set cedula and is now updating, including cedula in the payload? (Should be treated as initial set for cedula.)
- What happens when a non-client JWT (admin, staff, expired token) calls any endpoint?
- How does the system handle concurrent update requests for the same client?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a GET endpoint for authenticated clients to retrieve their complete personal information DTO.
- **FR-002**: System MUST provide a PUT/PATCH endpoint for authenticated clients to set or update their personal information.
- **FR-003**: System MUST validate cedula as exactly 8 to 15 numeric digits when provided in a request payload.
- **FR-004**: System MUST reject any request that attempts to modify an already-set cedula. Cedula is immutable after its first successful set.
- **FR-005**: System MUST restrict both endpoints to JWT tokens carrying the "client" role only.
- **FR-006**: System MUST return 403 Forbidden when admin, other roles, or non-authenticated requests hit these endpoints.
- **FR-007**: System MUST return the personal information DTO containing at minimum: cedula, first name, last name, phone, address, and date of birth.
- **FR-008**: System MUST allow a client who registered without cedula to set it in their first personal information submission.

### Key Entities

- **ClientPersonalInfo**: Stores all personal data associated with a client account. Tied one-to-one with a user (client role). Fields include cedula (set-once, 8-15 digits), first name, last name, phone, address, and date of birth. Cedula starts as null and becomes immutable once set.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A client can retrieve their complete personal information in under 2 seconds end-to-end.
- **SC-002**: A client can complete initial personal information setup (including cedula) in a single request/response cycle.
- **SC-003**: Cedula immutability is enforced 100% of the time — no scenario exists where a previously set cedula can be changed through the API.
- **SC-004**: Non-client roles (admin, staff, unauthenticated) are rejected with 403 Forbidden 100% of the time across all endpoints.
- **SC-005**: Validation rejects invalid cedula formats (non-numeric, wrong length) with a clear error message in every case.

## Assumptions

- The user registration flow does not collect cedula — it starts as null in the user record.
- Personal information is stored in a dedicated table separate from the user authentication record.
- JWT tokens contain a "role" claim that distinguishes "client" from "admin" and other roles.
- Standard personal info fields beyond cedula include: first name, last name, phone, address, date of birth.
- All fields except cedula are mutable on every update request.
- The same endpoint handles both initial set (when no record exists) and subsequent updates (when record exists), with cedula immutability enforced at the application layer.
