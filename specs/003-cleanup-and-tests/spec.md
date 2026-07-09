# Feature 003: Module Cleanup & Unit Tests

## Description

Clean up dead/duplicate code from users and surveys modules, then add comprehensive unit tests for the me and admin modules with mocked dependencies (no real DB).

## User Stories

### US1 — Clean up duplicate `/me` routes from users module

**Priority**: P1  
**Description**: As a developer, I want the users module to stop duplicating `/me` routes that are already handled by the `me` module, so there is a single source of truth for client profile operations.

**Acceptance Criteria**:
- `GET /me` and `PATCH /me` routes removed from `users.routes.ts`
- `getMe` and `updateMe` functions removed from `users.controller.ts` and `users.service.ts`
- Cross-module `surveysRepo` import removed from `users.service.ts`
- Privacy routes (`POST /me/privacy-acceptance`, `GET /me/privacy-status`) remain in users module or migrate to me module
- Existing tests in `test/users.api.test.ts` updated to remove deleted route tests

### US2 — Remove surveys module (no Prisma schema support)

**Priority**: P1  
**Description**: As a developer, I want the `surveys/` module removed from the backend since `SurveyResponse` model and `SurveyType` enum do not exist in `schema.prisma` — the module is dead code that will crash at runtime.

**Acceptance Criteria**:
- All files in `src/modules/surveys/` deleted
- `surveysRouter` import and mount removed from `app.ts`
- `listOnboardingSurveys` handler removed from `admins.controller.ts` (imports surveysService)
- `/surveys/onboarding` route removed from `admins.routes.ts`
- `adminQueryResponses` removed from `admins.service.ts` (unused after route removal)
- `test/surveys.api.test.ts` and `test/surveys.validators.test.ts` deleted
- Duplicate migration `20260709004345_add_personal_info_fields` removed

### US3 — Unit tests for me module (all error paths)

**Priority**: P2  
**Description**: As a developer, I want unit tests covering every error path and success path in the `me` module, using mocked repositories and services (no real database).

**Acceptance Criteria**:
- Auth middleware tests: no token → 401, malformed token → 401, invalid token → 401
- Role guard tests: PUT /personal-info with non-client role → 403
- GET /personal-info: returns data when user exists, returns nulls when no user
- PUT /personal-info (first time): validation errors (invalid cedula, missing fields), success (201 implied)
- PATCH /personal-info (update): validation errors, cedula immutability → CEDULA_INVALIDATION (422), success
- GET /: returns JWT user info

### US4 — Unit tests for admin module (all error paths)

**Priority**: P2  
**Description**: As a developer, I want unit tests covering every error path and success path in the `admin` module, using mocked repositories and services (no real database).

**Acceptance Criteria**:
- Auth middleware tests: no token → 401, invalid token → 401
- Admin role guard tests: checker/client role → 403
- GET /admin/me: returns admin profile
- GET /admin/users: success with/without search, pagination
- POST /admin/users: validation errors (422), email conflict (409), cedula conflict (409), auth error (502), success (201)
- POST /admin/users/batch: validation errors (422), email conflict (409), cedula conflict (409), success (201)
- PATCH /admin/users/:id: validation errors (422), user not found (404), cedula conflict (409), super_admin role (422), success
