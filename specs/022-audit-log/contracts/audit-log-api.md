# Contract: GET /api/audit-log

**Branch**: `022-audit-log` | **Date**: 2026-07-31

## Endpoint

```
GET /api/audit-log
```

Protegido por `authMiddleware` + `requireRole('super_admin')`. Respuesta
solo lectura; no expone acciones de mutación (FR-006).

### Query params

| Param | Tipo | Requerido | Default | Notas |
|-------|------|-----------|---------|-------|
| `since` | ISO 8601 timestamp | No | — | Polling incremental: `createdAt > since` |
| `cursor` | string (opaque) | No | — | Cursor de paginación de la respuesta anterior |
| `entityType` | string | No | — | Filtro exacto por entidad (`TicketType`, `Ticket`, `Payment`, `DiscountCode`) |
| `limit` | int | No | `50` | Máx `100` |

### Respuesta 200

```json
{
  "data": [
    {
      "id": "cuid...",
      "actorId": "uuid...",
      "actorName": "Nombre del actor",
      "actorRole": "admin",
      "action": "ticket_type.price_updated",
      "entityType": "TicketType",
      "entityId": "uuid...",
      "metadata": { "priceBefore": 50000, "priceAfter": 60000 },
      "createdAt": "2026-07-31T14:30:00.000Z"
    }
  ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiI...", 
  "hasMore": true
}
```

- `data`: registros en orden cronológico descendente (más reciente primero) o ascendente según `since` (ver nota).
- `nextCursor`: `null` si no hay más páginas. Opaco para el cliente; se devuelve tal cual en el siguiente request.
- `actorName`: nombre legible resuelto en el join (el `actorRole` es snapshot del registro, el nombre es de solo lectura para display).
- `hasMore`: booleano de conveniencia; el cliente puede usar `nextCursor != null`.

### Errores

| Status | Caso |
|--------|------|
| `401` | Sin sesión / token inválido |
| `403` | Rol distinto de `super_admin` |
| `400` | Query params inválidos (`limit > 100`, `since`/`cursor` malformados) |

### Reglas de paginación

- Orden por `(createdAt, id)`.
- Con `since`: devuelve registros `createdAt > since`, limitado a `limit`, y el `nextCursor` permite seguir paginando desde ahí.
- Sin `since`: página inicial de los `limit` más recientes.
- El cursor codifica `{ createdAt, id }` del último registro de la página.

## Relación con el spec

- FR-003: consulta cronológica + filtro `entityType` + paginación ✔
- FR-004: `refetchInterval: 4000` del lado cliente alimenta `since` (incremental) ✔
- FR-005/SC-002: `requireRole('super_admin')` ✔
- FR-010: endpoint de solo lectura, no genera registros de auditoría ✔
