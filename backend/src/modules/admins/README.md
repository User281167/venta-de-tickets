# Módulo Admin — Gestión de Usuarios y Pagos

Solo rol `admin` (Prisma enum) puede acceder.

## Estructura del Módulo

| Archivo | Capa | Responsabilidad |
|---------|------|----------------|
| `admins.routes.ts` | Route | Define endpoints, aplica middlewares de autenticación y rol |
| `admins.controller.ts` | Controller | Valida input (Zod), orquesta servicios, formatea respuesta HTTP |
| `admins.service.ts` | Service | Lógica de negocio: usuarios (CRUD, batch, roles) y pagos admin |
| `admins.repository.ts` | Repository | Consultas Prisma sobre tabla `users` |
| `admins.validators.ts` | Validator | Schemas Zod para cada endpoint |
| `admins.types.ts` | Types | Tipos compartidos (`AdminRole`, `AdminProfile`) |

### Capa Service

| Método | Input | Output | Dependencias |
|--------|-------|--------|-------------|
| `listUsers` | page, limit, search? | `{ data, total, page, limit }` | `adminsRepo.findAll`, `adminsRepo.countAll` |
| `createUser` | data (email, password, fullName, ...) | user DTO | Supabase Auth + `adminsRepo.upsert` |
| `batchCreateUsers` | dataArray[] | user DTO[] | `checkUserExists`, `createUser` (loop) |
| `updateUser` | id, data (role?, cedula?, etc.) | user DTO | `adminsRepo.findById`, `adminsRepo.findByCedula`, Supabase Auth, `adminsRepo.update` |
| `updateRole` | id, role | user DTO | `adminsRepo.findById`, `adminsRepo.updateRole`, Supabase Auth |
| `checkUserExists` | userId | boolean | `adminsRepo.findById` |
| `createAdminPayment` | userId, provider, tickets, adminId | `{ paymentId, ticketIds }` | `paymentsService.createAdminPayment` |

### Capa Repository (Prisma — tabla `users`)

| Método | Query | Uso |
|--------|-------|-----|
| `findAll` | `findMany` con skip/take + search | Listar usuarios paginados |
| `countAll` | `count` con search | Total para paginación |
| `findById` | `findUnique` por id | Validar existencia |
| `findByCedula` | `findUnique` por cedula | Validar unicidad de cédula |
| `findConflicts` | `findMany` con OR emails/cedulas | Batch: detectar duplicados |
| `updateRole` | `update` con role | Cambiar rol |
| `upsert` | `upsert` por id | Crear usuario (fallback update) |
| `update` | `update` con datos parciales | Modificar campos |

## Rutas: Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/me` | Admin actual desde JWT |
| GET | `/api/admin/users?page=&limit=&search=` | Listar usuarios paginados |
| POST | `/api/admin/users` | Crear 1 cliente (Auth + Prisma) |
| POST | `/api/admin/users/batch` | Crear N clientes desde JSON (máx 50) |
| PATCH | `/api/admin/users/:id` | Modificar datos, cédula, rol, bloqueo |

## Rutas: Pagos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/payments?page=&limit=&status=&dateFrom=&dateTo=&search=` | Listar pagos paginados con filtros |
| GET | `/api/admin/payments/:id` | Detalle del pago + usuario + tickets |
| POST | `/api/admin/payments/:id/refund` | Reembolsar pago completo (borra tickets, restaura stock) |
| POST | `/api/admin/payments/manual` | Pago manual/gift + tickets en transacción |

## Códigos de Error

| Código | Status | Causa |
|--------|--------|-------|
| `VALIDATION_ERROR` | 422 | Datos inválidos |
| `CONFLICT` | 409 | Email o cédula ya existen |
| `NOT_FOUND` | 404 | Usuario/pago no existe |
| `AUTH_ERROR` | 502 | Error en Supabase Auth |
| `FORBIDDEN` | 403 | Rol no es `admin` |
| `INVALID_PAYMENT_STATUS` | 409 | Reembolso sobre pago no completado |
| `SOLD_OUT` | 409 | Sin inventario para venta manual |

## Reglas

- Roles asignables: `admin`, `checker`, `client`. `super_admin` prohibido.
- Cédula única en toda la DB. Reasignación permite si otro usuario no la usa.
- `isActive: false` bloquea usuario.

## Flujos

### Crear cliente individual

```mermaid
sequenceDiagram
    participant Admin
    participant API as POST /users
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    Admin->>API: { email, password, fullName, cedula?, phone? }
    API->>DB: verificar email único
    API->>DB: verificar cédula única
    alt Email o cédula duplicado
        API-->>Admin: 409 CONFLICT
    end
    API->>Auth: createUser(email, password, role=client)
    Auth-->>API: user.id
    API->>DB: INSERT users (id, email, fullName, cedula, phone, role=client)
    DB-->>API: user DTO
    API-->>Admin: 201 + user
```

### Carga masiva desde Excel (batch)

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend as Web UI
    participant API as POST /users/batch
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    Admin->>Frontend: Carga Excel con N filas
    Frontend->>Frontend: Parsea Excel → JSON array
    Frontend->>API: [{ email, password, fullName, cedula }, ...]
    API->>DB: verificar TODOS los emails únicos
    API->>DB: verificar TODAS las cédulas únicas
    alt Algún conflicto
        API-->>Frontend: 409 CONFLICT (lista conflictos)
        Frontend-->>Admin: Muestra errores
    end
    loop Por cada usuario
        API->>Auth: createUser
        API->>DB: INSERT user
    end
    API-->>Frontend: 201 + [user DTO, ...]
    Frontend-->>Admin: "N usuarios creados exitosamente"
```

### Modificar usuario (rol / cédula / bloqueo)

```mermaid
sequenceDiagram
    participant Admin
    participant API as PATCH /users/:id
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    Admin->>API: { role?, cedula?, isActive?, fullName?, phone? }
    API->>DB: buscar usuario
    alt No existe
        API-->>Admin: 404 NOT_FOUND
    end
    alt Viene cédula nueva
        API->>DB: verificar cédula no usada por otro
        alt Ya en uso
            API-->>Admin: 409 CONFLICT
        end
    end
    alt Viene role
        API->>Auth: updateUserById(app_metadata.role)
        API->>DB: UPDATE role
    end
    alt Viene isActive
        API->>DB: UPDATE isActive
    end
    API-->>Admin: 200 + user DTO
```

### Reembolsar pago

```mermaid
sequenceDiagram
    participant A as Admin
    participant FE as Frontend
    participant API as POST /payments/:id/refund
    participant S as Service
    participant DB as PostgreSQL

    A->>FE: Click "Reembolsar" en detalle de pago
    FE->>FE: Abre diálogo, admin escribe motivo
    A->>FE: Confirma reembolso
    FE->>API: POST { reason }
    API->>S: processRefund(paymentId, reason, adminId)
    S->>DB: SELECT payment FOR UPDATE
    S->>S: valida status === 'completed'
    S->>DB: SELECT tickets por payment_id
    S->>DB: DELETE tickets por payment_id
    S->>DB: UPDATE ticket_types quantity_sold -= count
    S->>DB: UPDATE payments SET status = 'refunded'
    S-->>API: { paymentId, status }
    API-->>FE: 201
    FE-->>A: Toast "Reembolso procesado exitosamente"
    FE->>FE: Refresca detalle del pago
```

### Pago manual

```mermaid
sequenceDiagram
    participant A as Admin
    participant FE as Frontend
    participant API as POST /admin/payments/manual
    participant S as Service
    participant DB as PostgreSQL

    A->>FE: Modal: selecciona proveedor + tipos entrada + cantidades
    FE->>API: POST { userId, provider, tickets[{ticketTypeId, quantity}] }
    API->>S: createAdminPayment(userId, provider, tickets, adminId)
    S->>S: valida stock cada tipo, calcula total
    S->>DB: $transaction (FOR UPDATE, INSERT payment, INSERT tickets, quantity_sold++)
    S->>S: Genera QR cada ticket
    S-->>API: { paymentId, ticketIds }
    API-->>FE: 201 { paymentId, provider, subtotalCents, discountCents, totalCents, status, createdBy, ticketIds }
    FE-->>A: "Pago creado exitosamente"
```

## Arquitectura del Módulo

```mermaid
graph LR
    subgraph Route
        R[admins.routes.ts]
    end
    subgraph Controller
        C[admins.controller.ts]
    end
    subgraph Service
        S[admins.service.ts]
    end
    subgraph Repository
        Repo[admins.repository.ts]
    end
    subgraph External
        Auth[Supabase Auth]
        DB[(PostgreSQL<br/>users)]
    end

    R -->|authMiddleware + adminMiddleware + requireRole| C
    C -->|Zod validation| C
    C -->|delega| S
    S -->|CRUD users| Repo
    S -->|createUser / updateRole| Auth
    Repo -->|Prisma| DB
```
