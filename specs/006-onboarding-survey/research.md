# Research: Post-Registration Onboarding Survey

## Decisions

| Topic | Decision | Rationale | Alternatives |
|-------|----------|-----------|--------------|
| Survey storage | Extend existing `SurveyResponse` model | Avoids table proliferation; same JSONB approach; only need `surveyType` discriminator | Separate `onboarding_surveys` table (rejected: unnecessary duplication) |
| Completion flag | Computed at query time via `exists()` check on `survey_responses` | No schema change on `users`; flag is derived, always consistent | Boolean column on `users` (rejected: needs migration, can drift) |
| Skip mechanism | Empty `responses` array sent to same endpoint | Single code path; backend distinguishes "done with answers" vs "done without" | Separate skip endpoint (rejected: unnecessary) |
| Question config | Static TypeScript file in frontend | No DB table; questions are fixed at this scale; instant iteration | DB-backed questions with admin UI (rejected: over-engineering) |
| Survey trigger | Frontend checks `onboarding_survey_done` from `useMe()` | No extra endpoint; matches existing pattern of `useMe()` for profile data | Dedicated `/api/surveys/status` endpoint (rejected: redundant) |
| Idempotency | `@@unique([userId, surveyType])` on `SurveyResponse` | DB-level enforcement; no race conditions; simplest correct approach | Application-level check (rejected: race-prone) |
| UI layout | Single scrollable page | 4 questions only — no need for multi-step wizard | Multi-step wizard (rejected: complexity for minimal gain) |

## Dependencies

| Dependency | Why | Status |
|------------|-----|--------|
| Express `authMiddleware` | Route protection for POST | Already exists |
| Users service `getMe()` | Extended for `onboarding_survey_done` | Already exists |
| Prisma generate | After schema change | Part of build |
| TanStack Query | Frontend mutation hook | Already set up |

## Risks

| Risk | Mitigation |
|------|------------|
| Race condition on double POST | Unique constraint at DB level handles this |
| User refreshes mid-survey | No in-progress state saved; survey re-renders (acceptable) |
| Survey blocks app access if backend down | Skip should work offline-friendly; show error with retry/skip |
