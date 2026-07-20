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
| GET | `/api/auth/session` | `authMiddleware` | Devuelve `{ role }` del token. `401 { role: null }` si no hay sesión |

## Dependencias externas

- `shared/middlewares/auth.middleware.ts` — verifica y decodifica JWT de Supabase
- `shared/middlewares/require-role.middleware.ts` — guard opcional para rutas que necesitan rol específico
