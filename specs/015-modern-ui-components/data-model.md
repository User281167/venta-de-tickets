# Data Model: Interfaz moderna para landing y dashboard

This feature does not introduce new database entities. It consumes existing entities exposed by the backend API. The frontend types and schemas already exist in `features/users` and `features/landing`.

## Entities consumed by the dashboard

### User

Represents the authenticated buyer.

| Field | Type | Notes |
|---|---|---|
| id | string | UUID |
| email | string | User email |
| role | string \| null | Platform role |
| fullName | string \| null | Display name |
| phone | string \| null | Contact phone |
| cedula | string \| null | Colombian ID |
| address | string \| null | Optional address |
| dateOfBirth | string \| null | ISO date string |

**Source**: `features/users/api/users.client.ts` (`GetMeResponse`)

### Ticket

Represents a purchased ticket for an event.

| Field | Type | Notes |
|---|---|---|
| id | string | UUID |
| event | object | Nested event summary (name, date, location, image) |
| status | string | active, used, cancelled |
| purchaseDate | string | ISO timestamp |
| attendee | object | Attendee details |

**Source**: `features/users/types/ticket.types.ts`, `features/users/schemas/ticket.schema.ts`

### Payment

Represents a transaction/order.

| Field | Type | Notes |
|---|---|---|
| id | string | UUID |
| status | string | pending, approved, rejected, etc. |
| total | number | Order total |
| createdAt | string | ISO timestamp |
| tickets | array | Related tickets summary |

**Source**: `features/users/types/payment.types.ts`, `features/users/schemas/payment.schema.ts`

## Entities consumed by the landing

### Event

Represents a public event available for purchase.

| Field | Type | Notes |
|---|---|---|
| id | string | UUID |
| name | string | Event title |
| date | string | ISO timestamp |
| location | string | Venue |
| image | string \| null | Cover image URL |
| description | string \| null | Public description |
| ticketTypes | array | Available ticket types and prices |

**Source**: Currently rendered statically in `features/landing/components`; public event API contract documented in [contracts/api.md](contracts/api.md).

## Dashboard summary view

The dashboard overview aggregates the above entities without creating new data:

- **Active tickets count**: count of tickets where `status === 'active'`
- **Recent payments**: last N payments ordered by `createdAt` desc
- **Profile completion**: presence of `fullName`, `phone`, `cedula`
- **Next event**: earliest future event from active tickets

No new backend endpoints or database tables are required.
