# Módulo Messaging — Emails Transaccionales (Resend)

Envío de emails transaccionales del sistema. **Único canal actualmente**: email vía [Resend](https://resend.com).

## Estructura del Módulo

| Archivo | Capa | Responsabilidad |
|---------|------|----------------|
| `messaging.service.ts` | Service | Punto de entrada público; orquesta render + channel registry. Exporta `send*` para cada tipo de email |
| `notifications/payment-notifications.ts` | Notifier | Helpers `notify*` consumidos por `payments.service.ts` (fire-and-forget) |
| `notifications/donation-notifications.ts` | Notifier | Helpers `notify*` consumidos por `donaciones.service.ts` (fire-and-forget) |
| `channels/email-provider.interface.ts` | Adapter interface | `EmailProvider` (subject, html, text) |
| `channels/resend.provider.ts` | Adapter | `ResendProvider` — implementación HTTP contra `api.resend.com` |
| `channels/channel.registry.ts` | Registry | `getEmailProvider()` singleton; lectura única de env en boot |
| `templates/render-template.ts` | Util | Reemplazo de `{{var}}` en HTML, regex-escaped por clave |
| `templates/*.html` | Asset | 10 plantillas: `payment-confirmed`, `payment-failed`, `payment-unfulfillable`, `payment-refunded`, `ticket-confirmed`, `ticket-paid`, `ticket-cancelled`, `donation-confirmed`, `donation-rejected`, `donation-cancelled` |
| `index.ts` | Barrel | Re-exporta `messagingService` + `notify*` + tipos |

### Capa Service

| Método | Caller | Plantilla | Variables |
|--------|--------|-----------|-----------|
| `sendPaymentConfirmation` | `payments.service` (webhook approved, reclaim) | `payment-confirmed.html` | `fullName`, `eventName`, `ticketCount`, `subtotal`, `total`, `paymentId` |
| `sendPaymentFailed` | `payments.service` (webhook declined) | `payment-failed.html` | `fullName`, `eventName`, `reason` |
| `sendPaymentUnfulfillable` | `payments.service` (reclaim sin cupo) | `payment-unfulfillable.html` | `fullName`, `eventName`, `paymentId` |
| `sendPaymentRefunded` | `payments.service` (admin refund) | `payment-refunded.html` | `fullName`, `eventName`, `reason`, `refundedTicketCount` |
| `sendTicketConfirmation` | `checkin.service` (requestConfirmation, canal email) | `ticket-confirmed.html` | `fullName`, `eventName`, `ticketCode`, `confirmationUrl`, `qrImageUrl`, `expiresInMinutes` |
| `sendTicketCancellation` | `payments.service` (dentro de refund, 1 por ticket) | `ticket-cancelled.html` | `fullName`, `eventName`, `ticketCode` |
| `sendTicketPaid` | — | `ticket-paid.html` | — |
| `sendDonationConfirmation` | `donaciones.service` (webhook confirmed) | `donation-confirmed.html` | `fullName`, `amount` |
| `sendDonationRejection` | `donaciones.service` (webhook declined) | `donation-rejected.html` | `fullName`, `amount` |
| `sendDonationCancellation` | `donaciones.service` (sweep expiración) | `donation-cancelled.html` | `fullName`, `amount` |

### Notifiers (Fire-and-Forget)

`notifications/*.ts` expone wrappers `notify*` que:
- Resuelven datos del destinatario (`paymentsRepo.findPaymentWithUser` para pagos, `prisma.donation` para donaciones)
- Llaman al método `send*` del service
- **Swallow errors** (try/catch → console.error). El éxito del negocio no depende del email
- No persisten estado de envío (no hay tabla de tracking)

`ResendProvider` hace `POST https://api.resend.com/emails` con headers `Authorization: Bearer ${apiKey}`.

## Variables de Entorno

| Var | Default | Uso |
|-----|---------|-----|
| `RESEND_API_KEY` | — (requerido) | API key de Resend |
| `EMAIL_FROM` | — (requerido) | Remitente verificado, ej `noreply@utp.edu.co` |
| `CONFIRMATION_LINK_BASE_URL` | — | Base para `confirmationUrl` (enlace email → `/confirmaciones?token=...`) |
| `FRONTEND_URL` | — | Base para `qrImageUrl` (link del QR → `/mi-cuenta/entradas/:id`) |

## Rutas

**Ninguna**. El módulo no expone endpoints HTTP. Es consumido por otros módulos (payments, checkin, donaciones) vía su `messagingService` exportado.

## Códigos de Error

El módulo **no propaga errores** al caller (fire-and-forget). Internamente:

| Origen | Comportamiento |
|--------|---------------|
| `RESEND_API_KEY` no configurada | `getEmailProvider()` tira en boot → server no arranca |
| `EMAIL_FROM` no configurada | Idem |
| Resend devuelve 4xx/5xx | `console.error` + rejected promise que el caller traga |
| Template variable falta | `renderTemplate` deja `{{var}}` literal en el HTML (no falla) |

## Diagrama de Flujo — Notificación de Pago Confirmado

```mermaid
sequenceDiagram
    participant MP as Mercado Pago
    participant API as payments.service
    participant PN as payment-notifications
    participant MS as messagingService
    participant Resend as api.resend.com

    MP->>API: webhook approved
    API->>API: processPaymentWebhook (tx: payment → completed, tickets → paid)
    API->>PN: notifyPaymentConfirmation(paymentId) [fire-and-forget]
    PN->>PN: findPaymentWithUser (incluye tickets)
    PN->>MS: sendPaymentConfirmation({fullName, email, ...})
    MS->>MS: renderTemplate + getEmailProvider
    MS->>Resend: POST /emails
    Resend-->>MS: { id }
    Note over PN: try/catch suprime errores → webhook ya respondió 200
```

## Arquitectura del Módulo

```mermaid
graph LR
    subgraph messaging
        SVC[messaging.service.ts]
        PNOT[notifications/payment-notifications.ts]
        DNOT[notifications/donation-notifications.ts]
        TEM[templates/render-template.ts]
        REG[channel.registry.ts]
        RP[resend.provider.ts]
        TPL[(templates/*.html)]
    end

    subgraph consumers
        PAY[payments.service.ts]
        CK[checkin.service.ts]
        DON[donaciones.service.ts]
    end

    subgraph shared
        Repo[payments.repository.ts]
    end

    subgraph External
        Resend[api.resend.com]
    end

    PAY -->|notify*| PNOT
    CK -->|sendTicketConfirmation| SVC
    DON -->|notify*| DNOT
    PNOT -->|send*| SVC
    DNOT -->|send*| SVC
    SVC -->|render| TEM
    TEM -->|read| TPL
    SVC -->|getEmailProvider| REG
    REG -->|instancia| RP
    RP -->|HTTP| Resend
    PNOT -->|findPaymentWithUser| Repo
```

## Dependencias

- `payments → messaging` vía `notify*` helpers
- `checkin → messaging` vía `messagingService.sendTicketConfirmation`
- `donaciones → messaging` vía `notify*` helpers
- `messaging → payments.repository` (solo para `findPaymentWithUser` en notifiers)
- Sin dependencias de Express, Supabase, o canales legacy

## Fuera de Alcance

- WhatsApp: stub legacy en `messaging.client.ts`, no integrado. Infobip como adaptador a futuro
- Persistencia de emails enviados (no hay tabla `email_log`)
- Reintentos automáticos (fire-and-forget por ahora)
- Tracking de opens/clicks (no en scope)
- Plantillas dinámicas desde BD (plantillas hardcoded en `templates/`)
