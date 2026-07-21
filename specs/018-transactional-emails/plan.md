# Implementation Plan: Transactional Email Module

**Branch**: `018-transactional-emails` | **Date**: 2026-07-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/018-transactional-emails/spec.md`

## Summary

Fire-and-forget transactional email module via Resend. Three templates (payment-confirmed, ticket-confirmed, ticket-cancelled) triggered by state transitions in `payment.service.ts` and `ticket.service.ts`. Provider-interface pattern mirrors existing `PaymentProvider` registry.

## Technical Context

**Language/Version**: TypeScript 5.x (project standard)

**Primary Dependencies**: Express (routing), Zod (validation), Prisma (ticket/payment queries), `resend` (official Node SDK — new dependency)

**Storage**: No new tables; emails are transient (per constitution: "notifications/messages: transient — not persisted")

**Testing**: Vitest (unit: service logic, template rendering, provider abstraction); no integration tests against Resend API (mock/stub provider)

**Target Platform**: Node.js backend on Railway

**Project Type**: Backend API module extension (internal module, no new endpoints)

**Performance Goals**: Email dispatch <500ms overhead; fire-and-forget does not block HTTP response

**Constraints**: No state tracking, no retry logic, no cron/scheduled jobs, no new DB tables

**Scale/Scope**: Single event platform; 3 email types; ~thousands of emails per event cycle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Layered Architecture | ✅ PASS | Module follows `service → provider` pattern; service never imports Resend SDK directly |
| II. Vertical Module Boundaries | ✅ PASS | Self-contained `messaging/` module; cross-module call only via service-layer (`payment.service` → `messaging.service`) |
| III. WhatsApp Bot | ✅ N/A | Not involved |
| IV. Frontend Feature Org | ✅ N/A | Backend-only spec |
| V. Shared Is Infrastructure | ✅ PASS | No domain logic in shared/ |
| Tech Stack (Communications) | ⚠️ DEVIATION | Constitution specifies Infobip for all communications. Spec chooses **Resend** for email. |
| Design Conventions | ✅ PASS | No DB persistence (aligned with "notifications transient"); no new tables |
| Simplicity > Patterns | ✅ PASS | Provider interface + registry mirrors existing PatternProvider — no new abstractions |

**Deviation justification**: Infobip is a full-stack CPaaS (email + WhatsApp + SMS). For email-only transactional use, Resend offers simpler API, purpose-built email SDK, better deliverability, and lower cost at this scale. Infobip retained for WhatsApp in the WhatsApp bot service. Constitution amendment required before implementation.

**Recommended action**: Update constitution Tech Stack row for Communications to "Resend (email) / Infobip (WhatsApp, SMS)" before planning implementation.

## Project Structure

### Documentation (this feature)

```text
specs/018-transactional-emails/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 — resolved unknowns
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — implementation quick reference
├── contracts/           # Phase 1 — integration contracts
│   └── messaging-service.ts  # Public API contract for callers
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/src/modules/messaging/
├── index.ts                    # Public exports (updated)
├── messaging.types.ts          # Existing MessagingClient (preserved)
├── messaging.client.ts         # Existing ConsoleMessagingClient (preserved)
├── messaging.service.ts        # NEW: public methods per trigger
├── channels/
│   ├── email-provider.interface.ts   # NEW: EmailProvider contract
│   ├── resend.provider.ts            # NEW: Resend implementation
│   └── channel.registry.ts           # NEW: provider lookup (mirrors provider.registry.ts)
└── templates/
    ├── render-template.ts            # NEW: {{var}} interpolation
    ├── payment-confirmed.html        # NEW: email template
    ├── ticket-confirmed.html         # NEW: email template
    └── ticket-cancelled.html         # NEW: email template
```

**Integration points** (files modified outside module):

- `backend/src/modules/payments/payments.service.ts` — call `messagingService.sendPaymentConfirmation()` after `markAsPaid`
- `backend/src/modules/tickets/tickets.service.ts` — call `messagingService.sendTicketConfirmation()` after `confirm`, call `messagingService.sendTicketCancellation()` after `cancel`
- `backend/src/shared/config/env.ts` — add `RESEND_API_KEY`, `EMAIL_FROM`

**Structure Decision**: New `messaging.service.ts` alongside existing `messaging.client.ts` (stub). The existing stub is used by `confirmations` module and remains untouched. The new service uses a fresh provider interface + registry pattern. Both coexist until the stub is deprecated.

## Complexity Tracking

No violations beyond the justified tech-stack deviation.
