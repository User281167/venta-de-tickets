# Módulo Tickets — Gestión de Tipos de Entrada

CRUD de tipos de entrada (ticket types). Público puede listar y ver detalles. Solo admin puede crear, modificar y cambiar estado.

## Rutas Públicas

Montadas bajo `/api/tickets`. Sin autenticación.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tickets?page=&limit=` | Listar entradas activas/deshabilitadas (excluye bloqueadas) |
| GET | `/api/tickets/:id` | Detalle de entrada por ID (incluye bloqueadas) |

## Rutas Admin

Montadas bajo `/api/admin/tickets`. Requieren JWT + rol `admin`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/tickets?page=&limit=` | Listar TODAS las entradas (incluye bloqueadas) |
| POST | `/api/admin/tickets` | Crear nuevo tipo de entrada |
| PATCH | `/api/admin/tickets/:id` | Modificar campos + cambiar estado |

## Códigos de Error

| Código | Status | Causa |
|--------|--------|-------|
| `VALIDATION_ERROR` | 422 | Precio ≤ 0, cantidad ≤ 0, cantidad < vendidas, UUID inválido, body vacío, status inválido |
| `NOT_FOUND` | 404 | ID de entrada no existe |
| `FORBIDDEN` | 403 | Rol no es `admin` |
| `UNAUTHORIZED` | 401 | Token JWT faltante o inválido |

## Reglas de Negocio

- `status` puede ser `enabled` (comprable), `disabled` (visible, no comprable), `blocked` (oculta, no comprable)
- Al crear, status por defecto: `enabled`
- `price` y `quantityTotal` deben ser > 0
- Al modificar, `quantityTotal` no puede ser menor a `quantitySold` actual
- Entradas bloqueadas NO aparecen en listado público pero sí por ID individual
- Listado admin muestra todos los estados

## Flujos

### Crear tipo de entrada (admin)

```mermaid
sequenceDiagram
    participant Admin
    participant API as POST /admin/tickets
    participant DB as PostgreSQL

    Admin->>API: { name, price, quantityTotal, description?, maxPerUser?, saleEndsAt? }
    API->>API: validar price > 0, quantityTotal > 0
    alt Validación falla
        API-->>Admin: 422 VALIDATION_ERROR
    end
    API->>DB: INSERT ticket_type (status=enabled)
    DB-->>API: ticket type DTO
    API-->>Admin: 201 + ticket type
```

### Listar entradas (público)

```mermaid
sequenceDiagram
    participant User
    participant API as GET /tickets?page=1&limit=20
    participant DB as PostgreSQL

    User->>API: GET /api/tickets
    API->>DB: SELECT ticket_types WHERE status != 'blocked'
    API->>DB: COUNT ticket_types WHERE status != 'blocked'
    DB-->>API: results + total
    API-->>User: 200 { data: [...], total, page, limit }
```

### Modificar tipo de entrada + cambiar estado (admin)

```mermaid
sequenceDiagram
    participant Admin
    participant API as PATCH /admin/tickets/:id
    participant DB as PostgreSQL

    Admin->>API: { price?, quantityTotal?, status?, name?, ... }
    API->>DB: buscar ticket_type por id
    alt No existe
        API-->>Admin: 404 NOT_FOUND
    end
    alt Viene quantityTotal
        API->>DB: verificar quantityTotal >= quantitySold
        alt Es menor
            API-->>Admin: 422 VALIDATION_ERROR
        end
    end
    alt Viene status
        API->>API: validar status enum
        alt Inválido
            API-->>Admin: 422 VALIDATION_ERROR
        end
    end
    API->>DB: UPDATE ticket_type
    DB-->>API: ticket type DTO
    API-->>Admin: 200 + ticket type
```
