# Módulo Users — Aceptación de Privacidad

Endpoints para gestión de privacidad (Ley 1581). Montados bajo `/api/users`. Requieren autenticación.

## Rutas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/users/me/privacy-acceptance` | Aceptar política de privacidad |
| GET | `/api/users/me/privacy-status` | Estado de aceptación del usuario actual |

## Respuestas

### Éxito — 200
```json
{
  "accepted": true,
  "acceptedAt": "2026-07-08T12:00:00.000Z"
}
```

## Códigos de Error

| Código | Status | Causa |
|--------|--------|-------|
| `UNAUTHORIZED` | 401 | JWT faltante o inválido |
| `NOT_FOUND` | 404 | Usuario no encontrado |
