# Tasks: Post-Registration Onboarding Survey

**Input**: Design documents from `specs/006-onboarding-survey/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks grouped by phase. Backend → Frontend → Wire trigger → Tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story label (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Prisma Schema)

**Purpose**: Extend `SurveyResponse` model for onboarding survey support.

- [X] T001 Extend Prisma schema: add `SurveyType` enum, `surveyType` field on `SurveyResponse`, make `eventId` optional, add `@@unique([userId, surveyType])` in `backend/prisma/schema.prisma`
- [X] T002 Generate Prisma client + create migration in `backend/`: `pnpm exec prisma generate && pnpm exec prisma migrate dev --name add_onboarding_survey_type`

**Checkpoint**: `SurveyResponse` model supports `surveyType: "onboarding"` with unique constraint.

---

## Phase 2: Foundational (Backend Surveys Module)

**Purpose**: Complete backend for survey submission — validators, repository, service, controller, routes.

- [X] T003 Create `surveys.validators.ts` in `backend/src/modules/surveys/` — Zod `onboardingSurveySchema`: array of `{ question_id: string, answer: string | string[] }`
- [X] T004 [P] Create `surveys.repository.ts` in `backend/src/modules/surveys/` — `existsByUserAndType(userId, type)`, `create(userId, type, answers)`
- [X] T005 Create `surveys.service.ts` in `backend/src/modules/surveys/` — check idempotency before insert; skip = empty answers array, still marks done
- [X] T006 Create `surveys.controller.ts` in `backend/src/modules/surveys/` — parse request body, call service, format response
- [X] T007 Create `surveys.routes.ts` in `backend/src/modules/surveys/` — `POST /api/surveys/onboarding`, protected by `auth.middleware`, mount under existing Express app
- [X] T008 [P] Extend `users.service.ts` — import survey repository, add `onboarding_survey_done: boolean` to `getMe()` return in `backend/src/modules/users/users.service.ts`

**Checkpoint**: `POST /api/surveys/onboarding` works with auth; `GET /api/users/me` returns `onboarding_survey_done`.

---

## Phase 3: User Stories 1 & 2 — Frontend Survey UI (Priority: P1)

**Goal**: New users see the survey after login, can complete or skip it.

**Independent Test**: Register new account, verify survey appears. Submit partial answers — verify stored (check `onboarding_survey_done: true` via API). Skip — verify no answers stored but flag is true. Survey never reappears.

### Frontend Config & Data Layer

- [X] T009 [P] [US1] Create `onboarding.questions.ts` in `frontend/features/surveys/config/` — static config with 4 questions (gender, occupation, area, how_heard), each with `id`, `question`, `type` (single/multi/text), `options[]`, `required: false`
- [X] T010 [P] [US1] Create `surveys.schema.ts` in `frontend/features/surveys/api/schemas/` — Zod schema mirroring backend `onboardingSurveySchema`
- [X] T011 [P] [US1] Create `surveys.endpoints.ts` in `frontend/features/surveys/api/endpoints/` — `POST /api/surveys/onboarding` fetch wrapper with auth token
- [X] T012 [US1] Create `surveys.queries.ts` in `frontend/features/surveys/api/` — `useSubmitOnboarding` (TanStack Query mutation) with `onSuccess` invalidation of `useMe` query

### Frontend UI Components

- [X] T013 [P] [US1] Create `SurveyQuestion.tsx` in `frontend/features/surveys/components/` — renders question by type: single select (radio/button group), multi select (checkboxes), text input
- [X] T014 [P] [US2] Create `SurveySkipButton.tsx` in `frontend/features/surveys/components/` — fires `useSubmitOnboarding` with empty answers array
- [X] T015 [US1] Create `OnboardingSurvey.tsx` in `frontend/features/surveys/components/` — full-screen overlay, maps question config, manages local answer state, submit action (calls `useSubmitOnboarding` with answers), skip action (uses `SurveySkipButton`)

### Wire Trigger

- [X] T016 [US1] Wire survey trigger in `frontend/providers/AuthProvider.tsx` — after auth confirmed, if `useMe().onboarding_survey_done === false`, render `OnboardingSurvey` overlay before page content
- [X] T017 [US2] Add skip handling — verify skip from `OnboardingSurvey` dismisses overlay and never shows again (same done flag)

**Checkpoint**: Full survey flow works — new user sees survey, can submit or skip, returning user never sees it.

---

## Phase 4: Polish & Tests

**Purpose**: Verify all acceptance criteria, handle edge cases.

- [ ] T018 Write backend endpoint tests in `backend/test/surveys.api.test.ts` — POST success, POST with empty answers (skip), POST idempotency (double submit returns 200), POST 422 invalid body, POST 401 without token, GET /api/users/me returns `onboarding_survey_done`
- [ ] T019 [P] Write frontend schema tests in `frontend/features/surveys/schemas/__tests__/surveys.schema.test.ts` — valid response array, empty array (skip), invalid items
- [ ] T020 Write `OnboardingSurvey` component test in `frontend/features/surveys/components/__tests__/OnboardingSurvey.test.tsx` — renders all 4 questions, submit flow, skip flow (mock `useSubmitOnboarding`)
- [ ] T021 Manual QA: verify all 6 acceptance criteria from spec — survey appears for new user, partial submit, skip, returning user, flag accuracy, double submit idempotency

**Checkpoint**: All tests green; manual QA passes.

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Prisma schema) ──→ Phase 2 (Backend) ──→ Phase 3 (Frontend) ──→ Phase 4 (Tests)
```

- **Phase 1**: No dependencies — start immediately
- **Phase 2**: Depends on Phase 1 (schema must exist before repository/service)
- **Phase 3**: Depends on Phase 2 (API must exist before frontend can call it)
- **Phase 4**: Depends on Phases 1-3 complete

### User Story Dependencies

- **US1 (Complete survey) + US2 (Skip survey)**: Same Phase 3 — share frontend components. No US1 without US2 (skip must always be available).
- **US3 (Returning user)**: Implicitly covered by Phase 2 (T008) + Phase 3 (T016) — no separate implementation phase needed.

### Parallel Opportunities

| Phase | Parallel tasks |
|-------|---------------|
| Phase 2 | T004 (repository) can run before T003 (validator) — different files |
| Phase 3 | T009-T011 (config/data) in parallel; T013-T014 (UI components) in parallel |
| Phase 4 | T019 (frontend schema tests) independent of T018 (backend API tests) |

### Parallel Example: Phase 3 Frontend

```bash
# Launch config + data layer tasks together:
Task: "Create onboarding.questions.ts in frontend/features/surveys/config/"
Task: "Create surveys.schema.ts in frontend/features/surveys/schemas/"
Task: "Create surveys.endpoints.ts in frontend/features/surveys/api/"

# Once data layer is done, launch UI components together:
Task: "Create SurveyQuestion.tsx in frontend/features/surveys/components/"
Task: "Create SurveySkipButton.tsx in frontend/features/surveys/components/"
```

---

## Implementation Strategy

### MVP Scope (Phase 1 + 2 + 3)

T001-T017 deliver the complete feature: backend API, frontend UI, wire trigger. This is the full MVP because US1 and US2 share all infrastructure.

### Incremental Delivery

1. Phase 1 + 2 → Backend API ready (testable via curl/Postman)
2. Phase 3 → Frontend UI ready (full survey flow testable end-to-end)
3. Phase 4 → Tests + hardening

### Validation Gates

- After Phase 2: `curl POST /api/surveys/onboarding` returns 200 with valid token
- After Phase 3: New user sees survey, submit/skip work, returning user bypasses
- After Phase 4: All tests pass, manual QA confirms acceptance criteria

---

## Path Conventions

- **Backend**: `backend/src/modules/surveys/`
- **Frontend**: `frontend/features/surveys/` (no `src/` level in this project)
- **Tests**: `backend/test/` (Vitest), `frontend/features/*/__tests__/` (Vitest + RTL)
