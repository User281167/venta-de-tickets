# Data Model: Prisma Schema

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-29

## Enums

### AdminRole
- `super_admin` — Full platform access
- `organizer` — Event creation/management
- `staff` — Check-in, ticket validation
- `checker` — Read-only verification

### EventStatus
- `draft` — Not yet published
- `published` — Active, ticket sales open
- `finished` — Event concluded
- `cancelled` — Event cancelled, no sales

### TicketStatus
- `reserved` — Held during checkout, time-limited
- `active` — Purchased, valid for entry
- `used` — Scanned/checked in
- `cancelled` — Refunded or admin-cancelled
- `expired` — Past event date, unused

### PaymentStatus
- `pending` — Awaiting gateway confirmation
- `completed` — Successfully processed
- `failed` — Transaction declined/error
- `refunded` — Money returned

### DiscountType
- `percentage` — Discount as % of ticket price
- `fixed` — Fixed amount deducted

### PolicyType
- `privacy_policy` — Data processing consent (Ley 1581)
- `terms_of_service` — Platform terms acceptance

### GuestStatus
- `invited` — Invitation sent, awaiting response
- `confirmed` — Accepted invitation
- `declined` — Rejected invitation
- `attended` — Checked in at event

## Models

### users
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| fullName | String | @db.VarChar(150) | |
| email | String | @unique, @db.VarChar(255) | |
| phone | String? | @db.VarChar(20) | E.164 format |
| passwordHash | String | | |
| isActive | Boolean | @default(true) | |
| createdAt | DateTime | @default(now()), @db.Timestamptz | |
| updatedAt | DateTime | @updatedAt, @db.Timestamptz | |

**Relations**: Has many `privacyAcceptances`, `tickets`, `payments`, `surveyResponses` (optional), `eventGuests`

### admins
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| fullName | String | @db.VarChar(150) | |
| email | String | @unique, @db.VarChar(255) | |
| passwordHash | String | | |
| role | AdminRole | | Enum |
| isActive | Boolean | @default(true) | |
| createdAt | DateTime | @default(now()), @db.Timestamptz | |
| updatedAt | DateTime | @updatedAt, @db.Timestamptz | |

**Relations**: Checked in tickets (`tickets` via `checkedInBy`), created events

### privacy_acceptances
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| userId | String | FK → users.id | |
| policyVersion | String | @db.VarChar(20) | Semver string |
| policyType | PolicyType | | Enum |
| acceptedAt | DateTime | @default(now()), @db.Timestamptz | |
| ipAddress | String | @db.Inet | |
| userAgent | String | | |

**Relations**: Belongs to `users`

### venues
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| name | String | @db.VarChar(200) | |
| address | String | | |
| city | String | @db.VarChar(100) | |
| capacity | Int? | | Max attendees |
| createdAt | DateTime | @default(now()), @db.Timestamptz | |
| updatedAt | DateTime | @updatedAt, @db.Timestamptz | |

**Relations**: Has many `events`

### events
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| title | String | @db.VarChar(200) | |
| description | String? | | |
| venueId | String | FK → venues.id | |
| createdById | String | FK → admins.id | Organizer |
| eventDate | DateTime | @db.Timestamptz | |
| doorsOpenAt | DateTime? | @db.Timestamptz | |
| saleStartsAt | DateTime? | @default(now()), @db.Timestamptz | |
| saleEndsAt | DateTime? | @db.Timestamptz | |
| status | EventStatus | | Enum |
| createdAt | DateTime | @default(now()), @db.Timestamptz | |
| updatedAt | DateTime | @updatedAt, @db.Timestamptz | |

**Relations**: Belongs to `venue`, belongs to `creator` (admin), has many `ticketTypes`, `discountCodes`, `eventImages`, `tickets`, `eventGuests`, `surveyResponses`

### event_images
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| eventId | String | FK → events.id | |
| url | String | | |
| alt | String? | @db.VarChar(200) | |
| isPrimary | Boolean | @default(false) | |
| sortOrder | Int | @default(0) | |
| createdAt | DateTime | @default(now()), @db.Timestamptz | |

**Relations**: Belongs to `events`

### ticket_types
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| eventId | String | FK → events.id | |
| name | String | @db.VarChar(100) | e.g. "VIP", "General" |
| description | String? | | |
| price | Decimal | @db.Decimal(12, 2) | |
| quantityTotal | Int | | |
| quantitySold | Int | @default(0) | |
| maxPerUser | Int? | | Max per buyer |
| saleStartsAt | DateTime? | @db.Timestamptz | |
| saleEndsAt | DateTime? | @db.Timestamptz | |
| isActive | Boolean | @default(true) | |
| createdAt | DateTime | @default(now()), @db.Timestamptz | |
| updatedAt | DateTime | @updatedAt, @db.Timestamptz | |

**Relations**: Belongs to `events`, has many `tickets`

### discount_codes
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| eventId | String | FK → events.id | |
| code | String | @unique, @db.VarChar(50) | |
| discountType | DiscountType | | Enum |
| discountValue | Decimal | @db.Decimal(10, 2) | |
| maxUses | Int? | | Null = unlimited |
| usedCount | Int | @default(0) | |
| validUntil | DateTime? | @db.Timestamptz | |
| isActive | Boolean | @default(true) | |
| createdAt | DateTime | @default(now()), @db.Timestamptz | |

**Relations**: Belongs to `events`, has many `tickets`

### event_guests
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| eventId | String | FK → events.id | |
| userId | String? | FK → users.id | Null for external guests |
| fullName | String | @db.VarChar(150) | |
| email | String? | @db.VarChar(255) | |
| status | GuestStatus | | Enum |
| invitedAt | DateTime | @default(now()), @db.Timestamptz | |
| respondedAt | DateTime? | @db.Timestamptz | |

**Relations**: Belongs to `events`, belongs to `users` (optional)

### tickets
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| ticketTypeId | String | FK → ticket_types.id | |
| eventId | String | FK → events.id | Denormalized for query perf |
| userId | String | FK → users.id | |
| discountCodeId | String? | FK → discount_codes.id | |
| discountApplied | Decimal? | @db.Decimal(10, 2) | |
| ticketCode | String | @unique, @db.VarChar(100) | QR code content |
| status | TicketStatus | | Enum |
| reserveExpiresAt | DateTime? | @db.Timestamptz | For reserved status |
| purchasedAt | DateTime? | @db.Timestamptz | |
| cancelledAt | DateTime? | @db.Timestamptz | |
| checkedInAt | DateTime? | @db.Timestamptz | |
| checkedInBy | String? | FK → admins.id | |
| createdAt | DateTime | @default(now()), @db.Timestamptz | |

**Indexes**: `eventId`, `userId`, `ticketTypeId`, `status`

**Relations**: Belongs to `ticketType`, `event`, `user`, `discountCode` (optional), `checker` (admin, optional). Has one `payment`.

### payments
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| ticketId | String | FK → tickets.id | |
| userId | String | FK → users.id | |
| amount | Decimal | @db.Decimal(12, 2) | |
| currency | String | @default("COP"), @db.VarChar(10) | |
| paymentMethod | String | @db.VarChar(50) | e.g. "nequi", "pse" |
| gatewayReference | String | @db.VarChar(200) | Wompi transaction ID |
| status | PaymentStatus | | Enum |
| paidAt | DateTime? | @db.Timestamptz | |
| createdAt | DateTime | @default(now()), @db.Timestamptz | |

**Relations**: Belongs to `ticket`, belongs to `user`

### survey_responses
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, @default(uuid()) | |
| userId | String? | FK → users.id | Null for anonymous |
| eventId | String | FK → events.id | |
| responses | Json | @db.JsonB | Flexible key-value |
| submittedAt | DateTime | @default(now()), @db.Timestamptz | |

**Relations**: Belongs to `event`, belongs to `user` (optional)
