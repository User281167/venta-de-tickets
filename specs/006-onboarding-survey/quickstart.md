# Quickstart: Post-Registration Onboarding Survey

## Prerequisites

- Backend dependencies installed (`pnpm install` in `backend/`)
- Frontend dependencies installed (`pnpm install` in `frontend/`)
- Prisma client generated (will need re-generation after schema change)

## Build Order

### 1. Extend Prisma schema

Edit `backend/prisma/schema.prisma`:
- Add `SurveyType` enum: `onboarding`, `event_survey`
- Add `surveyType SurveyType @map("survey_type")` field to `SurveyResponse`
- Make `eventId` optional: `String?`
- Add `@@unique([userId, surveyType])`

Then generate client + migration:

```bash
cd backend
pnpm exec prisma generate
pnpm exec prisma migrate dev --name add_onboarding_survey_type
```

### 2. Backend module: `src/modules/surveys/`

Create files in order:
1. `surveys.validators.ts` — Zod schema for response array
2. `surveys.repository.ts` — `create()`, `existsByUserAndType()`
3. `surveys.service.ts` — idempotency check, store
4. `surveys.controller.ts` — parse request, call service
5. `surveys.routes.ts` — register endpoint behind authMiddleware

### 3. Extend `users.service.ts`

Add `onboarding_survey_done` to `getMe()` return by calling
`surveys.repository.existsByUserAndType(userId, 'onboarding')`.

### 4. Frontend: `features/surveys/`

Create files in order:
1. `config/onboarding.questions.ts` — static question list
2. `schemas/surveys.schema.ts` — Zod mirror of backend schema
3. `api/surveys.endpoints.ts` — POST fetch wrapper
4. `api/surveys.queries.ts` — `useSubmitOnboarding` mutation hook
5. `components/SurveyQuestion.tsx` — renders single/multi/text inputs
6. `components/SurveySkipButton.tsx` — skip action
7. `components/OnboardingSurvey.tsx` — container with overlay/modal

### 5. Wire trigger

Add survey check in `middleware.ts` or `mi-cuenta/page.tsx`:
- Call `useMe()` to get `onboarding_survey_done`
- If `false`, render `OnboardingSurvey` before main content

### 6. Tests

Add tests following existing patterns:
- `backend/test/surveys.api.test.ts` — POST success, 422, 401, idempotency
- `frontend/features/surveys/schemas/__tests__/surveys.schema.test.ts`
- Component tests for `OnboardingSurvey` (skip flow, submit flow)

## Key Files

| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | `SurveyResponse` model + `SurveyType` enum |
| `backend/src/modules/surveys/` | All backend survey logic |
| `frontend/features/surveys/` | All frontend survey logic |
| `frontend/features/surveys/config/onboarding.questions.ts` | Question definitions (single source of truth) |
