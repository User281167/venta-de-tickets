# Research: API-DTO Refactor

## 1. Endpoint Audit

### Frontend → Backend Mapping

| Status | Frontend Call | Backend Route | Impact |
|--------|--------------|--------------|--------|
| MATCH | `GET /api/auth/session` | `GET /api/auth/session` | Keep |
| MATCH | `POST /api/users/me/privacy-acceptance` | `POST /api/users/me/privacy-acceptance` | Keep |
| MATCH | `GET /api/admin/users` | `GET /api/admin/users` | Keep |
| MATCH | `GET /api/admin/me` | `GET /api/admin/me` | Keep |
| BROKEN | `GET /api/ticket-types` | No route | Remove or remap to `/api/tickets/` |
| BROKEN | `GET /api/events/:eventId` | No events module | Remove or add events module |
| BROKEN | `GET/POST /api/admin/:eventId/ticket-types` | No matching admin route | Remove |
| BROKEN | `PATCH/DELETE /api/admin/ticket-types/:id` | No matching admin route | Remove |
| BROKEN | `GET/PATCH /api/users/me` | No route | Remove or remap |
| BROKEN | `POST /api/surveys/onboarding` | No surveys module | Remove |
| BROKEN | `GET /api/admin/surveys/onboarding` | No surveys module | Remove |
| UNUSED | Full `me` module (7 endpoints) | Implemented | Keep (planned for frontend) |
| UNUSED | Public `tickets` (2) | Implemented | Keep (planned for frontend) |
| UNUSED | Admin `tickets` (3) | Implemented | Keep (planned for frontend) |
| UNUSED | Admin users create/batch/update | Implemented | Keep |
| UNUSED | Admin payments (2) | Implemented | Keep |
| UNUSED | Checkout, payment status | Implemented | Keep |
| UNUSED | Internal checkin | Implemented | Keep (whatsapp-bot) |

### Missing feature directory

- `frontend/features/events/` referenced by imports but does not exist — created in previous spec but never built.

### Decision

- **Remove** frontend calls to endpoints without backend routes (unless remapping to existing backend route)
- **Keep** all backend routes with no frontend caller — they are either planned or used by whatsapp-bot
- **Remove** dangling imports to `features/events/`

## 2. Connection Layer Pattern

### Current state

Three fetch patterns co-exist:
1. `shared/api/admin-fetch.ts` — canonical auth'd fetch for admin features (6 consumers)
2. Local `apiFetch` copies in `users.client.ts` and `surveys.endpoints.ts` — identical code, both add `BASE_URL` prefix + error body parsing
3. Raw `fetch()` in `ticket-purchase.endpoints.ts` and `ticket-types.endpoints.ts` — public endpoints, no token

### Decision

- Consolidate all patterns into a single `shared/api/client.ts` that:
  - Handles auth'd and public requests (optional token)
  - Prepends `BASE_URL` from `NEXT_PUBLIC_API_URL`
  - Parses error response body consistently
  - Exports typed helper functions: `apiClient.get<T>`, `apiClient.post<T>`, `apiClient.patch<T>`, `apiClient.delete<T>`
- Remove local `apiFetch` duplicates from `users` and `surveys`
- Migrate raw `fetch()` calls to use `apiClient`

## 3. DTO Strategy

### Current state

- Frontend Zod schemas: feature-local, used for form validation + type inference
- Backend Zod validators: module-local, used for request validation
- **No shared DTOs** between frontend and backend — conceptually aligned but independently maintained
- Some backend validators duplicated across modules (e.g., pagination schema)

### Decision: Shared DTOs (frontend-only for v1)

- Create `frontend/shared/dto/` with Zod schemas for each active API endpoint
- DTOs define request shape + response shape for each endpoint
- Feature `schemas/` import DTOs from `shared/dto/` (form validation extends base DTOs where needed)
- Backend still owns its validators — shared DTOs serve as **frontend type definitions**, not runtime validation on backend
- Future: consider `shared/dto/` as a separate package if duplication becomes problematic

### DTO list (from active matched endpoints)

| DTO | Endpoint | Request | Response |
|-----|----------|---------|----------|
| `auth.dto.ts` | `GET /api/auth/session` | — | SessionUser { id, email, role } |
| `privacy.dto.ts` | `POST /api/users/me/privacy-acceptance` | PrivacyAcceptanceReq | — |
| `admin.dto.ts` | `GET /api/admin/me` | — | AdminProfile |
| `admin-users.dto.ts` | `GET /api/admin/users` | PaginationParams | UserListResponse |

## 4. Test Coverage Analysis

### Current coverage: 6 test files across 4 of 11 features

| Feature | Schema Tests | Component Tests | Priority |
|---------|-------------|----------------|----------|
| auth | ✅ | ✅ | Keep existing |
| ticket-types | ✅ | ✅ | Keep existing |
| users | ✅ | ❌ | Add component test |
| admin-surveys | ❌ | ✅ | Keep existing |
| ticket-purchase | ❌ | ❌ | **HIGH** — core flow |
| admin-tickets | ❌ | ❌ | **HIGH** — admin CRUD |
| admin-users | ❌ | ❌ | **MEDIUM** |
| admin-auth | ❌ | ❌ | **LOW** |
| surveys | ❌ | ❌ | **LOW** (broken endpoint) |
| agenda | ❌ | ❌ | **LOW** |
| landing | ❌ | ❌ | **LOW** (static) |

### Decision

- Add tests for **high priority** features: `ticket-purchase`, `admin-tickets`
- Add component test for `users`
- Ensure all tests use mock DTO data via shared mock factories
- Schema tests: validate DTO schemas parse/parse correctly
- Component tests: render loading, error, success states with mock data

## 5. Test Infrastructure

- **Framework**: Vitest (existing, v4) + @testing-library/react (existing, v16)
- **TestWrapper**: Already in `frontend/test/test-utils.tsx` wraps ChakraProvider
- **Setup**: `frontend/test/setup.ts` imports `@testing-library/jest-dom/vitest`
- **Mock pattern**: `vi.mock()` for modules — used successfully in existing tests
- **Missing**: No mock data factories — needs `frontend/shared/dto/__mocks__/` or `frontend/test/mock-data/`

### Decision

- Create `frontend/test/mock-data/` with factory functions for each DTO
- Mock HTTP calls at the module level (vi.mock on api client modules)
- Test schema validation: `schema.safeParse(mockData)` for valid + invalid cases
- Test UI components: render with mock data, assert correct display/error/loading states

## 6. Development Best Practices

- **Simplicity**: one shared API client, not a new abstraction layer with interfaces/factories
- **Consistency**: all features use same fetch pattern, same DTO types, same test pattern
- **Incremental**: remove dead code first, then add DTOs, then refactor connection layer, then add tests
- **Colocation**: tests live in `__tests__/` within each feature folder (existing convention)
