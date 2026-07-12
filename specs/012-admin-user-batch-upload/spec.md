# Feature Specification: Admin User Batch Upload from Excel

**Feature Branch**: `012-admin-user-batch-upload`

**Created**: 2026-07-11

**Status**: Draft

**Input**: User description: "Excel upload UI for batch-creating admin/client users. File upload with drag-and-drop, parse .xlsx, validate with schema, preview table, confirm send to backend batch API."

## User Scenarios & Testing

### User Story 1 — Upload and preview Excel data (Priority: P1)

Admin navigates to a new page at `/admin/usuarios/carga-masiva`, uploads an `.xlsx` file (drag-drop or button), system parses the Excel, validates each row against a Zod schema, and shows a preview table with row-level validation feedback.

**Why this priority**: Core interaction — no upload means no batch creation. Enables admin to verify data before sending.

**Independent Test**: Admin uploads a valid `.xlsx` file. System parses and displays a table with the expected columns (nombre completo, cédula, teléfono, correo electrónico, contraseña). Invalid rows show inline errors. Template download produces a valid `.xlsx` file.

**Acceptance Scenarios**:

1. **Given** an admin on the carga-masiva page, **When** they drag a `.xlsx` file onto the upload zone, **Then** the file is accepted and parsing begins.
2. **Given** an admin on the carga-masiva page, **When** they drag a non-`.xlsx` file (e.g. `.csv`, `.pdf`), **Then** an error message is shown and the file is rejected.
3. **Given** an admin has uploaded a valid `.xlsx`, **When** parsing completes, **Then** a preview table is shown with columns: nombre completo, cédula, teléfono, correo electrónico, contraseña.
4. **Given** an admin has uploaded an `.xlsx` with invalid rows (missing email, short password), **When** preview loads, **Then** invalid rows are highlighted with specific validation error messages.
5. **Given** an admin on the carga-masiva page, **When** they click "Descargar plantilla", **Then** a file named `load_users_template.xlsx` is downloaded.
6. **Given** an admin has uploaded an `.xlsx` with more than 50 rows, **When** parsing completes, **Then** an error is shown indicating the batch limit (max 50).

---

### User Story 2 — Confirm and send batch to API (Priority: P2)

Admin confirms the parsed data, the system sends the batch to `POST /api/admin/users/batch`, and displays the result showing which users were created and which had conflicts.

**Why this priority**: Completes the workflow — upload without confirm+send is incomplete.

**Independent Test**: Admin uploads valid data, clicks "Confirmar", system POSTs to the batch endpoint, and success results are shown.

**Acceptance Scenarios**:

1. **Given** an admin has uploaded valid data and viewed the preview, **When** they click "Confirmar envío", **Then** the system calls `POST /api/admin/users/batch` with the parsed JSON array.
2. **Given** the batch API returns 201 (all created), **When** the response arrives, **Then** a success summary is shown with count of created users.
3. **Given** the batch API returns 409 with conflict data (emails, cedulas), **When** the response arrives, **Then** a conflict summary is shown listing which emails and/or cedulas conflicted.
4. **Given** an admin has uploaded valid data, **When** they click "Confirmar envío", **Then** the confirm button shows a loading state and is disabled during the request.

---

### Edge Cases

- What happens when Excel has extra columns beyond the expected 5? (Should be ignored)
- What happens when Excel has missing columns? (Columns detected by header mapping — missing required = row error)
- What happens when admin uploads a new file after previewing one? (Should replace previous data)
- What happens when network fails during batch POST? (Show error toast, allow retry)
- What happens when Excel headers are in different order? (Should map by header text, not position)
- What happens when a row has only optional fields filled but no email? (email is required — validation error)
- What happens when admin has no role `admin`? (Layout already guards — redirect to AccessDenied)

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a new route `/admin/usuarios/carga-masiva` accessible only to `super_admin` and `admin` roles.
- **FR-002**: System MUST provide a drag-and-drop file input that accepts only `.xlsx` files.
- **FR-003**: System MUST parse `.xlsx` files using the `read-excel-file` library.
- **FR-004**: System MUST map Spanish Excel headers (`nombre completo`, `cédula`, `teléfono`, `correo electrónico`, `contraseña`) to English fields (`fullName`, `cedula`, `phone`, `email`, `password`).
- **FR-005**: System MUST validate each row with a Zod schema: `email` (required, valid email), `password` (required, min 6 chars), `fullName` (required, 1-150 chars), `cedula` (optional, 8-15 digits), `phone` (optional, 10-20 chars).
- **FR-006**: System MUST enforce a batch limit of max 50 rows (matching backend `batchCreateUsersSchema`).
- **FR-007**: System MUST show a preview table after parsing, with all columns and per-row validation errors.
- **FR-008**: System MUST provide a "Descargar plantilla" button that downloads `load_users_template.xlsx` from `/public`.
- **FR-009**: System MUST provide a "Confirmar envío" button that POSTs the valid data array to `/api/admin/users/batch`.
- **FR-010**: System MUST display the API response: success count or conflict details (email/cedula errors).
- **FR-011**: System MUST handle loading and error states for both file parsing and API call.
- **FR-012**: System MUST show a link/nav entry in the AdminSidebar to the new route.

### Key Entities

- **ExcelSchema**: 5 columns mapped from Spanish to English fields, with email+password required, fullName+cedula+phone optional but constrained.
- **ParsedRow**: Individual row from Excel with raw values, mapped fields, validation status, and error messages.
- **BatchUploadState**: Current state machine for the upload flow: `idle → uploaded → parsed → previewing → confirming → sending → done/error`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can upload, preview, and send a batch of 50 users in under 30 seconds.
- **SC-002**: Validation errors are shown in under 1 second after file upload.
- **SC-003**: Template download completes immediately (static file from `/public`).
- **SC-004**: All user-facing text is in Spanish; code identifiers are in English.

## Assumptions

- `read-excel-file` library is already in `package.json` (confirmed).
- Backend `POST /api/admin/users/batch` endpoint already exists and accepts `{ email, password, fullName, cedula?, phone? }[]`.
- Backend returns conflict errors with `data: { emails, cedulas }` structure.
- Template `.xlsx` file will be created manually with the correct headers and one empty row.
- No backend changes are needed — only frontend work.
- The `/admin/usuarios/carga-masiva` route extends the existing admin layout with sidebar and role guard.
