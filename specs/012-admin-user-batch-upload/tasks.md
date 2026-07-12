---
description: "Implementation tasks for admin user batch upload from Excel"
---

# Tasks: Admin User Batch Upload from Excel

**Input**: Design documents from `specs/012-admin-user-batch-upload/`

**Prerequisites**: spec.md, plan.md

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/`
- **Feature module**: `frontend/features/admin-users/`
- **Route**: `frontend/app/admin/usuarios/carga-masiva/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure, route page, and template file

- [ ] T001 Create directory `frontend/features/admin-users/hooks/` for custom hooks
- [ ] T002 [P] Create route directory `frontend/app/admin/usuarios/carga-masiva/` and add `page.tsx` that renders `BatchUploadPage` from `@/features/admin-users/components/BatchUploadPage`
- [ ] T003 [P] Create template file `frontend/public/load_users_template.xlsx` with headers: nombre completo, cédula, teléfono, correo electrónico, contraseña (1 empty row below headers)

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Add `useBatchCreateUsers` mutation in `frontend/features/admin-users/api/admin-users.queries.ts`:
  - Mutation function POSTs array to `/api/admin/users/batch`
  - Invalidates `["admin", "users"]` query on success
  - Input type: `CreateUserInput[]` (reuse existing type)
  - Returns: `UserRow[]` on success, parses error `data.emails` and `data.cedulas` from 409 response
- [ ] T005 [P] Add `excelRowSchema` in `frontend/features/admin-users/schemas/admin-user.schema.ts`:
  - Zod schema: `z.object({ fullName: z.string().min(1).max(150), cedula: z.string().min(8).max(15).regex(/^\d+$/).optional(), phone: z.string().min(10).max(20).optional(), email: z.string().email(), password: z.string().min(6) })`
  - Export `ParsedExcelRow` type inferred from schema
- [ ] T006 [P] Add sidebar nav link in `frontend/shared/components/AdminSidebar.tsx`:
  - New link entry: `href: "/admin/usuarios/carga-masiva"`, `label: "Carga masiva"`, `icon: <IconUpload size={20} />`, `roles: ["super_admin", "admin"]`
  - Import `IconUpload` from `@tabler/icons-react`
- [ ] T007 [P] Add role-restricted path in `frontend/app/admin/layout.tsx`:
  - Add `"/admin/usuarios/carga-masiva": ["super_admin", "admin"]` to `ROLE_RESTRICTED_PATHS`

**Checkpoint**: Foundation ready — route page exists, template downloadable, schema defined, mutation wired, sidebar navigable

---

## Phase 3: User Story 1 — Upload and preview Excel data (Priority: P1) 🎯 MVP

**Goal**: Admin uploads `.xlsx`, system parses + validates rows, shows preview table with inline errors.

**Independent Test**: Admin navigates to `/admin/usuarios/carga-masiva`, uploads a valid `.xlsx` with 3 rows. Preview table shows 3 rows with no errors. Invalid `.xlsx` (e.g. missing emails) shows row-level validation errors.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create `frontend/features/admin-users/hooks/useExcelParser.ts`:
  - Custom hook that accepts `File | null`
  - Uses `read-excel-file` to parse the `.xlsx` file
  - Maps Spanish headers (`nombre completo` → `fullName`, `cédula` → `cedula`, `teléfono` → `phone`, `correo electrónico` → `email`, `contraseña` → `password`)
  - Validates each row against `excelRowSchema`
  - Returns state: `{ rows: ParsedExcelRow[], errors: { rowIndex: number, field: string, message: string }[], totalRows: number, validCount: number, invalidCount: number, isParsing: boolean, parseError: string | null }`
  - Enforces max 50 rows limit — if exceeded sets `parseError`
  - Accepts new file upload (replaces previous data)
- [ ] T009 [P] [US1] Create `frontend/features/admin-users/components/FileUploadZone.tsx`:
  - Chakra-based drag-and-drop zone with dashed border
  - Accepts only `.xlsx` files (validate by extension + MIME type)
  - Shows "Arrastra un archivo .xlsx aquí o haz clic para seleccionar" text
  - File input hidden, triggered by click on zone
  - Shows selected filename after upload
  - Calls `onFileSelect(file: File | null)` prop
  - Shows error state if non-.xlsx file dropped
  - Download template button "Descargar plantilla" that triggers `onDownloadTemplate` prop
  - Props: `onFileSelect`, `onDownloadTemplate`, `isDisabled` (disabled during parsing/sending)
- [ ] T010 [P] [US1] Create `frontend/features/admin-users/components/UploadPreviewTable.tsx`:
  - Shows table with columns: #, nombre completo, cédula, teléfono, correo electrónico, contraseña (masked), Estado
  - Props: `rows: ParsedExcelRow[]`, `errors: RowError[]`
  - Valid rows show green checkmark in Estado column
  - Invalid rows show red X, row is highlighted, error message shown per field
  - Empty state when no rows parsed
  - Summary bar below table: "X de Y filas válidas"
- [ ] T011 [US1] Create `frontend/features/admin-users/components/BatchUploadPage.tsx`:
  - Main orchestrator component for the upload page
  - Uses `useExcelParser` hook and `useBatchCreateUsers` mutation
  - Manages flow state: `idle → uploaded → parsed → confirming → sending → done`
  - Renders `FileUploadZone` at top
  - After parsing completes, renders `UploadPreviewTable` with parsed data
  - Shows "Confirmar envío" button only when valid rows > 0
  - "Confirmar envío" disabled when no valid rows or during sending
  - On confirm: calls mutation, shows loading state, then shows result
  - On mutation success: shows success toast with created count
  - On mutation error (409): shows conflict summary with `data.emails` and `data.cedulas`
  - On mutation network error: shows error toast with retry option

**Checkpoint**: Admin can upload, preview, validate rows, download template. All file/parse error states handled.

---

## Phase 4: User Story 2 — Confirm and send batch to API (Priority: P2)

**Goal**: Admin confirms batch, system POSTs to API, shows success/conflict result.

**Independent Test**: Admin uploads valid `.xlsx`, clicks confirm. Batch API called. On success, count shown. On 409 conflict, emails/cedulas listed. On network error, retry shown.

### Implementation for User Story 2

- [ ] T012 [P] [US2] Create `frontend/features/admin-users/components/BatchResultSummary.tsx`:
  - Props: `result: { status: 'success' | 'conflict' | 'error', createdCount?: number, conflicts?: { emails: string[], cedulas: string[] }, errorMessage?: string }`
  - Success state: green box "X usuarios creados exitosamente"
  - Conflict state: yellow box showing list of conflicting emails and cedulas
  - Error state: red box with error message + "Reintentar" button
  - "Volver" button that resets flow to idle
- [ ] T013 [US2] Wire `BatchResultSummary` into `BatchUploadPage.tsx`:
  - Show after mutation settles (success or error)
  - "Volver" calls a reset callback that clears file and parsed data
  - On conflict: show which rows match which conflict (match by email/cedula)
  - On total success: show option to go back to user list

**Checkpoint**: Full upload → preview → confirm → send → result flow complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Active states, error UX refinements

- [ ] T014 Update `AdminSidebar.tsx` — set link as active when pathname starts with `/admin/usuarios/` (so both `/admin/usuarios` and `/admin/usuarios/carga-masiva` highlight the Usuarios entry, or add a separate active highlight for carga-masiva)
- [ ] T015 Add `IconUpload` import to `AdminSidebar.tsx` (move from task T006 to here if missed)
- [ ] T016 Run `npm run lint` and `npm run typecheck` in frontend to verify no type/lint errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — creates dirs, route, template
- **Foundational (Phase 2)**: Depends on Setup — adds mutation, schema, nav, role guard
- **US1 (Phase 3)**: Depends on Phase 1 + 2 — uses schema, route, template
- **US2 (Phase 4)**: Depends on US1 — uses the parsed data flow; also depends on T004 mutation
- **Polish (Phase 5)**: Depends on Phase 3

### User Story Dependencies

- **US1 (P1)**: Can start after Setup + Foundational — no dependency on US2
- **US2 (P2)**: Depends on US1 — confirm button only meaningful after upload + preview

### Within Each User Story

- Schema before parser hook (T005 before T008)
- Parser hook before preview table (T008 before T010)
- Components before page orchestrator (T009, T010 before T011)
- Mutation before confirm button (T004 before T012)
- Result component after mutation (T012 after T004, T013 after T011)

### Parallel Opportunities

- T002, T003: Route page + template file — parallel
- T004, T005, T006, T007: Mutation + schema + sidebar + role guard — parallel
- T008, T009, T010: Parser hook + file zone + preview table — parallel
- T012: Result summary can start while US1 components stabilize

---

## Parallel Execution Example: User Story 1

```bash
# Launch parser hook + file zone + preview table together:
Task: "Create useExcelParser hook in hooks/useExcelParser.ts"
Task: "Create FileUploadZone component in components/FileUploadZone.tsx"
Task: "Create UploadPreviewTable component in components/UploadPreviewTable.tsx"

# Then page orchestrator (depends on all three):
Task: "Create BatchUploadPage orchestrator in components/BatchUploadPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (dirs, route, template)
2. Complete Phase 2: Foundational (mutation, schema, nav, guard)
3. Complete Phase 3: US1 (upload → parse → preview)
4. **STOP and VALIDATE**: Upload flow works end-to-end, preview shows valid/invalid rows
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Route exists, schema ready, sidebar linked
2. Add US1 → Upload + parse + preview → Deploy (MVP!)
3. Add US2 → Confirm + send + result → Deploy
4. Add Polish → Active states, lint/typecheck → Deploy
