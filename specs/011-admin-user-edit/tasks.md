# Tasks: Admin User Edit

**Input**: Design documents from `/specs/011-admin-user-edit/`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)

---

## Phase 1: Setup (Verify Prerequisites)

**Purpose**: Verify backend endpoint exists and frontend infrastructure is ready

- [X] T001 Verify `PATCH /api/admin/users/:id` exists and returns fullName, phone, cedula, role, isActive fields
- [X] T002 [P] Verify frontend `authFetch` utility supports PATCH method

---

## Phase 2: Foundational (API Layer + Schema)

**Purpose**: Add mutation hook and validation schema before UI components

- [X] T003 [P] Add `UpdateUserInput` type and `updateUser` fetch function + `useUpdateUser` mutation in `frontend/features/admin-users/api/admin-users.queries.ts`
- [X] T004 [P] Create `adminUserUpdateSchema` Zod schema in `frontend/features/admin-users/schemas/admin-user.schema.ts` — validates fullName, phone, cedula, role, isActive with at-least-one-field refinement

---

## Phase 3: User Story 1 - Admin Edits User Profile (Priority: P1) 🎯 MVP

**Goal**: Add edit button to each user row → modal with pre-filled form → validate → PATCH → refresh list

**Independent Test**: Open `/admin/usuarios` → click edit button → modal opens with current data → modify name → save → modal closes → name updated in table

### Implementation for User Story 1

- [X] T005 [US1] Create `UserEditForm` component in `frontend/features/admin-users/components/UserEditForm.tsx` — fields: fullName, phone, cedula, role (select), isActive (switch), validate with `adminUserUpdateSchema.safeParse`, show field-level errors, calls `onSave(id, data)` prop
- [X] T006 [P] [US1] Create `UserEditDialog` component in `frontend/features/admin-users/components/UserEditDialog.tsx` — Chakra Dialog wrapper, finds user from `queryClient.getQueryData`, renders `UserEditForm`, handles save/cancel, shows toast
- [X] T007 [P] [US1] Add actions column with edit button to `UserTableItem` in `frontend/features/admin-users/components/UserTableItem.tsx` — receives `onEdit: (userId: string) => void` prop, renders edit icon button
- [X] T008 [US1] Wire `editingUserId` state + `UserEditDialog` into `UserTable` in `frontend/features/admin-users/components/UserTable.tsx` — import and render dialog, pass `onEdit` to `UserTableItem`

**Checkpoint**: Edit button visible on each row → click opens modal → edit and save → list refreshes with new data

---

## Phase 4: Polish & Validation

**Purpose**: Edge case handling and error states

- [X] T009 Handle API error responses in `UserEditForm` — display server validation errors as field-level errors when possible, toast for general errors
- [X] T010 Handle loading state — disable form and show spinner on save button during mutation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can verify immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS UI components
- **User Story 1 (Phase 3)**: Depends on Foundational (T003, T004)
- **Polish (Phase 4)**: Depends on User Story 1 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after T003, T004 — No dependencies on other stories

### Parallel Opportunities

- T001 + T002: Can run in parallel
- T003 + T004: Can run in parallel (different files)
- T006 + T007: Can run in parallel (different files)
- T005 must precede T006 (form needed by dialog)
- T006 + T007 must precede T008 (dialog + button needed by table)

### Parallel Example

```bash
# Launch foundational tasks together:
Task: "Add useUpdateUser mutation in admin-users.queries.ts"
Task: "Create adminUserUpdateSchema in admin-user.schema.ts"

# Launch T006 + T007 together:
Task: "Create UserEditDialog component"
Task: "Add edit button to UserTableItem"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify backend endpoint works
2. Complete Phase 2: Create mutation + schema
3. Complete Phase 3: Build form → dialog → button → wire in table
4. **STOP and VALIDATE**: Open `/admin/usuarios`, edit a user
5. Deploy if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → API layer ready
2. Phase 3 → Full edit functionality working
3. Phase 4 → Edge cases handled
