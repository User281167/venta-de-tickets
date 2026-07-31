# Data Model: Módulo de Auditoría

**Branch**: `022-audit-log` | **Date**: 2026-07-31

## Entidad: `AuditLog`

Tabla única de auditoría. Sin `eventId` (no existe tabla `events` — ver research.md §1). Accedida solo vía Prisma (no expuesta a Realtime).

### Modelo Prisma

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  actorId    String
  actor      User     @relation(fields: [actorId], references: [id], onDelete: Restrict)
  actorRole  String
  action     String
  entityType String
  entityId   String
  metadata   Json?
  createdAt  DateTime @default(now()) @db.Timestamptz

  @@index([createdAt, id])
  @@index([entityType, entityId])
  @@map("audit_log")
}
```

Notas del mapeo a convenciones del proyecto:

- **PK**: `cuid()` en lugar de `gen_random_uuid()` de las tablas existentes. CUID es legible y ordenable en logs; las tablas actuales usan `@db.Uuid` con `gen_random_uuid()`. Se mantiene `cuid()` porque el PK además es el desempate del cursor `(createdAt, id)`. *(Alternativa: `@default(dbgenerated("gen_random_uuid()"))` — correcta pero el id no ordena; el cursor igual funciona con el índice `(createdAt, id)`.)*
- **`actorId`**: FK a `users.id` con `onDelete: Restrict` — el sistema no borra usuarios físicamente (convención de no-borrado); si algún día se elimina un usuario, el registro de auditoría debe sobrevivir (bloquea el borrado en vez de perder historia).
- **`actorRole`**: `String` snapshot del rol al momento del hecho. No es FK al enum `UserRole` en vivo; si el usuario cambia de rol después, el registro no cambia retroactivamente.
- **`action`**: `String` namespaced libre (`"ticket_type.price_updated"`). No enum de Prisma → agregar acciones nuevas no requiere migración (FR-008).
- **`metadata`**: `Json?` selectivo. Nunca dump completo de entidad ni PII de compradores (FR-007, Ley 1581).

### Índices

| Índice | Propósito |
|--------|-----------|
| `@@index([createdAt, id])` | Polling incremental (`createdAt > since`) + cursor `(createdAt, id)` |
| `@@index([entityType, entityId])` | Futura vista "historial de esta entidad" (YAGNI hoy, barato de mantener) |

## Acciones auditadas (acciones `action` namespaced)

| Acción | entityType | metadata (selectivo) | Punto de inserción |
|--------|-----------|----------------------|--------------------|
| `ticket_type.created` | `TicketType` | `{ name, price, quantityTotal }` | `tickets.service.ts` → `createTicketType` |
| `ticket_type.price_updated` | `TicketType` | `{ priceBefore, priceAfter }` | `tickets.service.ts` → `updateTicketType` (cuando `price` presente) |
| `ticket_type.status_updated` | `TicketType` | `{ statusBefore, statusAfter }` | `tickets.service.ts` → `updateTicketType` (cuando `status` presente) |
| `ticket.cancelled` | `Ticket` | `{ statusBefore, statusAfter }` | checkin/tickets → flujo de cancelación |
| `ticket.checked_in` | `Ticket` | `{ statusBefore, statusAfter }` | `checkin` → confirm/check-in |
| `payment.status_changed` | `Payment` | `{ statusBefore, statusAfter, amountTotalCents }` | `payments.service.ts` → webhook/refund/admin payment |
| `discount_code.created` | `DiscountCode` | `{ code, discountType, discountValue }` | módulo de códigos (ubicación exacta en tasks) |
| `discount_code.deactivated` | `DiscountCode` | `{ code }` | módulo de códigos |

Los puntos de inserción exactos (nombres de función, línea) se confirman en
la fase de tasks al revisar cada módulo — la lista base puede ajustarse.

## Reglas de validación

- **`action`**: string namespaced `<entidad>.<verbo>` en minúsculas.
- **`entityType`**: nombre de la clase de entidad (`TicketType`, `Ticket`, `Payment`, `DiscountCode`).
- **`metadata`**: valores primitivos y arrays pequeños; **prohibido** incluir: objetos completos de entidades, emails, nombres, cédulas/documentos, números de tarjeta, payloads de webhooks.
- Excepción de PII: confirmación de identidad en check-in (solo el dato estrictamente necesario para la acción).

## Flujo de registro (no transaccional)

```
mutación principal (commit)
  → auditService.log({ actorId, actorRole, action, entityType, entityId, metadata })
  → try { auditRepository.create(...) } catch { logger.error }
  → nunca lanza, nunca revierte la mutación
```

El `actor` siempre viene del request autenticado (`req.user.id`, `req.user.role`) en la capa de servicio que ejecuta la mutación, no de un contexto global.
