# Implementation Plan: Post-Registration Onboarding Survey

**Branch**: `006-onboarding-survey` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-onboarding-survey/spec.md`

## Summary

Display a one-time onboarding survey (4 questions, skippable) to users right
after first login. Store responses as JSONB in `survey_responses`, reuse
existing `GET /api/users/me` to signal completion. Extend `SurveyResponse`
Prisma model with a `survey_type` discriminator to support both event-level
and onboarding surveys in the same table.

## Technical Context

**Language/Version**: TypeScript 5.x (backend), TypeScript 5.x (frontend/Next.js 16)

**Primary Dependencies**: Express 5, Prisma ORM, Zod, TanStack Query, Chakra UI v3

**Storage**: PostgreSQL (Supabase) via Prisma ORM. Existing `survey_responses`
table reused with a `survey_type` discriminator column.

**Testing**: Vitest (unit/integration) + existing patterns from `users.api.test.ts`

**Target Platform**: Web (desktop + mobile browser)

**Project Type**: Web application (monorepo: backend API + Next.js frontend)

**Performance Goals**: Survey submission <500ms p95; `onboarding_survey_done`
check adds <50ms to `GET /api/users/me`

**Constraints**: Idempotent POST; never show survey twice; partial answers valid

**Scale/Scope**: Single survey type (onboarding), 4 fixed questions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Layered architecture (`routes → controller → service → repository`) | ✅ PASS | Module follows existing `users/` pattern |
| Service layer does not import Express/Supabase directly | ✅ PASS | `surveys.service.ts` uses repository only |
| No cross-module repository access | ✅ PASS | `surveys.service.ts` only accesses `surveys.repository.ts`; extends `users.service.ts` via function call |
| Frontend business logic in `features/<domain>/` | ✅ PASS | All frontend code under `features/surveys/` |
| DB conventions: UUID PKs, `snake_case`, `TIMESTAMPTZ` | ✅ PASS | New columns follow conventions |
| No new abstractions without concrete need | ✅ PASS | Plain functions, no DI/factories |
| Schema → API → UI incremental build | ✅ PASS | Build order enforces this |

## Design Decisions

### SurveyResponse model extension
Existing `SurveyResponse` model already has `responses Json @db.JsonB`.
Add `surveyType` enum (`SurveyType: onboarding | event_survey`) and make
`eventId` optional. Enforce idempotency via `@@unique([userId, surveyType])`.

### Computed flag, not stored column
`onboarding_survey_done` is derived at query time by checking existence of a
`survey_responses` row for `user_id + "onboarding"` — no migration needed on
`users` table.

### Skip = empty answers array
Skip sends `POST /api/surveys/onboarding` with `{ responses: [] }`. Backend
creates the row (marks done) without storing answers.

## Project Structure

### Documentation (this feature)

```
specs/006-onboarding-survey/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code

```
backend/
└── src/modules/surveys/
    ├── surveys.routes.ts        POST /api/surveys/onboarding
    ├── surveys.controller.ts    request parsing, response formatting
    ├── surveys.service.ts       idempotency gate, store responses
    ├── surveys.repository.ts    Prisma: create, existsByUserAndType
    ├── surveys.validators.ts    Zod: onboardingSurveySchema
    └── surveys.types.ts         response types

frontend/
└── features/surveys/
    ├── components/
    │   ├── OnboardingSurvey.tsx      container: overlay/modal with 4 questions
    │   ├── SurveyQuestion.tsx        renders single-select / multi / text input
    │   └── SurveySkipButton.tsx      skip action
    ├── config/
    │   └── onboarding.questions.ts   static question list (source of truth)
    ├── api/
    │   ├── surveys.endpoints.ts      POST fetch wrapper
    │   └── surveys.queries.ts        TanStack Query: useSubmitOnboarding
    └── schemas/
        └── surveys.schema.ts         Zod: mirrors backend schema
```

**Structure Decision**: Monorepo — backend module under `src/modules/surveys/`,
frontend feature under `features/surveys/`. Matches existing `users/` module
pattern.

## Build Order

1. Extend Prisma schema: `SurveyType` enum, `surveyType` field, make `eventId` optional, unique constraint, generate client
2. `surveys.validators.ts` — Zod schema for onboarding response array
3. `surveys.repository.ts` — `create()`, `existsByUserAndType()`
4. `surveys.service.ts` — idempotency check, store, return status
5. `surveys.controller.ts` — parse body, call service, format response
6. `surveys.routes.ts` — register behind authMiddleware, mount on Express
7. Extend `users.service.ts` → `getMe()` includes `onboarding_survey_done`
8. Prisma migration + generate client
9. Frontend: `onboarding.questions.ts` config (static question list)
10. Frontend: `surveys.schema.ts`, `surveys.endpoints.ts`, `surveys.queries.ts`
11. Frontend: `SurveyQuestion.tsx`, `SurveySkipButton.tsx`, `OnboardingSurvey.tsx`
12. Wire survey trigger in `middleware.ts` or `mi-cuenta/layout.tsx` (check `onboarding_survey_done`)
13. Manual test full flow
14. Write unit/integration tests

## Complexity Tracking

No constitution violations — structure matches existing patterns.

