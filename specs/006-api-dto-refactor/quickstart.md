# Quickstart: API-DTO Refactor

## Implementation Order

### Phase 1: Audit & Remove Dead Endpoints

1. **Audit frontend API files** — identify all broken endpoint calls (see [contracts/api.md](./contracts/api.md))
2. **Remove broken endpoint calls** from:
   - `frontend/features/ticket-purchase/api/ticket-purchase.endpoints.ts` — remove `/api/ticket-types` call
   - `frontend/features/ticket-types/api/ticket-types.endpoints.ts` — remove `/api/events/:eventId`, admin ticket-type CRUD calls
   - `frontend/features/users/api/users.client.ts` — remove `/api/users/me` GET/PATCH
   - `frontend/features/surveys/api/endpoints/surveys.endpoints.ts` — remove `/api/surveys/onboarding` POST
   - `frontend/features/admin-surveys/api/admin-surveys.queries.ts` — remove `/api/admin/surveys/onboarding` GET
3. **Remove dead imports** to `features/events/` — search all files for `@/features/events/` and remove/replace
4. **Verify build** — run `tsc --noEmit` or `next build` to confirm no broken references remain

### Phase 2: Create Shared API Client

1. Create `frontend/shared/api/client.ts`:
   - Export `apiClient` object with `.get<T>()`, `.post<T>()`, `.patch<T>()`, `.delete<T>()`
   - Accept optional auth token parameter (get from Supabase session)
   - Prepend `NEXT_PUBLIC_API_URL` (fallback to empty string for same-origin)
   - Parse error response body → throw structured `ApiError`
   - Use existing `admin-fetch.ts` as base, merge the `BASE_URL` + error body parsing improvements from the local `apiFetch` copies
2. Migrate existing consumers:
   - `frontend/features/admin-*/api/*.queries.ts` — replace `adminFetch` with `apiClient`
   - `frontend/features/users/api/users.client.ts` — replace local `apiFetch` with `apiClient`
   - `frontend/features/surveys/api/endpoints/surveys.endpoints.ts` — replace local `apiFetch` with `apiClient`
   - `frontend/features/auth/hooks/useLogin.ts` — replace `adminFetch` with `apiClient`
   - `frontend/features/ticket-purchase/api/ticket-purchase.endpoints.ts` — replace raw `fetch` with `apiClient`
3. Remove `frontend/shared/api/admin-fetch.ts` (replaced by client.ts)
4. Remove local `apiFetch` functions from `users.client.ts` and `surveys.endpoints.ts`

### Phase 3: Create Shared DTOs

1. Create `frontend/shared/dto/index.ts` (barrel export)
2. Create DTOs for active endpoints:

| File | Schema Exports |
|------|---------------|
| `dto/auth.dto.ts` | `sessionUserSchema`, `SessionUser` |
| `dto/privacy.dto.ts` | `privacyAcceptanceReqSchema`, `PrivacyAcceptanceReq` |
| `dto/admin.dto.ts` | `adminProfileSchema`, `AdminProfile` |
| `dto/admin-users.dto.ts` | `paginationParamsSchema`, `PaginationParams`, `userListResponseSchema`, `UserListResponse`, `paginatedResponseSchema`, `PaginatedResponse<T>` |
| `dto/error.dto.ts` | `apiErrorSchema`, `ApiError` |

3. Update feature `schemas/` to import DTO base schemas from `shared/dto/`:
   - Extend with Zod for form-specific validations (e.g., `.refine()` for password match)
   - Re-export alongside feature-specific schemas

### Phase 4: Refactor UI Components

1. Update components to use typed DTO data:
   - `features/ticket-purchase/components/*` — use `TicketType` from DTO
   - `features/ticket-types/components/*` — use `TicketType` from DTO
   - `features/admin-users/components/*` — use `UserListResponse` from DTO
2. Ensure every data-displaying component handles three states:
   - Loading state (skeleton/spinner)
   - Error state (error message with retry)
   - Success state (data rendered)
3. Remove unused components tied to broken endpoints

### Phase 5: Add Tests

1. Create mock data factories in `frontend/test/mock-data/`:
   - `mock-data/auth.ts` — mock SessionUser, AdminProfile
   - `mock-data/users.ts` — mock UserListResponse items
   - `mock-data/ticket-types.ts` — mock TicketType (for future use)

2. Write DTO schema tests:
   - `shared/dto/__tests__/auth.dto.test.ts` — test parsing each DTO
   - `shared/dto/__tests__/admin-users.dto.test.ts` — test pagination params + response

3. Write component tests for high-priority features:
   - `features/ticket-purchase/components/__tests__/` — TicketTypeCard, OrderSummary, CartQuantitySpinner
   - `features/admin-tickets/components/__tests__/` — TicketTypesTable, TicketTypesDialogs
   - `features/users/components/__tests__/ProfileForm.test.tsx` — add missing component test

4. Verify test isolation: `vitest run` with no network requests

### Phase 6: Verify & Cleanup

1. Run full test suite: `vitest run`
2. Run type check: `tsc --noEmit` (or `next build`)
3. Remove backup/dead code confirmed unreferenced
4. Remove `frontend/shared/api/admin-fetch.ts` if replaced

## Key Files

| Path | Action |
|------|--------|
| `frontend/shared/api/client.ts` | Create — unified API client |
| `frontend/shared/api/admin-fetch.ts` | Delete after migration |
| `frontend/shared/dto/*.ts` | Create — shared DTO schemas |
| `frontend/test/mock-data/*.ts` | Create — mock data factories |
| `frontend/features/*/api/*.ts` | Refactor — remove dead calls, use apiClient |
| `frontend/features/*/schemas/*.ts` | Refactor — import from shared/dto |
| `frontend/features/*/components/__tests__/*.test.tsx` | Create — component tests |
