# Implementation Plan: Admin User Edit

## Tech Stack

- **Frontend**: Next.js (App Router), Chakra UI 3.x (Dialog, Field, Input, Switch, Select), TanStack Query (useMutation), Zod (client validation)
- **Backend**: No changes — `PATCH /api/admin/users/:id` + `updateUserSchema` already exist

## Structure

### Component tree

```
UserTable (existing — add state + dialog wiring)
  ├── UserTableItem (existing — add edit button column)
  ├── UserTableSkeleton (existing — unchanged)
  ├── UserError (existing — unchanged)
  └── UserEditDialog (new) — modal wrapper
        └── UserEditForm (new) — form fields + client validation
```

### New/modified files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/features/admin-users/api/admin-users.queries.ts` | Modify | Add `UserRow` fields (phone, cedula, isActive), add `useUpdateUser` mutation + `updateUser` fetch |
| `frontend/features/admin-users/schemas/admin-user.schema.ts` | Create | Zod schema for admin user edit validation |
| `frontend/features/admin-users/components/UserEditForm.tsx` | Create | Form component with fields: fullName, phone, cedula, role, isActive |
| `frontend/features/admin-users/components/UserEditDialog.tsx` | Create | Dialog wrapper that opens/closes, holds form state |
| `frontend/features/admin-users/components/UserTableItem.tsx` | Modify | Add actions column with edit button |
| `frontend/features/admin-users/components/UserTable.tsx` | Modify | Add editing state, render UserEditDialog |

### Data flow

1. `UserTable` holds `editingUserId: string | null` state
2. `UserTableItem` receives `setEditingUserId` callback, renders edit button
3. On click → `setEditingUserId(user.id)` → `UserEditDialog` opens
4. `UserEditDialog` finds user from cache, passes to `UserEditForm`
5. `UserEditForm` validates with Zod → calls `updateUser` via `useMutation`
6. On success → invalidate `["admin", "users"]` query → dialog closes → toast
7. On error → toast with error message

### Client validation schema

```ts
const adminUserUpdateSchema = z.object({
  fullName: z.string().min(1, "Nombre es requerido").max(150).optional(),
  phone: z.string().min(10).max(20).optional().nullable().or(z.literal("")),
  cedula: z.string().min(8).max(15).regex(/^\d+$/, "Solo números").optional(),
  role: z.enum(["admin", "checker", "client"]).optional(),
  isActive: z.boolean().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Al menos un campo debe ser modificado",
});
```
