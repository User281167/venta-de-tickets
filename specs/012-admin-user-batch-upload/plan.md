# Implementation Plan: Admin User Batch Upload from Excel

**Branch**: `012-admin-user-batch-upload` | **Date**: 2026-07-11 | **Spec**: `specs/012-admin-user-batch-upload/spec.md`

**Input**: Feature specification from `specs/012-admin-user-batch-upload/spec.md`

## Summary

Frontend-only feature: new admin page at `/admin/usuarios/carga-masiva` with drag-drop `.xlsx` upload, parse via `read-excel-file`, validate rows with Zod, show preview table, confirm to send to existing `POST /api/admin/users/batch`. No backend changes needed.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.2.9 (App Router)

**Primary Dependencies**: `read-excel-file` (9.3.1, already in deps), `@chakra-ui/react` (3.36.0), `@tanstack/react-query` (5.x), `zod` (4.x), `@tabler/icons-react`

**Storage**: N/A (no persistence — sends directly to API)

**Testing**: Vitest + `@testing-library/react`

**Target Platform**: Browser (admin panel)

**Project Type**: Frontend-only feature

**Constraints**: Max 50 rows per batch (backend limit)

## Constitution Check

*GATE: Pass — no violations.*

## Project Structure

### Documentation (this feature)

```text
specs/012-admin-user-batch-upload/
├── spec.md      # Feature spec (this feature)
├── plan.md      # This file
└── tasks.md     # Implementation tasks
```

### Source Code (repository root)

```text
frontend/
├── features/
│   └── admin-users/
│       ├── components/
│       │   ├── BatchUploadPage.tsx       # Main page orchestrator
│       │   ├── FileUploadZone.tsx        # Drag-drop + button file input
│       │   ├── UploadPreviewTable.tsx    # Preview table with row validation
│       │   ├── UploadErrorRow.tsx        # Row-level error display
│       │   ├── BatchResultSummary.tsx    # Success/conflict result display
│       │   └── __tests__/
│       │       ├── FileUploadZone.test.tsx
│       │       ├── UploadPreviewTable.test.tsx
│       │       └── BatchUploadPage.test.tsx
│       ├── api/
│       │   └── admin-users.queries.ts    # Add useBatchCreateUsers mutation
│       ├── schemas/
│       │   └── admin-user.schema.ts      # Add excelRowSchema for Excel parsing
│       └── hooks/
│           └── useExcelParser.ts          # Custom hook: parse + validate .xlsx
├── app/
│   └── admin/
│       └── usuarios/
│           └── carga-masiva/
│               └── page.tsx              # New route page
├── shared/
│   └── components/
│       └── AdminSidebar.tsx              # Add nav link to carga-masiva
└── public/
    └── load_users_template.xlsx          # Downloadable template file
```

**Structure Decision**: Keep within existing `features/admin-users/` module. Add a `hooks/` directory for `useExcelParser`. New page route under existing `app/admin/usuarios/`. Template file in `public/`.

## Complexity Tracking

No violations — frontend-only, single module, no new abstractions.
