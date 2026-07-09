# Módulo Admin — Gestión de Usuarios

Solo rol `admin` (Prisma enum) puede acceder.

## Rutas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/me` | Admin actual desde JWT |
| GET | `/api/admin/users?page=&limit=&search=` | Listar usuarios paginados |
| POST | `/api/admin/users` | Crear 1 cliente (Auth + Prisma) |
| POST | `/api/admin/users/batch` | Crear N clientes desde JSON (máx 50) |
| PATCH | `/api/admin/users/:id` | Modificar datos, cédula, rol, bloqueo |
| GET | `/api/admin/surveys/onboarding` | Listar encuestas onboarding |

## Códigos de Error

| Código | Status | Causa |
|--------|--------|-------|
| `VALIDATION_ERROR` | 422 | Datos inválidos |
| `CONFLICT` | 409 | Email o cédula ya existen |
| `NOT_FOUND` | 404 | Usuario no existe |
| `AUTH_ERROR` | 502 | Error en Supabase Auth |
| `FORBIDDEN` | 403 | Rol no es `admin` |

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
