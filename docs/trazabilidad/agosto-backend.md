# Trazabilidad Backend — Agosto 2026

Resumen día a día del trabajo realizado en el backend durante agosto 2026.
Fuente: `git log -- backend/` del monorepo.

## 01/Ago/2026 — Reportes de analytics

- `analytics`: API para reportes de pagos, usuarios y devoluciones (controller, repository, routes, service, types, validators).
- Ajustes al repository de analytics para alimentar la nueva página de métricas (UI).

## 02/Ago/2026 — Moneda int, eliminar descuentos, rate limit

- Migración de moneda a `int` (`usar int para moneda`).
- Remover códigos de descuentos no usados y todo lo relacionado a descuentos (analytics, payments).
- `redis upstash` con rate limit (`@upstash/ratelimit`) en rutas de la API: admins, analytics, audit, auth, checkin, donaciones, me, payments, tickets, users.
- Fix: donaciones no acumulaba en UI — renombrar estado de donación en UI (no en API), acumular donaciones por día en UI.

## 03/Ago/2026 — Docs y número de moneda

- Docs: actualiza README de módulos del backend (admins, analytics, audit, confirmations, donaciones).
- Mejorar mensajes de audit log.
- Fix: MercadoPago y ePayco no usan cents, no requieren conversión — sin divisores.

## 04/Ago/2026 — Refactor payments

- Refactor: dividir `payments.service.ts` (745 líneas) en archivos por funcionalidad: `checkout`, `admin`, `webhook`, `epayco`, `queries`.
- No retornar datos innecesarios de pagos (donaciones: controller, schema, client frontend).

## 06/Ago/2026 — Templates de email y assets

- `messaging`: crear templates de signup confirmation y reset de password (HTML).
