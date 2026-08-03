# Trazabilidad Backend — Julio 2026

Resumen día a día del trabajo realizado en el backend durante julio 2026.
Fuente: `git log` del monorepo (solo commits que tocan `backend/`).

## 01/Jul/2026 — Setup y base de pagos
- Migración Prisma tabla de pagos (`add_payments`) y ajustes al schema.
- Fix: cliente Prisma generado dentro de `modules/` (movido a `shared/database/prisma.client.ts`).
- Fix: imports `.js` en vez de `.ts`; deploy Railway con `allowImportingTsExtensions`.
- `ticket-types`: no permitir bajar cantidad de tiquetes por debajo de los ya vendidos.

## 02/Jul/2026 — (sin cambios backend)

## 03/Jul/2026 — (sin cambios backend; trabajo UI/frontend)

## 04-05/Jul/2026 — (sin cambios backend)

## 06/Jul/2026 — (sin cambios backend)

## 07/Jul/2026 — Payment core + Mercado Pago
- `payments`: módulo core (repository, types, registry de providers).
- Mercado Pago: init checkout Pro y webhook (`mercadopago.provider.ts`).
- Env vars de configuración en `shared/config/env.ts`.

## 08/Jul/2026 — DB unificada, módulo Me, gestión usuarios
- Prisma: schema simplificado unificando `users`/`admins`, seed de super admin y admin.
- Módulo `me`: obtener y cambiar información personal, cédula inmutable (PUT/PATCH `personal-info`).
- Módulo `admins`: gestión de usuarios — bloquear y cambiar rol.
- Módulo `ticket-types`: vista previa de tiquetes, eliminación de API de eventos.
- Migraciones: trigger de auth (`handle_new_user`), campos de personal info.
- Tests de endpoints: success y error codes (admins, me, users, surveys).

## 09/Jul/2026 — Tickets, payments, checkin
- `tickets` (ticket types): configuración, schema BD, validators, rutas públicas GET/list y admin list/modify.
- `updateQrToken` en tickets.
- `payments`: Mercado Pago, lógica de pago con check para evitar race conditions.
- `checkin`: estados de lectura y aceptación del tiquete.
- Cliente: obtener sus tiquetes comprados y enlistar sus pagos; admin enlistar pagos.
- Tests: checkout y checkin, unit tests por endpoint y error codes de tickets.

## 10/Jul/2026 — Ventas admin, logger, limpieza
- `admins`: agregar venta por parte del admin (manual sale).
- Migration `ticket_satus`; ajustes de schema Prisma.
- Fix: lista de roles no admitía rol admin; redirect por rol admin/client.
- `me`: fix controller no agregaba info personal al crear.
- Logger pino (`src/utils/logger.ts`) en servicios; log de envs.
- Eliminación de eventos API y endpoints que no existen.

## 11/Jul/2026 — Carga masiva, fixes
- Fix: batch de usuarios hacía 5N operaciones por usuario — check único con `findMany`.
- `admins.repository`: upsert (auth trigger agrega el usuario a tabla pública).
- Fix: setup de tests no mockeaba `.env` correctamente.

## 12/Jul/2026 — (creación masiva de usuarios desde Excel — UI; sin cambios backend)

## 13/Jul/2026 — Pagos manuales y reembolsos
- `admins` + `payments`: backend para listar pagos del usuario.
- Refactor reembolso: `refund` con razón, lista de tickets no devuelve precio (usar el del pago).
- `/payments/manual`: remueve `/sales`; venta manual o regalo, múltiples tipos y cantidades, trazabilidad de quién hizo la venta.
- Prisma reset/init con gen uuid; snapshot de precio de ticket (evita que admin cambie precio en ticket types).
- Payment maneja descuento, subtotal y total.
- Fix: checkout admin usaba lista de entradas en vez de la BD.

## 14/Jul/2026 — Checkout flow
- Mercado Pago: integración React/router para enviar a checkout.
- Fix: auto payment checkout no permitido — no crear hasta que el usuario selecciona provider.
- Fix: MP integración — check de preference id; fix duplicate key `payments_pkey`.

## 15/Jul/2026 — Fixes de pago
- Fix: payment checkout no incluía webhook del provider.
- Log full de preference del cliente en MP.

## 16/Jul/2026 — Fixes
- `admins`: no retornar super admins en listados.

## 17/Jul/2026 — (sin cambios backend)

## 18/Jul/2026 — (fix cart frontend; sin cambios backend)

## 19/Jul/2026 — Estado expired en pagos
- Fix: payment nunca cambiaba a `expired`; webhook mejora con status de reserva y expired en payments.
- Fix: mismo tiempo `expiredAt` para provider y sweep en BD; refactor de constantes de tiempo.

## 20/Jul/2026 — Reembolsos, checkin, confirmaciones
- Fix: reembolso no elimina tickets — los pasa a `cancelled`.
- Fix: refunded payment cambiaba mal el estado del ticket; no dejaba cambiar si venta es `completed_unfulfillable`.
- Fix: no imprimir payload — confidencialidad de datos.
- Metadata con la razón del reembolso.
- Docs: READMEs de módulos con tipos, rutas y diagramas de flujo.
- `checkin` rediseñado: tipos y estados, confirmar QR y cambio de estado, lógica para enviar confirmación y permitir entrada.
- `confirmations`: rutas para cambiar estado, middleware, validación de QR/confirmación.
- Tests de checking y confirmación.

## 21/Jul/2026 — Emails transaccionales
- `me`: confirmar ticket usado desde dashboard de cliente.
- Messaging: interface y config para Resend; provider email, registry de canales.
- Emails de estado de compra desde webhook (confirmed/failed/unfulfillable/refunded).
- Admin: pago manual y regalo notificar por email.

## 22/Jul/2026 — Confirmaciones y mails
- Fix: confirmation id podía ser `string[]` o `string` — check para solo obtener un string.
- Mail HTML con ticket id para ver información desde la cuenta.

## 23/Jul/2026 — Fixes de rutas
- Fix: agregar `/api/` como prefijo — frontend usaba endpoint inexistente para confirmaciones.
- Docs: READMEs actualizados con rutas, errores y flujos.

## 24/Jul/2026 — (trabajo UI/frontend; sin cambios backend)

## 25/Jul/2026 — Supabase RLS y cert
- Certificado público SSL de Supabase (`backend/cert/prod-ca-2021.crt`).
- SQL para activar Row Level Security en Supabase.

## 26/Jul/2026 — (trabajo UI/frontend; sin cambios backend)

## 27/Jul/2026 — Búsquedas y refunds
- `admins`: permitir cambiar cédula de usuario a null.
- `admins`: buscar usuario por nombre, email y cédula.
- `payments`: no permitir refund cuando ya se usó un tiquete.

## 28/Jul/2026 — Egresados, bans, donaciones
- Ban de usuario desde Supabase Auth (auth middleware, role/user resolver).
- `admins`: permitir cambiar si un usuario es egresado; auto-update `esEgresado` con trigger (`auto_egresado_trigger.sql`).
- Tickets solo para egresados: columna `egresados` (migración), confirmación en payment.
- Permitir actualizar fecha de cierre de entrada.
- Donaciones: schema y repository, provider Mercado Pago, rutas y endpoints (mercadopago-barranqueros-utp, la-convencion).

## 29/Jul/2026 — ePayco y donaciones
- ePayco: init provider con webhook, sign, login y API call; controller/route/service; urlencoded; método de pago en tabla y página de estado; fixes de validators y campos de query.
- Fix: webhook enviaba `failed` después de `success` en la misma sesión; block de credenciales MP de prod no listas.
- Donaciones: ePayco checkout, bloquear MP; fixes de back url, provider name (`_` vs `-`), sessionId, cambio de estado de donación.

## 30/Jul/2026 — Donaciones, QR por email
- Donaciones: init API y config, admin CRUD, cron para cambiar estado, email transaccional en webhook y cron (confirmed/cancelled/rejected).
- Fixes donaciones: tabla no convertía centavos, email enviaba cents.
- Messaging: enviar QR de cada entrada confirmada después del pago; imagen QR como adjunto en email.
- Reembolso de entrada y envío de entrada cancelada (`ticket-cancelled.html`).
- Tests de flujo de donaciones.

## 31/Jul/2026 — Auditoría y estados de entrada
- Tickets: 3 estados de entrada — habilitar, deshabilitar, bloqueado.
- Fix: `esEgresado` no se enviaba; mensaje de cédula ya usada por otro usuario.
- Audit log: schema y migración, CRUD del módulo (`audit`), snapshot de usuario en cache, audit para cada acción de admin/payment/ticket/checking y user update.
- Audit page para super admin (frontend).
