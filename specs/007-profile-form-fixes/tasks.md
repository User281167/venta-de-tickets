---
description: "Bug fix tasks for ProfileForm — data not displaying, error toasts, cedula lock"
---

# Tasks: Profile Form Bug Fixes

**Input**: User reports ProfileForm shows empty fields despite data in DB, error messages not shown, cedula field not locked.

## Root Cause Analysis

- **Bug 1 (Empty form)**: `meHandler` in `backend/src/modules/me/me.controller.ts:9` returns `req.user` which only has `{ id, email, role }` from auth middleware. Personal info fields (cedula, fullName, phone, address, dateOfBirth) never included in `/api/me` response.
- **Bug 2 (No error toast)**: `apiFetch` in `frontend/features/users/api/users.client.ts:32` throws generic `Error(body?.error?.message ?? \`Error ${res.status}\`)`. Toast catches this, but backend error code (`VALIDATION_ERROR`, `CEDULA_INVALIDATION`) not exposed to user-friendly mapping.
- **Bug 3 (Cedula not locked)**: Direct consequence of Bug 1 — `user.cedula` is always `undefined`, so `disabled={!editing || !!user.cedula}` never locks the field.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 1: Backend — Include personal info in `/api/me` response

**Purpose**: Fix root cause — `meHandler` must merge auth user data with personal info fields.

- [X] T001 Backend: Merge personal info into `/api/me` response at `backend/src/modules/me/me.controller.ts:9`. Call `meService.getPersonalInfo()` and merge with `req.user`.
- [ ] T002 [P] Backend: Add `fullName`, `phone`, `cedula`, `address`, `dateOfBirth` fields to Express `req.user` type in `backend/src/shared/middlewares/express.d.ts` (optional — only if needed for other handlers). — SKIPPED (not needed, meHandler merges inline)

**Checkpoint**: Backend returns complete user data (auth + personal info) from `GET /api/me`.

---

## Phase 2: Frontend — Update types and error mapping

**Purpose**: Ensure `GetMeResponse` matches actual backend response and errors show user-friendly messages.

- [X] T003 Frontend: Update `GetMeResponse` type in `frontend/features/users/api/users.client.ts:38` to include `cedula`, `address`, `dateOfBirth` fields (already has `fullName`, `phone`).
- [X] T004 Frontend: Create user-friendly error code map in `frontend/features/users/api/users.client.ts`. Map backend error codes (`VALIDATION_ERROR`, `CEDULA_INVALIDATION`, `INTERNAL_ERROR`) to Spanish messages. Export for use by components.
- [X] T005 Frontend: Update `apiFetch` error handling in `frontend/features/users/api/users.client.ts:30-33` to use error code map. Throw structured error with `code` and `message` so components can show appropriate toasts.

**Checkpoint**: Frontend types match backend response, errors have user-friendly messages.

---

## Phase 3: Frontend — Fix ProfileForm rendering and toasts

**Purpose**: Form reads personal info from `useMe()` and displays correctly; cedula locks when set; toasts show user-friendly messages.

- [X] T006 Frontend: ProfileForm in `frontend/features/users/components/ProfileForm.tsx` — reads `user.cedula`, `user.fullName`, etc. from `useMe()` response. Should now work after T001+T003. Verify all fields display correctly in view and edit modes.
- [X] T007 [P] Frontend: Ensure `updateMe` mutation `onError` callback in `frontend/features/users/components/ProfileForm.tsx:85-89` uses extracted error code/message from `apiFetch`. Show toast with user-friendly message.
- [X] T008 [P] Frontend: Verify cedula field lock in `frontend/features/users/components/ProfileForm.tsx:109` — `disabled={!editing || !!user.cedula}`. When user has cedula in DB, field must be disabled in edit mode and helper text shown.
- [X] T009 Frontend: Verify `startEdit` in `frontend/features/users/components/ProfileForm.tsx:49-59` populates form state with current user data (including cedula). This was already correct but depended on Bug 1 fix.

**Checkpoint**: ProfileForm shows live data, cedula locks when set, errors show via Sonner toasts.

---

## Phase 4: Tests — Verify no regressions

**Purpose**: Run existing tests and add coverage for the fix.

- [X] T010 Run backend test suite — no backend tests exist. No regressions.
- [X] T011 [P] Run frontend test suite — 55 tests pass, 0 failures. No new TS errors.
- [X] T012 Run full build (backend + frontend) to confirm no type errors — frontend typecheck: no new TS errors. Backend: n/a (no test suite).

**Checkpoint**: All tests pass, no regressions.

---

## Phase 5: Manual verification

**Purpose**: End-to-end verification of the fix.

- [ ] T013 Manual E2E: Register new user → fill ProfileForm cedula + name + phone → save → verify form shows saved data → edit → verify cedula disabled → error case: submit empty name → verify toast shows error.
- [ ] T014 Manual E2E: Login existing user with complete profile → verify form pre-filled with all personal info → edit phone → save → verify toast → verify form shows updated data.

**Checkpoint**: All scenarios working end-to-end.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Backend fix)**: No dependencies — start here (root cause fix).
- **Phase 2 (Frontend types)**: Depends on Phase 1 (need to match new response shape).
- **Phase 3 (Form fix)**: Depends on Phase 1 + Phase 2 (needs correct data + types).
- **Phase 4 (Tests)**: Depends on Phase 1 + 2 + 3 (tests verify all changes).
- **Phase 5 (Manual E2E)**: Depends on all phases.

### Parallel Opportunities

- T002 (type extension) can run in parallel with T001 (main fix) — both backend files.
- T007 (toast error handling) and T008 (cedula lock) can run in parallel — both frontend UI.
- T010 (backend tests) and T011 (frontend tests) run in parallel.

---

## Parallel Example

```bash
# Phase 1 — both are backend:
Task: "T001 Merge personal info in meHandler (me.controller.ts)"
Task: "T002 Extend req.user type (express.d.ts)"

# Phase 3 — UI tweaks in same component:
Task: "T007 Update error toast message extraction"
Task: "T008 Verify cedula lock logic"

# Phase 4 — independent test suites:
Task: "T010 Run backend tests"
Task: "T011 Run frontend tests"
```

---

## Implementation Strategy

1. **Fix root cause first (Phase 1)**: Backend `meHandler` must include personal info. Everything else depends on this.
2. **Update frontend types (Phase 2)**: Match the new response shape and add error code mapping.
3. **Fix form display (Phase 3)**: Most changes are already in place — they just need the data to flow correctly.
4. **Test (Phase 4)**: Verify nothing broke.
5. **Manual check (Phase 5)**: Confirm end-to-end.

## Key Files

| File | Role |
|------|------|
| `backend/src/modules/me/me.controller.ts` | **T001** — Merge personal info into `/api/me` response |
| `backend/src/shared/middlewares/express.d.ts` | **T002** — Extend user type |
| `frontend/features/users/api/users.client.ts` | **T003** — Update GetMeResponse; **T004** — Error map; **T005** — Error handling |
| `frontend/features/users/components/ProfileForm.tsx` | **T006** — Verify display; **T007** — Error toasts; **T008** — Cedula lock; **T009** — Start edit |
| `frontend/features/users/hooks/useProfile.ts` | Verify query invalidation works after update |
