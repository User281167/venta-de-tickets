# Módulo Auth — Sesión

Módulo mínimo. La autenticación real (verificación JWT, refresh) vive en
`shared/middlewares/auth.middleware.ts`. Este módulo solo expone el endpoint
de sesión para que el frontend consulte el rol del usuario autenticado.

## Estructura

| Archivo | Capa | Responsabilidad |
|---------|------|----------------|
| `auth.controller.ts` | Controller | Responde con `{ role }` del JWT |
| `index.ts` | Route | Registra ruta con `authMiddleware` |

## Rutas

| Método | Ruta | Middleware | Descripción |
|--------|------|-----------|-------------|
| GET | `/api/auth/session` | `authMiddleware`, `requireRole` | Devuelve `{ role }` solo para `admin`, `super_admin` y `checker` |

## Códigos de Error

| Código | Status | Causa |
|--------|--------|-------|
| `UNAUTHORIZED` | 401 | Falta una sesión válida |
| `FORBIDDEN` | 403 | El rol no es de personal autorizado |

## Dependencias externas

- `shared/middlewares/auth.middleware.ts` — verifica y decodifica JWT de Supabase
- `shared/middlewares/require-role.middleware.ts` — limita la sesión a roles de personal
