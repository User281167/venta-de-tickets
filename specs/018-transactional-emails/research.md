# Research: Transactional Email Module

## Configuration Management

**Decision**: Environment variables via existing `env.ts` config module.
**Rationale**: Project standard — all secrets (MercadoPago tokens, Infobip keys) follow this pattern.
**Required vars**: `RESEND_API_KEY`, `EMAIL_FROM`

## Resend SDK Usage

**Decision**: Use `resend` npm package (`npm install resend`).
**Rationale**: Official SDK provides typed client with built-in error types. Aligns with project's use of official SDKs (mercadopago, supabase-js).
**Pattern**:
```ts
import { Resend } from 'resend';
const resend = new Resend(env.RESEND_API_KEY);
await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
```

## Coexistence with Existing MessagingClient

**Decision**: Keep existing `ConsoleMessagingClient` stub unchanged; add `messaging.service.ts` alongside it.
**Rationale**: The stub is used by `confirmations` module for confirmation-link delivery. The new service handles transactional notifications (payment/ticket status). Two different concerns. The stub sends WhatsApp/email links via Infobip; the new service sends only email via Resend.

## Template Rendering

**Decision**: Simple string replacement — `fs.readFileSync` then `.replace(/{{var}}/g, value)`.
**Rationale**: No templating engine needed for 3 templates with 3-4 variables each. Avoids adding a dependency.

## Fire-and-Forget Pattern

**Decision**: `messagingService.send*` methods are `async` but callers use `void` or `.catch()` without `await`.
**Rationale**: Non-blocking execution. Express request handler returns before email sends. Errors logged via existing `logger`.

## Error Handling

**Decision**: Wrap `resend.emails.send` in try/catch inside the provider. Log error with `logger.error`. No throw.
**Rationale**: Silent failure is acceptable per spec ("riesgo aceptado"). Retry not needed.

## Provider Registry Pattern

**Decision**: Mirror `provider.registry.ts` from payments module.
**Pattern**:
```ts
const providers = new Map<string, EmailProvider>();
export function getEmailProvider(): EmailProvider { return providers.get('resend')!; }
export function registerEmailProvider(name: string, p: EmailProvider) { ... }
registerEmailProvider('resend', new ResendProvider());
```

## Tech Stack Deviation

**Decision**: Use Resend over Infobip for email.
**Justification**: Infobip is a full-stack CPaaS (email + WhatsApp + SMS). For email-only transactional use, Resend offers simpler API, purpose-built email SDK, better deliverability, and lower cost at this scale. Infobip retained for WhatsApp in the WhatsApp bot service. Constitution must be amended before implementation.
