# Research: Prisma Schema & Database Setup

**Phase**: 0 — Outline & Research
**Date**: 2026-06-29

## Resolved Unknowns

### Connection Strategy: DATABASE_URL vs DIRECT_URL

**Decision**: Use `DATABASE_URL` with `?pgbouncer=true` & `pgbouncer=true` connection limit for runtime Prisma Client queries; use `DIRECT_URL` (direct Postgres connection, no pgBouncer) for `prisma migrate` commands.

**Rationale**: Supabase uses pgBouncer for connection pooling. Prisma Migrate requires direct connections for DDL statements (CREATE TABLE, ALTER, etc.) which pgBouncer's transaction mode blocks. This is the officially recommended Supabase + Prisma setup.

**Alternatives considered**: Single connection string — rejected because migrations would fail silently or with cryptic pgBouncer errors.

### Enum Naming Convention

**Decision**: PascalCase enum names (`TicketStatus`, `PaymentStatus`, `EventStatus`, `AdminRole`, `DiscountType`, `PolicyType`, `GuestStatus`). Enum values in UPPER_CASE. Enums defined at top of `schema.prisma` before models.

**Rationale**: Prisma convention. Enums are referenced by models as field types. No `@map` needed for enum values since they map directly.

**Alternatives considered**: Prefix enums with entity name (`TicketStatus` vs `Status`) — chosen for clarity.

### Soft-Delete on Events

**Decision**: No soft-delete in initial schema. Events have a `status` field (draft, published, finished, cancelled) for lifecycle management. Cancelled events remain visible but inactive.

**Rationale**: Spec explicitly says no soft-delete requirement. Status field adequately covers event lifecycle.

### Tickets vs Event Guests Relation

**Decision**: `event_guests` and `tickets` are separate entities. `event_guests` handles invite-only attendees (may or may not purchase); `tickets` handles paid/reserved admission. `tickets` has FK to `users`, not to `event_guests`. If a guest purchases, they get both a guest record and a ticket record.

**Rationale**: Keeps guest list management independent from ticket sales. Allows invite-only events where guests attend without purchasing.

### Supabase + Prisma Compatibility Notes

- Prisma versions 5.x+ support Supabase Postgres 15 without issues
- `prisma migrate dev` runs locally/CI; `prisma migrate deploy` runs on Railway deploy
- Connection strings stored in `.env` with example in `.env.example`
- `@db.Uuid` maps to PostgreSQL `uuid` type
- `@db.Timestamptz` maps to `timestamptz` (timezone-aware)
- `@db.Inet` maps to PostgreSQL `inet` type for IP storage
- `@db.JsonB` maps to PostgreSQL `jsonb` for survey responses

### Entity Build Order

Based on FK dependency graph:

1. `users`, `admins` — no dependencies
2. `privacy_acceptances` — depends on `users`
3. `venues` — no dependencies
4. `events` — depends on `venues` (venue_id FK) and `admins` (created_by FK)
5. `event_images` — depends on `events`
6. `ticket_types`, `discount_codes` — depend on `events`
7. `event_guests` — depends on `events` and `users`
8. `tickets` — depends on `ticket_types`, `events`, `users`, `discount_codes` (optional), `admins` (checked_in_by, optional)
9. `payments` — depends on `tickets`, `users`
10. `survey_responses` — depends on `events`, `users` (optional)

Enums defined upfront at file top.
