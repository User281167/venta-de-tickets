# Implementation Plan: Feature 003 — Module Cleanup & Unit Tests

## Tech Stack

- **Runtime**: Node.js with TypeScript (Express backend)
- **Test framework**: Vitest (already configured: `vitest.config.ts`)
- **HTTP testing**: supertest (already used in existing tests)
- **Mocking**: vi.mock (Vitest manual mocks for all repository/service dependencies)
- **Test location**: `backend/test/` (existing convention)

## Project Structure (affected files)

```
backend/
├── src/
│   ├── app.ts                                      # Remove surveysRouter reference
│   ├── modules/
│   │   ├── users/
│   │   │   ├── users.routes.ts                     # Remove GET /me, PATCH /me
│   │   │   ├── users.controller.ts                  # Remove getMe, updateMe
│   │   │   ├── users.service.ts                     # Remove getMe, updateMe, remote surveysRepo import
│   │   │   ├── users.repository.ts                  # No changes
│   │   │   ├── users.validators.ts                  # No changes
│   │   │   └── index.ts                             # No changes
│   │   ├── surveys/                                 # DELETE ENTIRE MODULE
│   │   │   ├── index.ts
│   │   │   ├── surveys.routes.ts
│   │   │   ├── surveys.controller.ts
│   │   │   ├── surveys.service.ts
│   │   │   ├── surveys.repository.ts
│   │   │   └── surveys.validators.ts
│   │   ├── me/                                      # Tests only
│   │   │   ├── me.routes.ts
│   │   │   ├── me.controller.ts
│   │   │   ├── me.service.ts
│   │   │   ├── me.repository.ts
│   │   │   └── me.validators.ts
│   │   └── admins/                                  # Tests only
│   │       ├── admins.routes.ts
│   │       ├── admins.controller.ts
│   │       ├── admins.service.ts
│   │       ├── admins.repository.ts
│   │       ├── admins.validators.ts
│   │       ├── admins.types.ts
│   │       └── index.ts
│   └── shared/
│       └── middlewares/
│           ├── auth.middleware.ts
│           ├── admin.middleware.ts
│           └── require-role.middleware.ts
├── prisma/
│   └── migrations/
│       └── 20260709004345_add_personal_info_fields/ # DELETE (duplicate)
└── test/
    ├── setup.ts
    ├── users.api.test.ts                            # Update: remove deleted route tests
    ├── surveys.api.test.ts                          # DELETE
    ├── surveys.validators.test.ts                    # DELETE
    ├── auth.middleware.test.ts                       # Already exists (for me routes)
    ├── me.api.test.ts                               # CREATE
    └── admins.api.test.ts                           # CREATE
```

## Mock Strategy

### me module tests
- Mock `auth.service.ts` (verifyToken) — always return valid user
- Mock `me.repository.ts` (findByUserId, upsert) — return controlled test data
- Mock `require-role.middleware.ts` or bypass by using client role in token

### admin module tests  
- Mock `auth.service.ts` (verifyToken) — return different roles
- Mock `admins.repository.ts` (findAll, countAll, findByEmail, findByCedula, findById, create, update) — return controlled test data
- Mock `supabaseAdmin` (admin-client.ts) — avoid real Supabase calls

## Dependencies

- US1 (cleanup users) can run in parallel with US2 (cleanup surveys)
- US3 (me tests) depends on US1 (cleanup affects users module but not me tests — actually US1 is users, US3 is me, they are independent)
- US4 (admin tests) is independent of all others
- All cleanup must complete before final validation

## Test Coverage Matrix

### me module error paths

| Endpoint | Condition | Expected |
|----------|-----------|----------|
| GET /api/me | No auth | 401 UNAUTHORIZED |
| GET /api/me | Invalid token | 401 UNAUTHORIZED |
| GET /api/me | Valid token | 200 + user |
| GET /api/me/personal-info | No auth | 401 |
| GET /api/me/personal-info | Valid token, user exists | 200 + data |
| GET /api/me/personal-info | Valid token, user doesn't exist | 200 + nulls |
| PUT /api/me/personal-info | No auth | 401 |
| PUT /api/me/personal-info | Non-client role | 403 FORBIDDEN |
| PUT /api/me/personal-info | Invalid body (empty) | 422 VALIDATION_ERROR |
| PUT /api/me/personal-info | Invalid cedula (letters) | 422 VALIDATION_ERROR |
| PUT /api/me/personal-info | Valid body, first time | 200 + data |
| PATCH /api/me/personal-info | Non-client role | 403 |
| PATCH /api/me/personal-info | Invalid body | 422 VALIDATION_ERROR |
| PATCH /api/me/personal-info | Cedula already set, different value | 422 CEDULA_INVALIDATION |
| PATCH /api/me/personal-info | Valid body, update | 200 |

### admin module error paths

| Endpoint | Condition | Expected |
|----------|-----------|----------|
| GET /api/admin/me | No auth | 401 |
| GET /api/admin/users | Non-admin role | 403 |
| GET /api/admin/users | Admin role, no search | 200 + list |
| GET /api/admin/users | Admin role, with search | 200 + filtered |
| POST /api/admin/users | Invalid email | 422 |
| POST /api/admin/users | Missing password | 422 |
| POST /api/admin/users | Email conflict | 409 CONFLICT |
| POST /api/admin/users | Cedula conflict | 409 CONFLICT |
| POST /api/admin/users | Auth creation fails | 502 AUTH_ERROR |
| POST /api/admin/users | Valid data | 201 + user |
| POST /api/admin/users/batch | Empty array | 422 |
| POST /api/admin/users/batch | >50 users | 422 |
| POST /api/admin/users/batch | Email conflict | 409 CONFLICT |
| POST /api/admin/users/batch | Cedula conflict | 409 CONFLICT |
| POST /api/admin/users/batch | Valid batch | 201 + array |
| PATCH /api/admin/users/:id | Invalid body | 422 |
| PATCH /api/admin/users/:id | User not found | 404 NOT_FOUND |
| PATCH /api/admin/users/:id | Cedula conflict (other user) | 409 CONFLICT |
| PATCH /api/admin/users/:id | super_admin role | 422 VALIDATION_ERROR |
| PATCH /api/admin/users/:id | Valid update | 200 |
