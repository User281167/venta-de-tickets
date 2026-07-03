# Tasks: Profile, Signup & Consent Flow

**Input**: Design documents from `specs/005-profile-signup-consent/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — manual QA defined in final phase.

**Organization**: Tasks grouped by user story. Sequential dependency chain.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/`
- Backend: `backend/` (no backend changes needed for this feature)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup tasks — project structure, dependencies, and existing backend endpoints from 004 are already in place.

**Checkpoint**: Ready for foundational work.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update auth schema and client to support new registration fields — foundational for all user stories.

**⚠️ CRITICAL**: All user story work depends on this phase.

- [x] T001 Add `consentGiven` to `registerSchema` in `frontend/features/auth/schemas/auth.schema.ts`. No fullName or phone — set later in profile panel.
- [x] T002 No changes needed to `signUp()` — remains `(email, password)` only.

**Checkpoint**: Schema extended and API client updated. `registerSchema.safeParse()` validates fullName, phone, consentGiven. `signUp()` sends user_metadata.

---

## Phase 3: User Story 1 — Registration with Privacy Consent (Priority: P1) 🎯 MVP

**Goal**: New users can register with full name, phone, and mandatory consent checkbox. Formal consent record created on first profile access.

**Independent Test**: Visit /registro as new user, fill all fields, check consent checkbox, submit. Account created. After email confirmation, first /mi-cuenta visit shows PrivacyConsentModal.

### Implementation for User Story 1

- [x] T003 [US1] Enhance `frontend/features/auth/components/RegisterForm.tsx`:
  - Add `consentGiven` (boolean `false` initial) state
  - Add `Checkbox.Root` + `Checkbox.Control` for consent (text: "Acepto los términos y condiciones y la política de privacidad" with links to /terminos and /privacidad), wrapped in `HStack` so links don't interfere with checkbox toggle
  - Update `handleSubmit` to validate `registerSchema` with `consentGiven` field
  - No fullName or phone fields — set later in profile panel via PATCH /me
- [x] T004 [US1] Privacy consent already handled — `PrivacyConsentModal` records acceptance on first /mi-cuenta access. No changes needed.

**Checkpoint**: Registration with consent checkbox works end-to-end. Consent checkbox blocks submission when unchecked. PrivacyConsentModal records acceptance on first profile access.

---

## Phase 4: User Story 2 — View and Edit Personal Profile (Priority: P2)

**Goal**: Authenticated user can view and edit their profile data at /mi-cuenta. Profile fields display in read-only mode with edit toggle.

**Independent Test**: Log in as existing user, visit /mi-cuenta, verify full name, email, phone display. Click "Editar", change full name, save, reload page — confirm persisted.

### Implementation for User Story 2

- [x] T005 [US2] Verify and refine `frontend/features/users/components/ProfileForm.tsx`:
  - Ensure displays: fullName, email, phone (read-only by default)
  - Ensure "Editar" button toggles edit mode with "Guardar" and "Cancelar" buttons
  - Ensure save calls `useUpdateMe()` mutation and invalidates `["me"]`
  - Ensure cancel reverts to cached values from useMe()
  - Ensure email field is read-only in edit mode
  - Ensure consent status (accepted date + version) is displayed
- [x] T006 [US2] Verify and refine `frontend/app/(protected)/mi-cuenta/page.tsx`:
  - Ensure auth check redirects unauthenticated to /login
  - Ensure PrivacyConsentModal gates before ProfileForm when consent not accepted
  - Ensure loading state during fetch
  - Ensure profile renders after consent accepted

**Checkpoint**: Profile fully functional at /mi-cuenta. Edit/save/cancel flow works. Consent gate works.

---

## Phase 5: User Story 3 — Redirect Authenticated Users from Auth Pages (Priority: P3)

**Goal**: Authenticated users visiting /login or /registro are immediately redirected to /mi-cuenta. Unauthenticated visitors see pages normally.

**Independent Test**: Log in, navigate to /login — redirects to /mi-cuenta within 1 second. Log out, visit /login — page loads normally.

### Implementation for User Story 3

- [x] T007 [US3] Add auth redirect to `frontend/app/(auth)/login/page.tsx`:
  - Import `useAuth()` from `@/features/auth/hooks/useAuth`
  - Import `useRouter` from `next/navigation`
  - At top of page, check `user` from `useAuth()` — if truthy and `!isLoading`, call `router.replace("/mi-cuenta")` and return null
- [x] T008 [P] [US3] Add auth redirect to `frontend/app/(auth)/registro/page.tsx`:
  - Same pattern: import `useAuth()`, check `user`, redirect to `/mi-cuenta` if authenticated

**Checkpoint**: Login and registro pages redirect authenticated users. Visitors see pages normally.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UI refinements, logout button, and build verification.

- [x] T009 Add logout button to `frontend/components/layout/Navbar.tsx`:
  - When user is authenticated, add "Cerrar sesión" button next to "Mi Perfil"
  - Import `signOut()` from `@/features/auth/api/auth.client`
  - Import `useRouter` from `next/navigation`
  - On click: call `signOut()`, on success `router.push("/")`
  - Use Chakra `Button` with `variant="ghost"` matching navbar style
- [x] T010 Run `npm run lint` and `npm run typecheck` in frontend — fix any issues
- [x] T011 Run `npm run build` in frontend — verify production build succeeds
- [x] T012 Add CORS middleware to `backend/src/app.ts` — allow `http://localhost:3000` origin with credentials

**Checkpoint**: Logout works. Build clean. Feature ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — already complete
- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2. BLOCKS Phase 4 (profile depends on registration).
- **User Story 2 (Phase 4)**: Depends on Phase 2 and US1 completion. Profile requires registered user.
- **User Story 3 (Phase 5)**: Depends on Phase 2. Independent of US1 and US2.
- **Polish (Phase 6)**: Depends on Phase 5.

### User Story Dependencies

- **US1 (Registration with Consent)**: T001 → T002 → T003 → T004
- **US2 (View and Edit Profile)**: T001 → T002 → T005 → T006 (but T005/T006 are verification of existing 004 files)
- **US3 (Route Protection)**: T001 → T002 → T007 → T008 (T007 and T008 are parallel)

### Within Each Phase

- `[P]` tasks can run in parallel (different files, no dependencies)
- Non `[P]` tasks must run sequentially

### Parallel Opportunities

- T002 (auth.client.ts) can run in parallel with T001 (auth.schema.ts) — different files
- T007 (login redirect) and T008 (registro redirect) are parallel — different files
- T003 (RegisterForm) must wait for T001 (schema) and T002 (client)

---

## Implementation Strategy

### MVP First (Phase 2 + US1 Only)

1. Complete Phase 2: Foundational (schema + API client)
2. Complete Phase 3: US1 — Registration with Privacy Consent
3. **STOP and VALIDATE**: Registration flow works end-to-end
4. Add remaining stories incrementally

### Incremental Delivery

1. Phase 2 → Schema and API ready
2. Phase 3 → Registration with consent (MVP!)
3. Phase 4 → Profile view and edit
4. Phase 5 → Route protection
5. Phase 6 → Polish, logout, build verify

---

## Notes

- `[P]` tasks = different files, no dependencies
- `[Story]` label maps task to specific user story for traceability
- No backend changes needed — all API endpoints exist from 004-user-profile-panel
- `signOut()` already exists in `auth.client.ts` — just needs UI integration
- ProfileForm and PrivacyConsentModal already exist from 004 — tasks T005/T006 verify and refine
- RegisterForm currently has email, password, confirmPassword only — needs fullName, phone, consent checkbox
- registerSchema currently has email, password, confirmPassword only — needs fullName, phone, consentGiven
- signUp() currently takes (email, password) only — needs metadata support
